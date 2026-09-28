import logging
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.login_attempt import LoginAttempt

logger = logging.getLogger("nlams.login_attempt.service")

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15


class LoginAttemptService:
    """Monitors consecutive failed attempts and enforces temporary lockout."""

    @classmethod
    def check_lockout(cls, email: str, ip: Optional[str], db: Session) -> Tuple[bool, Optional[str]]:
        """Returns (is_locked: bool, reason: str)."""
        record = db.query(LoginAttempt).filter(LoginAttempt.email == email.lower().strip()).first()
        if not record:
            return False, None

        if record.blocked_until and record.blocked_until > datetime.utcnow():
            remaining_mins = max(1, int((record.blocked_until - datetime.utcnow()).total_seconds() / 60))
            return True, f"Account temporarily locked due to repeated failed attempts. Try again in {remaining_mins} minutes."

        # If lockout duration has passed, reset count
        if record.blocked_until and record.blocked_until <= datetime.utcnow():
            record.count = 0
            record.blocked_until = None
            db.commit()

        return False, None

    @classmethod
    def record_failure(cls, email: str, ip: Optional[str], db: Session) -> int:
        """Records a failed attempt and locks account if threshold reached."""
        clean_email = email.lower().strip()
        record = db.query(LoginAttempt).filter(LoginAttempt.email == clean_email).first()

        if not record:
            record = LoginAttempt(
                email=clean_email,
                ip=ip,
                count=1,
                last_attempt_at=datetime.utcnow(),
            )
            db.add(record)
        else:
            record.count += 1
            record.ip = ip
            record.last_attempt_at = datetime.utcnow()

            if record.count >= MAX_FAILED_ATTEMPTS:
                record.blocked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
                logger.warning(f"Account {clean_email} locked until {record.blocked_until} after {record.count} failures")

        db.commit()
        return record.count

    @classmethod
    def record_success(cls, email: str, db: Session):
        """Resets failed attempt count upon successful authentication."""
        clean_email = email.lower().strip()
        record = db.query(LoginAttempt).filter(LoginAttempt.email == clean_email).first()
        if record:
            record.count = 0
            record.blocked_until = None
            db.commit()
