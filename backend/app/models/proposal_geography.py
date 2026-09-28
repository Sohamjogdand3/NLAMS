from datetime import datetime
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class ProposalGeographyMapping(Base):
    """
    Relational geography mapping table linking Project Proposals to the
    National Administrative Hierarchy (State -> District -> Taluka -> Village).
    Replaces loose JSON fields with normalized relational integrity.
    """
    __tablename__ = "proposal_geography_mappings"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    state_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="RESTRICT"), nullable=False, index=True)
    district_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="RESTRICT"), nullable=False, index=True)
    taluka_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="SET NULL"), nullable=True, index=True)
    village_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    is_primary = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal", back_populates="geography_mappings")
    state = relationship("Jurisdiction", foreign_keys=[state_id])
    district = relationship("Jurisdiction", foreign_keys=[district_id])
    taluka = relationship("Jurisdiction", foreign_keys=[taluka_id])
    village = relationship("Jurisdiction", foreign_keys=[village_id])

    def __repr__(self) -> str:
        return (
            f"<ProposalGeographyMapping(id={self.id}, proposal_id={self.proposal_id}, "
            f"state_id={self.state_id}, district_id={self.district_id}, taluka_id={self.taluka_id}, village_id={self.village_id})>"
        )
