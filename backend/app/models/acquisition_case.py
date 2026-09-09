from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class AcquisitionCase(Base):
    __tablename__ = "acquisition_cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(100), unique=True, nullable=False, index=True)
    project_name = Column(String(200), nullable=False)
    status = Column(String(50), nullable=False, default="DRAFT", index=True)
    jurisdiction_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    jurisdiction = relationship("Jurisdiction")

    def __repr__(self) -> str:
        return f"<AcquisitionCase(id={self.id}, case_no='{self.case_number}', status='{self.status}', jur_id={self.jurisdiction_id})>"
