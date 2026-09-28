import logging
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import hash_token
from app.models.user_session import UserSession

logger = logging.getLogger("nlams.session.service")


class SessionService:
    """Manages secure user sessions, refresh token rotation, device tracking, and revocation."""

    @classmethod
    def create_session(
        cls,
        user_id: int,
        refresh_token: str,
        db: Session,
        device_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> UserSession:
        """Stores a new hashed refresh token session."""
        token_hash = hash_token(refresh_token)
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        session = UserSession(
            user_id=user_id,
            refresh_token_hash=token_hash,
            device_id=device_id,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.utcnow(),
            expires_at=expires_at,
            revoked_at=None,
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        logger.info(f"Created session {session.id} for user_id {user_id}")
        return session

    @classmethod
    def validate_and_rotate_session(
        cls,
        old_refresh_token: str,
        new_refresh_token: str,
        db: Session,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Optional[UserSession]:
        """Validates existing session by hashed token and performs refresh token rotation.
        
        Revokes old session and creates a new one.
        """
        old_hash = hash_token(old_refresh_token)
        current_session = (
            db.query(UserSession)
            .filter(
                UserSession.refresh_token_hash == old_hash,
                UserSession.revoked_at.is_(None),
            )
            .first()
        )

        if not current_session:
            logger.warning("Attempted token refresh with non-existent or revoked session")
            return None

        if current_session.expires_at < datetime.utcnow():
            logger.warning(f"Session {current_session.id} has expired")
            current_session.revoked_at = datetime.utcnow()
            db.commit()
            return None

        # Revoke old session (Rotation)
        current_session.revoked_at = datetime.utcnow()

        # Create new rotated session
        new_hash = hash_token(new_refresh_token)
        new_session = UserSession(
            user_id=current_session.user_id,
            refresh_token_hash=new_hash,
            device_id=current_session.device_id,
            ip_address=ip_address or current_session.ip_address,
            user_agent=user_agent or current_session.user_agent,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            revoked_at=None,
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        logger.info(f"Rotated session {current_session.id} -> {new_session.id} for user_id {new_session.user_id}")
        return new_session

    @classmethod
    def revoke_session(
        cls,
        refresh_token: str,
        db: Session,
    ) -> bool:
        """Revokes an active session by its refresh token."""
        token_hash = hash_token(refresh_token)
        session = (
            db.query(UserSession)
            .filter(
                UserSession.refresh_token_hash == token_hash,
                UserSession.revoked_at.is_(None),
            )
            .first()
        )
        if session:
            session.revoked_at = datetime.utcnow()
            db.commit()
            logger.info(f"Revoked session {session.id} for user_id {session.user_id}")
            return True
        return False

    @classmethod
    def revoke_all_user_sessions(cls, user_id: int, db: Session) -> int:
        """Revokes all active sessions for a given user (security reset)."""
        active_sessions = (
            db.query(UserSession)
            .filter(
                UserSession.user_id == user_id,
                UserSession.revoked_at.is_(None),
            )
            .all()
        )
        for s in active_sessions:
            s.revoked_at = datetime.utcnow()
        db.commit()
        return len(active_sessions)
