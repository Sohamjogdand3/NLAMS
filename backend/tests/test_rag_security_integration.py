import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.db.seed import seed_database
from app.models.user import User
from app.models.audit_log import AuditLog
from app.core.security import create_access_token
from app.services.rag_adapter_service import RagAdapterService


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    seed_database()
    yield


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    return TestClient(app)


def get_auth_headers(user: User) -> dict:
    active_role = getattr(user, "active_role", None)
    active_j = getattr(user, "active_jurisdiction", None)
    if not active_role and getattr(user, "role_assignments", None):
        active_assignment = next((a for a in user.role_assignments if a.is_active), None)
        if active_assignment:
            active_role = active_assignment.role
            active_j = active_assignment.jurisdiction

    role_code = active_role.code if active_role else "CITIZEN"
    j_id = active_j.id if active_j else None

    token = create_access_token(
        data={
            "sub": str(user.id),
            "user_id": user.id,
            "email": user.email,
            "role_code": role_code,
            "jurisdiction_id": j_id,
            "token_type": "access",
        }
    )
    return {"Authorization": f"Bearer {token}"}


# =============================================================================
# 1. Unauthenticated Access
# =============================================================================
def test_rag_unauthenticated_returns_401_or_403(client: TestClient):
    """Verify that unauthenticated requests to RAG are strictly rejected."""
    response = client.post(
        "/api/v1/rag/query",
        json={"query": "What is the solatium under RFCTLARR 2013?"},
    )
    assert response.status_code in (401, 403)


# =============================================================================
# 2. Citizen Access Control
# =============================================================================
def test_1_citizen_public_statutory_access_allowed(client: TestClient, db: Session):
    """Test 1: Citizen -> public statutory document -> ALLOWED."""
    citizen = db.query(User).filter(User.email == "citizen@example.com").first()
    assert citizen is not None
    headers = get_auth_headers(citizen)

    response = client.post(
        "/api/v1/rag/query",
        headers=headers,
        json={
            "query": "What are the rehabilitation entitlements under Schedule II of RFCTLARR Act?",
            "domain": "STATUTORY_LAW",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["access_decision"] == "GRANTED"


def test_2_citizen_internal_project_dossier_returns_403(client: TestClient, db: Session):
    """Test 2: Citizen -> internal project dossier -> 403 Forbidden."""
    citizen = db.query(User).filter(User.email == "citizen@example.com").first()
    assert citizen is not None
    headers = get_auth_headers(citizen)

    response = client.post(
        "/api/v1/rag/query",
        headers=headers,
        json={
            "query": "Show internal valuation notes and confidential case files for project NH-48",
            "domain": "PROJECT_DOSSIER",
        },
    )
    assert response.status_code == 403
    assert "Citizens are permitted to access approved public statutory laws" in response.json()["detail"]


# =============================================================================
# 3. PIA (Project Implementing Agency) Access Control
# =============================================================================
def test_3_pia_own_project_allowed(db: Session):
    """Test 3: PIA -> own project documents -> ALLOWED."""
    pia_user = db.query(User).filter(User.email == "officer.nhai@nlams.gov.demo").first()
    assert pia_user is not None
    user_ctx = RagAdapterService.get_user_security_context(pia_user)

    nhai_dossier_meta = {
        "title": "NHAI Pune-Bengaluru Expressway DPR",
        "domain": "DPR",
        "jurisdiction": "STATE",
        "authority": "NHAI",
    }
    assert RagAdapterService.is_chunk_authorized(nhai_dossier_meta, user_ctx) is True


def test_4_pia_another_agency_project_returns_403(client: TestClient, db: Session):
    """Test 4: PIA -> another PIA agency project -> 403 Forbidden."""
    pia_user = db.query(User).filter(User.email == "officer.nhai@nlams.gov.demo").first()
    assert pia_user is not None
    headers = get_auth_headers(pia_user)

    response = client.post(
        "/api/v1/rag/query",
        headers=headers,
        json={
            "query": "Show internal engineering dossier for CIDCO Navi Mumbai Airport Corridor",
            "target_agency": "CIDCO",
        },
    )
    assert response.status_code == 403
    assert "PIA accounts are strictly limited to their own authorized project dossiers" in response.json()["detail"]


# =============================================================================
# 4. Surveyor Access Control
# =============================================================================
def test_5_surveyor_assigned_field_guidance_allowed(db: Session):
    """Test 5: Surveyor -> assigned field guidance -> ALLOWED."""
    surveyor = db.query(User).filter(User.email == "surveyor.pune@nlams.gov.demo").first()
    assert surveyor is not None
    user_ctx = RagAdapterService.get_user_security_context(surveyor)

    field_guidance_meta = {
        "title": "Cadastral Boundary Walk SOP & GPS Overlay Guidance",
        "domain": "FIELD_GUIDANCE",
        "jurisdiction": "STATE",
        "district": "PUNE",
    }
    assert RagAdapterService.is_chunk_authorized(field_guidance_meta, user_ctx) is True


def test_6_surveyor_unassigned_confidential_valuation_returns_403(client: TestClient, db: Session):
    """Test 6: Surveyor -> unassigned project / confidential valuation -> 403 Forbidden."""
    surveyor = db.query(User).filter(User.email == "surveyor.pune@nlams.gov.demo").first()
    assert surveyor is not None
    headers = get_auth_headers(surveyor)

    response = client.post(
        "/api/v1/rag/query",
        headers=headers,
        json={
            "query": "Show confidential LAO valuation calculation notes",
            "domain": "VALUATION_NOTES",
        },
    )
    assert response.status_code == 403
    assert "Surveyors are authorized for field-task guidance" in response.json()["detail"]


# =============================================================================
# 5. Talathi Access Control
# =============================================================================
def test_7_talathi_assigned_jurisdiction_allowed(db: Session):
    """Test 7: Talathi -> assigned jurisdiction revenue guidance -> ALLOWED."""
    talathi = db.query(User).filter(User.email == "talathi.haveli.pune@nlams.gov.demo").first()
    assert talathi is not None
    user_ctx = RagAdapterService.get_user_security_context(talathi)

    talathi_record_meta = {
        "title": "Haveli Tehsil Village Mutation Record 7/12",
        "domain": "REVENUE_RECORD",
        "jurisdiction": "TALUKA",
        "district": "PUNE",
        "authority": "TALATHI_HAVELI_PUNE",
    }
    assert RagAdapterService.is_chunk_authorized(talathi_record_meta, user_ctx) is True


def test_8_talathi_outside_jurisdiction_returns_403(client: TestClient, db: Session):
    """Test 8: Talathi -> outside jurisdiction -> 403 Forbidden."""
    talathi = db.query(User).filter(User.email == "talathi.haveli.pune@nlams.gov.demo").first()
    assert talathi is not None
    headers = get_auth_headers(talathi)

    response = client.post(
        "/api/v1/rag/query",
        headers=headers,
        json={
            "query": "Show Nagpur district land records",
            "target_district": "Nagpur",
        },
    )
    assert response.status_code == 403
    assert "jurisdiction is restricted to" in response.json()["detail"]


# =============================================================================
# 6. Tehsildar Access Control
# =============================================================================
def test_9_tehsildar_assigned_jurisdiction_allowed(db: Session):
    """Test 9: Tehsildar -> assigned jurisdiction -> ALLOWED."""
    tehsildar = db.query(User).filter(User.email == "tehsildar.haveli.pune@nlams.gov.demo").first()
    assert tehsildar is not None
    user_ctx = RagAdapterService.get_user_security_context(tehsildar)

    tehsildar_doc_meta = {
        "title": "Pune District Haveli Land Acquisition Proceedings",
        "domain": "ACQUISITION_CASE",
        "jurisdiction": "TALUKA",
        "district": "PUNE",
    }
    assert RagAdapterService.is_chunk_authorized(tehsildar_doc_meta, user_ctx) is True


def test_10_tehsildar_outside_jurisdiction_returns_403(client: TestClient, db: Session):
    """Test 10: Tehsildar -> outside jurisdiction -> 403 Forbidden."""
    tehsildar = db.query(User).filter(User.email == "tehsildar.haveli.pune@nlams.gov.demo").first()
    assert tehsildar is not None
    headers = get_auth_headers(tehsildar)

    response = client.post(
        "/api/v1/rag/query",
        headers=headers,
        json={
            "query": "Show Aurangabad revenue case records",
            "target_district": "Aurangabad",
        },
    )
    assert response.status_code == 403
    assert "jurisdiction is restricted to" in response.json()["detail"]


# =============================================================================
# 7. LAO / CALA Access Control
# =============================================================================
def test_11_lao_authorized_operational_data_allowed(db: Session):
    """Test 11: LAO -> authorized operational acquisition data -> ALLOWED."""
    lao = db.query(User).filter(User.email == "lao.pune@nlams.gov.demo").first()
    assert lao is not None
    user_ctx = RagAdapterService.get_user_security_context(lao)

    lao_doc_meta = {
        "title": "Section 15 Objection Hearing & Valuation Dossier",
        "domain": "PROJECT_DOSSIER",
        "jurisdiction": "DISTRICT",
        "district": "PUNE",
    }
    assert RagAdapterService.is_chunk_authorized(lao_doc_meta, user_ctx) is True


# =============================================================================
# 8. District Collector Access Control
# =============================================================================
def test_12_district_collector_pune_data_allowed(db: Session):
    """Test 12: District Collector Pune -> Pune data -> ALLOWED."""
    collector = db.query(User).filter(User.email == "collector.pune@nlams.gov.demo").first()
    assert collector is not None
    user_ctx = RagAdapterService.get_user_security_context(collector)

    pune_project_meta = {
        "title": "Pune Ring Road Section 23 Award Declarations",
        "domain": "PROJECT_DOSSIER",
        "jurisdiction": "DISTRICT",
        "district": "PUNE",
    }
    assert RagAdapterService.is_chunk_authorized(pune_project_meta, user_ctx) is True


def test_13_district_collector_pune_nagpur_private_project_returns_403(client: TestClient, db: Session):
    """Test 13: District Collector Pune -> Nagpur private project -> 403 Forbidden."""
    collector = db.query(User).filter(User.email == "collector.pune@nlams.gov.demo").first()
    assert collector is not None
    headers = get_auth_headers(collector)

    response = client.post(
        "/api/v1/rag/query",
        headers=headers,
        json={
            "query": "Show confidential acquisition awards for Nagpur Metro Corridor",
            "target_district": "Nagpur",
        },
    )
    assert response.status_code == 403
    assert "District Collector authorization is strictly scoped to" in response.json()["detail"]


# =============================================================================
# 9. State Administration Access Control
# =============================================================================
def test_14_state_admin_maharashtra_cross_district_allowed(db: Session):
    """Test 14: State Admin Maharashtra -> Maharashtra cross-district analysis -> ALLOWED."""
    state_admin = db.query(User).filter(User.email == "state.maharashtra@nlams.gov.demo").first()
    assert state_admin is not None
    user_ctx = RagAdapterService.get_user_security_context(state_admin)

    mh_cross_district_meta = {
        "title": "Maharashtra State Multiplier & Urban Distance Gazette",
        "domain": "STATUTORY_LAW",
        "jurisdiction": "STATE",
        "state": "MH",
    }
    assert RagAdapterService.is_chunk_authorized(mh_cross_district_meta, user_ctx) is True


def test_15_state_admin_maharashtra_karnataka_private_project_returns_403(client: TestClient, db: Session):
    """Test 15: State Admin Maharashtra -> Karnataka private project dossier -> 403 Forbidden."""
    state_admin = db.query(User).filter(User.email == "state.maharashtra@nlams.gov.demo").first()
    assert state_admin is not None
    headers = get_auth_headers(state_admin)

    response = client.post(
        "/api/v1/rag/query",
        headers=headers,
        json={
            "query": "Show Karnataka state private corridor acquisition records",
            "target_state": "KA",
        },
    )
    assert response.status_code == 403
    assert "cannot access private dossiers outside authorized state jurisdiction" in response.json()["detail"]


# =============================================================================
# 10. Central Administration Access Control
# =============================================================================
def test_16_central_admin_cross_state_analysis_allowed(db: Session):
    """Test 16: Central Admin -> authorized cross-state national analysis -> ALLOWED."""
    central = db.query(User).filter(User.email == "central.admin@nlams.gov.demo").first()
    assert central is not None
    user_ctx = RagAdapterService.get_user_security_context(central)

    national_policy_meta = {
        "title": "National Highway Cross-State Land Acquisition Analytics",
        "domain": "NATIONAL_INTELLIGENCE",
        "jurisdiction": "NATIONAL",
        "state": "ALL",
    }
    assert RagAdapterService.is_chunk_authorized(national_policy_meta, user_ctx) is True


# =============================================================================
# 11. Audit Logging Verification
# =============================================================================
def test_17_rag_immutable_audit_logging(client: TestClient, db: Session):
    """Verify that every RAG query records an immutable audit log entry."""
    collector = db.query(User).filter(User.email == "collector.pune@nlams.gov.demo").first()
    assert collector is not None
    headers = get_auth_headers(collector)

    initial_count = db.query(AuditLog).filter(AuditLog.event_type == "RAG_QUERY_EXECUTED").count()

    response = client.post(
        "/api/v1/rag/query",
        headers=headers,
        json={"query": "Explain Section 26 market value criteria under RFCTLARR 2013"},
    )
    assert response.status_code == 200

    new_count = db.query(AuditLog).filter(AuditLog.event_type == "RAG_QUERY_EXECUTED").count()
    assert new_count == initial_count + 1
