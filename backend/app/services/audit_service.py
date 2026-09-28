import logging
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

logger = logging.getLogger("nlams.audit.service")


class AuditService:
    """Provides immutable audit trail logging for all authentication & security events."""

    @classmethod
    def log_event(
        cls,
        db: Session,
        event_type: str,
        actor_id: Optional[int] = None,
        actor_email: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        jurisdiction_id: Optional[int] = None,
        entity_name: Optional[str] = None,
        entity_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        """Writes an immutable record to the audit_logs table."""
        try:
            audit = AuditLog(
                event_type=event_type,
                actor_id=actor_id,
                actor_email=actor_email,
                ip_address=ip_address,
                user_agent=user_agent,
                jurisdiction_id=jurisdiction_id,
                entity_name=entity_name or "AUTH",
                entity_id=entity_id,
                details=details or {},
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
            db.refresh(audit)
            logger.info(f"AUDIT [{event_type}] Actor: {actor_email or actor_id} IP: {ip_address}")
            return audit
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to write audit log: {str(e)}")
            return None
