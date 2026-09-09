from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import User
from app.models.role import Role
from app.models.jurisdiction import Jurisdiction
from app.models.user_role_jurisdiction import UserRoleJurisdiction
from app.schemas.auth import (
    CitizenLoginRequest,
    OfficialLoginRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserMeResponse,
    UserOut,
    RoleOut,
    JurisdictionOut,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

MOCK_VALID_OTP = "123456"


@router.post("/login/citizen", response_model=TokenResponse)
def login_citizen(
    payload: CitizenLoginRequest,
    db: Session = Depends(get_db),
):
    """Citizen login via Mobile Number + OTP.

    Auto-registers new citizens with the CITIZEN role if they do not exist yet.
    """
    if payload.otp != MOCK_VALID_OTP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. Use mock OTP: '123456'",
        )

    # 1. Fetch or create Citizen Role
    citizen_role = db.query(Role).filter(Role.code == "CITIZEN").first()
    if not citizen_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Citizen role not initialized in database",
        )

    # 2. Find or create citizen user
    user = db.query(User).filter(User.mobile_number == payload.mobile_number).first()
    if not user:
        user = User(
            full_name=f"Citizen {payload.mobile_number[-4:]}",
            mobile_number=payload.mobile_number,
            is_active=True,
        )
        db.add(user)
        db.flush()

        # Assign Citizen role
        urj = UserRoleJurisdiction(
            user_id=user.id,
            role_id=citizen_role.id,
            jurisdiction_id=None,
            is_active=True,
        )
        db.add(urj)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Citizen account has been deactivated",
        )

    # Fetch active assignment
    assignment = (
        db.query(UserRoleJurisdiction)
        .filter(UserRoleJurisdiction.user_id == user.id, UserRoleJurisdiction.is_active == True)
        .first()
    )

    assigned_role = assignment.role if assignment else citizen_role
    assigned_jurisdiction = assignment.jurisdiction if assignment else None

    # 3. Create tokens
    token_claims = {
        "sub": str(user.id),
        "user_id": user.id,
        "role_code": assigned_role.code,
        "jurisdiction_id": assigned_jurisdiction.id if assigned_jurisdiction else None,
        "full_name": user.full_name,
        "mobile_number": user.mobile_number,
    }

    access_token = create_access_token(token_claims)
    refresh_token = create_refresh_token(token_claims)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
        role=RoleOut.model_validate(assigned_role),
        jurisdiction=JurisdictionOut.model_validate(assigned_jurisdiction) if assigned_jurisdiction else None,
    )


@router.post("/login/official", response_model=TokenResponse)
def login_official(
    payload: OfficialLoginRequest,
    db: Session = Depends(get_db),
):
    """Official login via Employee ID + Password + 2FA OTP."""
    # 1. Verify 2FA OTP
    if payload.otp and payload.otp != MOCK_VALID_OTP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 2FA OTP. Use mock OTP: '123456'",
        )

    # 2. Find official by emp_id
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

    # 3. Verify Password
    if not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Employee ID or credentials",
        )

    # 4. Fetch primary active Role & Jurisdiction assignment
    assignment = (
        db.query(UserRoleJurisdiction)
        .filter(UserRoleJurisdiction.user_id == user.id, UserRoleJurisdiction.is_active == True)
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active role or jurisdiction assigned to this account",
        )

    assigned_role = assignment.role
    assigned_jurisdiction = assignment.jurisdiction

    # 5. Generate tokens
    token_claims = {
        "sub": str(user.id),
        "user_id": user.id,
        "emp_id": user.emp_id,
        "role_code": assigned_role.code,
        "jurisdiction_id": assigned_jurisdiction.id if assigned_jurisdiction else None,
        "jurisdiction_type": assigned_jurisdiction.type.value if assigned_jurisdiction else None,
        "full_name": user.full_name,
    }

    access_token = create_access_token(token_claims)
    refresh_token = create_refresh_token(token_claims)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
        role=RoleOut.model_validate(assigned_role),
        jurisdiction=JurisdictionOut.model_validate(assigned_jurisdiction) if assigned_jurisdiction else None,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token_endpoint(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """Exchange a valid refresh token for a fresh access and refresh token pair."""
    try:
        decoded = decode_token(payload.refresh_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid refresh token: {str(e)}",
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

    role_code = decoded.get("role_code")
    role = db.query(Role).filter(Role.code == role_code).first() if role_code else None

    jur_id = decoded.get("jurisdiction_id")
    jurisdiction = db.query(Jurisdiction).filter(Jurisdiction.id == int(jur_id)).first() if jur_id else None

    if not role:
        assignment = (
            db.query(UserRoleJurisdiction)
            .filter(UserRoleJurisdiction.user_id == user.id, UserRoleJurisdiction.is_active == True)
            .first()
        )
        if assignment:
            role = assignment.role
            jurisdiction = assignment.jurisdiction

    token_claims = {
        "sub": str(user.id),
        "user_id": user.id,
        "emp_id": user.emp_id,
        "role_code": role.code if role else None,
        "jurisdiction_id": jurisdiction.id if jurisdiction else None,
        "full_name": user.full_name,
    }

    new_access_token = create_access_token(token_claims)
    new_refresh_token = create_refresh_token(token_claims)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user=UserOut.model_validate(user),
        role=RoleOut.model_validate(role) if role else RoleOut(id=0, name="Unknown", code="UNKNOWN"),
        jurisdiction=JurisdictionOut.model_validate(jurisdiction) if jurisdiction else None,
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
    active_jurisdiction = getattr(current_user, "active_jurisdiction", None)

    return UserMeResponse(
        user=UserOut.model_validate(current_user),
        active_role=RoleOut.model_validate(active_role) if active_role else RoleOut(id=0, name="Unknown", code="UNKNOWN"),
        active_jurisdiction=JurisdictionOut.model_validate(active_jurisdiction) if active_jurisdiction else None,
        assignments=assignments_data,
    )
