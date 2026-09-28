from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.db.base import Base


class OTPSession(Base):
    __tablename__ = "otp_sessions"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), index=True, nullable=False)
    otp_hash = Column(String(255), nullable=False)
    purpose = Column(String(50), nullable=False, default="LOGIN")  # OFFICIAL_LOGIN, CITIZEN_LOGIN
    expires_at = Column(DateTime, nullable=False, index=True)
    attempts = Column(Integer, default=0, nullable=False)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<OTPSession(email='{self.email}', purpose='{self.purpose}', attempts={self.attempts})>"
