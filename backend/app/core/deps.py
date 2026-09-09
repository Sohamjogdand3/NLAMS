from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.role import Role
from app.models.jurisdiction import Jurisdiction
from app.models.user_role_jurisdiction import UserRoleJurisdiction

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Dependency that decodes JWT access token and returns the authenticated User

    with their active Role and Jurisdiction attached.
    """
    token = credentials.credentials
    try:
        payload = decode_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("token_type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type: access token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id") or payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing user identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Resolve active role and jurisdiction from token claims
    role_code = payload.get("role_code")
    jurisdiction_id = payload.get("jurisdiction_id")

    active_role = None
    if role_code:
        active_role = db.query(Role).filter(Role.code == role_code).first()

    active_jurisdiction = None
    if jurisdiction_id:
        active_jurisdiction = db.query(Jurisdiction).filter(Jurisdiction.id == int(jurisdiction_id)).first()

    # Fallback to user's first active assignment if not in claims
    if not active_role:
        assignment = (
            db.query(UserRoleJurisdiction)
            .filter(UserRoleJurisdiction.user_id == user.id, UserRoleJurisdiction.is_active == True)
            .first()
        )
        if assignment:
            active_role = assignment.role
            active_jurisdiction = assignment.jurisdiction

    # Attach dynamic context to the user instance
    setattr(user, "active_role", active_role)
    setattr(user, "active_jurisdiction", active_jurisdiction)

    return user
