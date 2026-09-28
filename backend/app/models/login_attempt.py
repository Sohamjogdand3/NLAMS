from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.db.base import Base


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), index=True, nullable=False)
    ip = Column(String(50), nullable=True, index=True)
    count = Column(Integer, default=1, nullable=False)
    blocked_until = Column(DateTime, nullable=True)
    last_attempt_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<LoginAttempt(email='{self.email}', count={self.count}, blocked_until={self.blocked_until})>"
