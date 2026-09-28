from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.base import Base


class OfficialEmailDomain(Base):
    __tablename__ = "official_email_domains"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(100), unique=True, nullable=False, index=True)
    organization_name = Column(String(200), nullable=False)
    department = Column(String(200), nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<OfficialEmailDomain(domain='{self.domain}', active={self.active})>"
