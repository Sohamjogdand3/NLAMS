from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.jurisdiction import Jurisdiction
from app.models.official_email_domain import OfficialEmailDomain
from app.models.role import Role
from app.models.user import User
from app.models.user_role_jurisdiction import UserRoleJurisdiction
from app.models.user_session import UserSession
from app.schemas.auth import (
    CitizenLoginRequest,
    CitizenRequestOTPRequest,
    CitizenVerifyOTPRequest,
    JurisdictionOut,
    LogoutRequest,
    LogoutResponse,
    OfficialLoginRequest,
    OfficialRequestOTPRequest,
    OfficialVerifyOTPRequest,
    OTPRequestResponse,
    RefreshTokenRequest,
    RoleOut,
    TokenResponse,
    UserMeResponse,
    UserOut,
)
from app.services.audit_service import AuditService
from app.services.identity.email_otp_provider import EmailOTPProvider
from app.services.login_attempt_service import LoginAttemptService
from app.services.otp_service import OTPService
from app.services.session_service import SessionService

router = APIRouter(prefix="/auth", tags=["Authentication"])

email_otp_provider = EmailOTPProvider()


def get_client_ip(request: Request) -> str:
    """Extract client IP from request headers or client socket."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def mask_email(email: str) -> str:
    """Mask email for privacy in response payloads (e.g. c***r@nlams.gov.demo)."""
    try:
        parts = email.split("@")
        username = parts[0]
        domain = parts[1]
        if len(username) <= 2:
            masked_user = username[0] + "*"
        else:
            masked_user = username[0] + "*" * (len(username) - 2) + username[-1]
        return f"{masked_user}@{domain}"
    except Exception:
        return email


# ==============================================================================
# OFFICIAL AUTHENTICATION ENDPOINTS
# ==============================================================================

@router.post("/official/request-otp", response_model=OTPRequestResponse)
def official_request_otp(
    payload: OfficialRequestOTPRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Step 1 for Government Officials: Validate official domain & identity, generate & send OTP."""
    email_clean = payload.email.lower().strip()
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "Unknown")

    # 1. Validate Email Domain against approved government domains
    domain_part = email_clean.split("@")[-1]
    approved_domain = (
        db.query(OfficialEmailDomain)
        .filter(OfficialEmailDomain.domain == domain_part, OfficialEmailDomain.active == True)
        .first()
    )

    if not approved_domain:
        AuditService.log_event(
            db=db,
            event_type="UNAUTHORIZED_DOMAIN_ACCESS",
            actor_email=email_clean,
            ip_address=client_ip,
            user_agent=user_agent,
            details={"attempted_domain": domain_part},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Domain '@{domain_part}' is not an approved government identity domain. "
                "Personal emails (Gmail, Yahoo, etc.) are strictly prohibited for official access."
            ),
        )

    # 2. Check Brute-force Lockout
    is_locked, lock_reason = LoginAttemptService.check_lockout(email_clean, client_ip, db)
    if is_locked:
        AuditService.log_event(
            db=db,
            event_type="LOGIN_LOCKED_ATTEMPT",
            actor_email=email_clean,
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": lock_reason},
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=lock_reason,
        )

    # 3. Verify Employee / User exists
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        LoginAttemptService.record_failure(email_clean, client_ip, db)
        AuditService.log_event(
            db=db,
            event_type="LOGIN_UNKNOWN_OFFICIAL",
            actor_email=email_clean,
            ip_address=client_ip,
            user_agent=user_agent,
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Official identity record not found for this government email address.",
        )

    if not user.is_active:
        AuditService.log_event(
            db=db,
            event_type="DEACTIVATED_ACCOUNT_LOGIN",
            actor_id=user.id,
            actor_email=email_clean,
            ip_address=client_ip,
            user_agent=user_agent,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your official government account is currently inactive. Contact your Nodal Admin.",
        )

    # 4. Verify Active Role & Jurisdiction Assignment
    assignment = (
        db.query(UserRoleJurisdiction)
        .filter(UserRoleJurisdiction.user_id == user.id, UserRoleJurisdiction.is_active == True)
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active administrative role or jurisdiction assigned to this official.",
        )

    # 5. Generate & Send OTP
    success, msg, cooldown = OTPService.generate_and_send_otp(
        email=email_clean,
        purpose="OFFICIAL_LOGIN",
        db=db,
        full_name=user.full_name,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=msg,
        )

    # 6. Audit Logging
    AuditService.log_event(
        db=db,
        event_type="OFFICIAL_OTP_REQUESTED",
        actor_id=user.id,
        actor_email=email_clean,
        ip_address=client_ip,
        user_agent=user_agent,
        jurisdiction_id=assignment.jurisdiction_id,
        details={"role_code": assignment.role.code},
    )

    return OTPRequestResponse(
        message=msg,
        identifier_masked=mask_email(email_clean),
        expires_in_seconds=settings.OTP_TTL_SECONDS,
        cooldown_seconds=cooldown,
        provider="gov_demo_idp",
    )


@router.post("/official/verify-otp", response_model=TokenResponse)
def official_verify_otp(
    payload: OfficialVerifyOTPRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Step 2 for Government Officials: Verify OTP, issue JWT & rotate secure session."""
    email_clean = payload.email.lower().strip()
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "Unknown")

    # 1. Check lockout
    is_locked, lock_reason = LoginAttemptService.check_lockout(email_clean, client_ip, db)
    if is_locked:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=lock_reason,
        )

    # 2. Verify OTP
    verified, verify_msg = OTPService.verify_otp(
        email=email_clean,
        entered_otp=payload.otp,
        purpose="OFFICIAL_LOGIN",
        db=db,
    )

    if not verified:
        LoginAttemptService.record_failure(email_clean, client_ip, db)
        AuditService.log_event(
            db=db,
            event_type="LOGIN_FAILURE",
            actor_email=email_clean,
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": verify_msg},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=verify_msg,
        )

    # 3. Retrieve User & Role Assignment
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not found or inactive",
        )

    assignment = (
        db.query(UserRoleJurisdiction)
        .filter(UserRoleJurisdiction.user_id == user.id, UserRoleJurisdiction.is_active == True)
        .first()
    )
    assigned_role = assignment.role if assignment else None
    assigned_jurisdiction = assignment.jurisdiction if assignment else None

    # Reset failure counters
    LoginAttemptService.record_success(email_clean, db)

    # 4. Generate Tokens
    token_claims = {
        "sub": str(user.id),
        "user_id": user.id,
        "emp_id": user.emp_id,
        "email": user.email,
        "role_code": assigned_role.code if assigned_role else None,
        "jurisdiction_id": assigned_jurisdiction.id if assigned_jurisdiction else None,
        "jurisdiction_type": assigned_jurisdiction.type.value if assigned_jurisdiction else None,
        "full_name": user.full_name,
    }

    access_token = create_access_token(token_claims)
    refresh_token = create_refresh_token(token_claims)

    # 5. Create Secure Session record
    SessionService.create_session(
        user_id=user.id,
        refresh_token=refresh_token,
        db=db,
        device_id=payload.device_id,
        ip_address=client_ip,
        user_agent=user_agent,
    )

    # 6. Audit Logging
    AuditService.log_event(
        db=db,
        event_type="LOGIN_SUCCESS",
        actor_id=user.id,
        actor_email=email_clean,
        ip_address=client_ip,
        user_agent=user_agent,
        jurisdiction_id=assigned_jurisdiction.id if assigned_jurisdiction else None,
        details={"auth_method": "GOV_EMAIL_OTP", "role": assigned_role.code if assigned_role else None},
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
        role=RoleOut.model_validate(assigned_role) if assigned_role else RoleOut(id=0, name="Official", code="OFFICIAL"),
        jurisdiction=JurisdictionOut.model_validate(assigned_jurisdiction) if assigned_jurisdiction else None,
    )


# ==============================================================================
# CITIZEN AUTHENTICATION ENDPOINTS
# ==============================================================================

@router.post("/citizen/request-otp", response_model=OTPRequestResponse)
def citizen_request_otp(
    payload: CitizenRequestOTPRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Step 1 for Citizens: Initiate Email OTP / Aadhaar Stub login."""
    identifier = payload.email or payload.mobile_number
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an email address or mobile number for Citizen OTP authentication.",
        )

    clean_id = str(identifier).lower().strip()
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "Unknown")

    success, msg, meta = email_otp_provider.initiate_auth(
        identifier=clean_id,
        db=db,
        purpose="CITIZEN_LOGIN",
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=msg,
        )

    AuditService.log_event(
        db=db,
        event_type="CITIZEN_OTP_REQUESTED",
        actor_email=clean_id if "@" in clean_id else None,
        ip_address=client_ip,
        user_agent=user_agent,
        details={"provider": payload.provider or "email_otp"},
    )

    return OTPRequestResponse(
        message=msg,
        identifier_masked=mask_email(clean_id) if "@" in clean_id else f"******{clean_id[-4:]}",
        expires_in_seconds=meta.get("expires_in_seconds", 180),
        cooldown_seconds=meta.get("cooldown_seconds", 60),
        provider=payload.provider or "email_otp",
    )


@router.post("/citizen/verify-otp", response_model=TokenResponse)
def citizen_verify_otp(
    payload: CitizenVerifyOTPRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Step 2 for Citizens: Verify OTP, issue citizen session token."""
    clean_id = payload.identifier.lower().strip()
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "Unknown")

    verified, msg, user = email_otp_provider.verify_auth(
        identifier=clean_id,
        credential=payload.otp,
        db=db,
        purpose="CITIZEN_LOGIN",
    )

    if not verified or not user:
        AuditService.log_event(
            db=db,
            event_type="CITIZEN_LOGIN_FAILURE",
            actor_email=clean_id if "@" in clean_id else None,
            ip_address=client_ip,
            user_agent=user_agent,
            details={"reason": msg},
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg,
        )

    citizen_role = db.query(Role).filter(Role.code == "CITIZEN").first()

    token_claims = {
        "sub": str(user.id),
        "user_id": user.id,
        "email": user.email,
        "mobile_number": user.mobile_number,
        "role_code": "CITIZEN",
        "jurisdiction_id": None,
        "full_name": user.full_name,
    }

    access_token = create_access_token(token_claims)
    refresh_token = create_refresh_token(token_claims)

    SessionService.create_session(
        user_id=user.id,
        refresh_token=refresh_token,
        db=db,
        device_id=payload.device_id,
        ip_address=client_ip,
        user_agent=user_agent,
    )

    AuditService.log_event(
        db=db,
        event_type="LOGIN_SUCCESS",
        actor_id=user.id,
        actor_email=user.email,
        ip_address=client_ip,
        user_agent=user_agent,
        details={"auth_method": "CITIZEN_OTP", "role": "CITIZEN"},
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
        role=RoleOut.model_validate(citizen_role) if citizen_role else RoleOut(id=1, name="Citizen", code="CITIZEN"),
        jurisdiction=None,
    )


# ==============================================================================
# SHARED SESSION MANAGEMENT ENDPOINTS
# ==============================================================================

@router.post("/refresh", response_model=TokenResponse)
def refresh_token_endpoint(
    payload: RefreshTokenRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Rotates refresh token and generates a new access token with session security."""
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "Unknown")

    try:
        decoded = decode_token(payload.refresh_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired refresh token: {str(e)}",
        )

    if decoded.get("token_type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provided token is not a refresh token",
        )

    user_id = decoded.get("user_id") or decoded.get("sub")
    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account deactivated",
        )

    # Fetch role and jurisdiction
    assignment = (
        db.query(UserRoleJurisdiction)
        .filter(UserRoleJurisdiction.user_id == user.id, UserRoleJurisdiction.is_active == True)
        .first()
    )
    role = assignment.role if assignment else None
    jurisdiction = assignment.jurisdiction if assignment else None

    # Generate new claims and tokens
    token_claims = {
        "sub": str(user.id),
        "user_id": user.id,
        "emp_id": user.emp_id,
        "email": user.email,
        "role_code": role.code if role else "CITIZEN",
        "jurisdiction_id": jurisdiction.id if jurisdiction else None,
        "full_name": user.full_name,
    }

    new_access_token = create_access_token(token_claims)
    new_refresh_token = create_refresh_token(token_claims)

    # Rotate session in DB
    new_session = SessionService.validate_and_rotate_session(
        old_refresh_token=payload.refresh_token,
        new_refresh_token=new_refresh_token,
        db=db,
        ip_address=client_ip,
        user_agent=user_agent,
    )

    if not new_session:
        AuditService.log_event(
            db=db,
            event_type="SESSION_ROTATION_FAILED",
            actor_id=user.id,
            actor_email=user.email,
            ip_address=client_ip,
            user_agent=user_agent,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked or expired. Please sign in again.",
        )

    AuditService.log_event(
        db=db,
        event_type="TOKEN_REFRESHED",
        actor_id=user.id,
        actor_email=user.email,
        ip_address=client_ip,
        user_agent=user_agent,
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user=UserOut.model_validate(user),
        role=RoleOut.model_validate(role) if role else RoleOut(id=0, name="User", code="USER"),
        jurisdiction=JurisdictionOut.model_validate(jurisdiction) if jurisdiction else None,
    )


@router.post("/logout", response_model=LogoutResponse)
def logout_endpoint(
    payload: LogoutRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Revokes active session and refresh token."""
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "Unknown")

    if payload.refresh_token:
        SessionService.revoke_session(payload.refresh_token, db)

    AuditService.log_event(
        db=db,
        event_type="LOGOUT",
        ip_address=client_ip,
        user_agent=user_agent,
    )

    return LogoutResponse(
        message="Successfully signed out. Session has been revoked.",
        success=True,
    )


@router.get("/me", response_model=UserMeResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Protected endpoint: Returns current authenticated user profile, active role,
    active jurisdiction, and all assigned roles across jurisdictions.
    """
    assignments_data = []
    assignments = (
        db.query(UserRoleJurisdiction)
        .filter(UserRoleJurisdiction.user_id == current_user.id, UserRoleJurisdiction.is_active == True)
        .all()
    )

    for a in assignments:
        assignments_data.append({
            "id": a.id,
            "role": RoleOut.model_validate(a.role).model_dump(),
            "jurisdiction": JurisdictionOut.model_validate(a.jurisdiction).model_dump() if a.jurisdiction else None,
            "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
            "is_active": a.is_active,
        })

    active_role = getattr(current_user, "active_role", None)
    if not active_role and assignments:
        active_role = assignments[0].role

    active_jurisdiction = getattr(current_user, "active_jurisdiction", None)
    if not active_jurisdiction and assignments:
        active_jurisdiction = assignments[0].jurisdiction

    return UserMeResponse(
        user=UserOut.model_validate(current_user),
        active_role=RoleOut.model_validate(active_role) if active_role else RoleOut(id=0, name="Unknown", code="UNKNOWN"),
        active_jurisdiction=JurisdictionOut.model_validate(active_jurisdiction) if active_jurisdiction else None,
        assignments=assignments_data,
    )


# ==============================================================================
# BACKWARD COMPATIBILITY ENDPOINTS (Legacy frontend / quick fill)
# ==============================================================================

@router.post("/login/citizen", response_model=TokenResponse)
def legacy_login_citizen(
    payload: CitizenLoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Legacy compatibility route for citizen login."""
    identifier = payload.email or payload.mobile_number or "9876543210"
    return citizen_verify_otp(
        payload=CitizenVerifyOTPRequest(identifier=identifier, otp=payload.otp),
        request=request,
        db=db,
    )


@router.post("/login/official", response_model=TokenResponse)
def legacy_login_official(
    payload: OfficialLoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Legacy compatibility route supporting quick password or official email flow."""
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "Unknown")

    user = None
    if payload.email:
        user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    elif payload.emp_id:
        user = db.query(User).filter(User.emp_id == payload.emp_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Employee ID or credentials",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    # Password check if password provided
    if payload.password and user.hashed_password:
        if not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Employee ID or credentials",
            )

    assignment = (
        db.query(UserRoleJurisdiction)
        .filter(UserRoleJurisdiction.user_id == user.id, UserRoleJurisdiction.is_active == True)
        .first()
    )
    assigned_role = assignment.role if assignment else None
    assigned_jurisdiction = assignment.jurisdiction if assignment else None

    token_claims = {
        "sub": str(user.id),
        "user_id": user.id,
        "emp_id": user.emp_id,
        "email": user.email,
        "role_code": assigned_role.code if assigned_role else None,
        "jurisdiction_id": assigned_jurisdiction.id if assigned_jurisdiction else None,
        "full_name": user.full_name,
    }

    access_token = create_access_token(token_claims)
    refresh_token = create_refresh_token(token_claims)

    SessionService.create_session(
        user_id=user.id,
        refresh_token=refresh_token,
        db=db,
        ip_address=client_ip,
        user_agent=user_agent,
    )

    AuditService.log_event(
        db=db,
        event_type="LOGIN_SUCCESS",
        actor_id=user.id,
        actor_email=user.email,
        ip_address=client_ip,
        user_agent=user_agent,
        jurisdiction_id=assigned_jurisdiction.id if assigned_jurisdiction else None,
        details={"auth_method": "LEGACY_CREDENTIAL_SSO"},
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
        role=RoleOut.model_validate(assigned_role) if assigned_role else RoleOut(id=0, name="Official", code="OFFICIAL"),
        jurisdiction=JurisdictionOut.model_validate(assigned_jurisdiction) if assigned_jurisdiction else None,
    )
