from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class ExpertCommitteeAppraisal(Base):
    """
    Statutory Expert Committee Appraisal Gate (Section 7, RFCTLARR Act 2013).
    Multi-disciplinary panel evaluation of the Social Impact Assessment (SIA) study.
    Approval by this committee is the mandatory statutory gate to unlock Section 11 Preliminary Notification.
    """
    __tablename__ = "expert_committee_appraisals"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Committee Meta & Recommendations
    committee_chairperson = Column(String(150), nullable=False)
    appraisal_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    recommendation_status = Column(String(50), nullable=False, default="RECOMMENDED_FOR_ACQUISITION")  # RECOMMENDED_FOR_ACQUISITION, REJECTED, MODIFICATIONS_REQUIRED
    clearance_remarks = Column(Text, nullable=False)

    # Statutory Verification Criteria (Section 7(4))
    public_purpose_verified = Column(Boolean, default=True, nullable=False)
    minimal_land_verified = Column(Boolean, default=True, nullable=False)
    simp_feasibility_verified = Column(Boolean, default=True, nullable=False)  # Social Impact Management Plan

    # Digital Signatures / Expert IDs
    signed_by_expert_ids_json = Column(Text, nullable=True)  # JSON list of panel expert user IDs / names
    submitted_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal", back_populates="expert_appraisal")
    submitted_by_user = relationship("User")

    def __repr__(self) -> str:
        return f"<ExpertCommitteeAppraisal(id={self.id}, proposal_id={self.proposal_id}, status='{self.recommendation_status}')>"
