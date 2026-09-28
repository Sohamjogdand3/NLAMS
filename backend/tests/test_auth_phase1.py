import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.db.seed import seed_database
from app.models.user import User
from app.models.otp_session import OTPSession
from app.models.user_session import UserSession
from app.models.audit_log import AuditLog
from app.models.login_attempt import LoginAttempt
from app.services.otp_service import OTPService
from app.core.security import hash_otp


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    seed_database()
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def clean_test_state():
    """Ensure clean test state across database and redis before each test."""
    session = SessionLocal()
    session.query(OTPSession).delete()
    session.query(LoginAttempt).delete()
    session.commit()
    session.close()

    r = OTPService.get_redis()
    if r:
        try:
            keys = r.keys("otp:*")
            if keys:
                r.delete(*keys)
        except Exception:
            pass


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_official_request_otp_success(client: TestClient, db: Session):
    """Test official OTP request with a valid government email."""
    email = "collector.pune@nlams.gov.demo"
    response = client.post(
        "/api/v1/auth/official/request-otp",
        json={"email": email},
    )
    assert response.status_code == 200, f"Request failed: {response.json()}"
    data = response.json()
    assert "OTP sent successfully" in data["message"]
    assert data["provider"] == "gov_demo_idp"
    assert data["expires_in_seconds"] == 180

    # Verify Audit Log
    audit = (
        db.query(AuditLog)
        .filter(AuditLog.actor_email == email, AuditLog.event_type == "OFFICIAL_OTP_REQUESTED")
        .order_by(AuditLog.id.desc())
        .first()
    )
    assert audit is not None


def test_official_request_otp_rejects_personal_email(client: TestClient):
    """Test government official login strictly prohibits Gmail/personal domains."""
    response = client.post(
        "/api/v1/auth/official/request-otp",
        json={"email": "officer@gmail.com"},
    )
    assert response.status_code == 400
    assert "not an approved government identity domain" in response.json()["detail"]


def test_official_request_otp_unknown_user(client: TestClient):
    """Test official request with non-existent user on approved domain returns 404."""
    response = client.post(
        "/api/v1/auth/official/request-otp",
        json={"email": "unknown.officer@nlams.gov.demo"},
    )
    assert response.status_code == 404
    assert "Official identity record not found" in response.json()["detail"]


def test_official_verify_otp_flow(client: TestClient, db: Session):
    """Test end-to-end official verify OTP -> token generation -> session creation."""
    email = "lao.pune@nlams.gov.demo"
    
    # 1. Inject fresh OTP
    raw_otp = "889900"
    otp_hash = hash_otp(raw_otp, salt=email)
    
    otp_rec = OTPSession(
        email=email,
        otp_hash=otp_hash,
        purpose="OFFICIAL_LOGIN",
        expires_at=datetime.utcnow() + timedelta(minutes=3),
        attempts=0,
        created_at=datetime.utcnow(),
    )
    db.add(otp_rec)
    db.commit()

    # 2. Verify with wrong OTP first
    bad_res = client.post(
        "/api/v1/auth/official/verify-otp",
        json={"email": email, "otp": "000000"},
    )
    assert bad_res.status_code == 400
    assert "Invalid OTP code" in bad_res.json()["detail"]

    # 3. Verify with correct OTP
    good_res = client.post(
        "/api/v1/auth/official/verify-otp",
        json={"email": email, "otp": raw_otp},
    )
    assert good_res.status_code == 200
    token_data = good_res.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    assert token_data["user"]["email"] == email
    assert token_data["role"]["code"] == "LAO"

    # 4. Verify UserSession created in DB
    user_id = token_data["user"]["id"]
    active_session = db.query(UserSession).filter(UserSession.user_id == user_id, UserSession.revoked_at.is_(None)).first()
    assert active_session is not None


def test_citizen_auth_flow(client: TestClient, db: Session):
    """Test citizen request OTP and verify OTP flow with auto-registration."""
    citizen_email = "citizen.new@example.com"

    # 1. Test request-otp endpoint
    req_res = client.post(
        "/api/v1/auth/citizen/request-otp",
        json={"email": citizen_email},
    )
    assert req_res.status_code == 200
    assert req_res.json()["expires_in_seconds"] == 180

    # 2. Retrieve generated OTP hash from DB or test direct verify
    latest_otp = (
        db.query(OTPSession)
        .filter(OTPSession.email == citizen_email, OTPSession.purpose == "CITIZEN_LOGIN")
        .order_by(OTPSession.id.desc())
        .first()
    )
    assert latest_otp is not None

    # Test verification using a fresh citizen identity
    direct_citizen = "citizen.direct@example.com"
    raw_otp = "654321"
    otp_hash = hash_otp(raw_otp, salt=direct_citizen)

    db_otp = OTPSession(
        email=direct_citizen,
        otp_hash=otp_hash,
        purpose="CITIZEN_LOGIN",
        expires_at=datetime.utcnow() + timedelta(minutes=3),
        attempts=0,
        created_at=datetime.utcnow(),
    )
    db.add(db_otp)
    db.commit()

    verify_res = client.post(
        "/api/v1/auth/citizen/verify-otp",
        json={"identifier": direct_citizen, "otp": raw_otp},
    )
    assert verify_res.status_code == 200
    data = verify_res.json()
    assert data["role"]["code"] == "CITIZEN"
    assert data["user"]["email"] == direct_citizen


def test_token_refresh_and_rotation(client: TestClient, db: Session):
    """Test refresh token rotation."""
    email = "collector.thane@nlams.gov.demo"
    raw_otp = "112233"
    
    db.add(OTPSession(
        email=email,
        otp_hash=hash_otp(raw_otp, salt=email),
        purpose="OFFICIAL_LOGIN",
        expires_at=datetime.utcnow() + timedelta(minutes=3),
        attempts=0,
        created_at=datetime.utcnow(),
    ))
    db.commit()

    login_res = client.post(
        "/api/v1/auth/official/verify-otp",
        json={"email": email, "otp": raw_otp},
    )
    initial_tokens = login_res.json()
    assert "refresh_token" in initial_tokens, f"Login failed: {initial_tokens}"
    old_refresh = initial_tokens["refresh_token"]

    # Exchange for new tokens
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert refresh_res.status_code == 200
    new_tokens = refresh_res.json()
    assert new_tokens["access_token"] != initial_tokens["access_token"]
    assert new_tokens["refresh_token"] != old_refresh

    # Old refresh token should now be revoked (rotation)
    reused_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert reused_res.status_code == 401


def test_logout_endpoint(client: TestClient, db: Session):
    """Test logout endpoint revokes active session."""
    email = "state.maharashtra@nlams.gov.demo"
    raw_otp = "445566"
    
    db.add(OTPSession(
        email=email,
        otp_hash=hash_otp(raw_otp, salt=email),
        purpose="OFFICIAL_LOGIN",
        expires_at=datetime.utcnow() + timedelta(minutes=3),
        attempts=0,
        created_at=datetime.utcnow(),
    ))
    db.commit()

    login_res = client.post(
        "/api/v1/auth/official/verify-otp",
        json={"email": email, "otp": raw_otp},
    )
    tokens = login_res.json()
    assert "refresh_token" in tokens

    # Logout
    logout_res = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True

    # Try refresh with logged out token -> should fail
    refresh_after_logout = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert refresh_after_logout.status_code == 401


def test_get_me_protected(client: TestClient, db: Session):
    """Test /auth/me returns current official profile, role, and jurisdiction."""
    email = "tehsildar.haveli.pune@nlams.gov.demo"
    raw_otp = "778899"
    
    db.add(OTPSession(
        email=email,
        otp_hash=hash_otp(raw_otp, salt=email),
        purpose="OFFICIAL_LOGIN",
        expires_at=datetime.utcnow() + timedelta(minutes=3),
        attempts=0,
        created_at=datetime.utcnow(),
    ))
    db.commit()

    login_res = client.post(
        "/api/v1/auth/official/verify-otp",
        json={"email": email, "otp": raw_otp},
    )
    assert "access_token" in login_res.json(), f"Login failed: {login_res.json()}"
    token = login_res.json()["access_token"]

    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["user"]["email"] == email
    assert me_data["active_role"]["code"] == "TEHSILDAR"
    assert me_data["active_jurisdiction"]["name"] == "Haveli"
