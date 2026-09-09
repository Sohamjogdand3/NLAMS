from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class LandRecord(Base):
    __tablename__ = "land_records"

    id = Column(Integer, primary_key=True, index=True)
    survey_number = Column(String(50), nullable=False, index=True)
    owner_name = Column(String(150), nullable=False)
    area_acres = Column(Float, nullable=False, default=1.0)
    jurisdiction_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationships
    jurisdiction = relationship("Jurisdiction")

    def __repr__(self) -> str:
        return f"<LandRecord(id={self.id}, survey='{self.survey_number}', owner='{self.owner_name}', jur_id={self.jurisdiction_id})>"
