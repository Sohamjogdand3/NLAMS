from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class CitizenClaim(Base):
    """
    Citizen Land Ownership & Compensation Claim for Dual-Pane Adjudication.
    Adjudicated by LAO and District Collector: "Approve/Verify Claim for Award Processing".
    Final payout remains a separate, controlled step in Stage 11 (Compensation Disbursal).
    """
    __tablename__ = "citizen_claims"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    parcel_id = Column(Integer, ForeignKey("land_parcels.id", ondelete="CASCADE"), nullable=False, index=True)
    citizen_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)

    claim_reference_no = Column(String(100), unique=True, nullable=False, index=True)
    claimant_name = Column(String(200), nullable=False)
    survey_number = Column(String(50), nullable=False, index=True)
    village_name = Column(String(100), nullable=False)

    # Left-Pane: Citizen Submitted Documentation & Verification Data
    uploaded_title_deed_url = Column(String(255), nullable=True)
    uploaded_7_12_extract_url = Column(String(255), nullable=True)
    aadhaar_vault_ref = Column(String(100), nullable=True)
    aadhaar_kyc_status = Column(String(50), default="VERIFIED_OTP", nullable=False)
    bank_account_no = Column(String(50), nullable=True)
    bank_ifsc_code = Column(String(20), nullable=True)
    bank_name = Column(String(100), nullable=True)
    claimed_area_ha = Column(Float, nullable=False, default=0.0)
    claimed_share_fraction = Column(String(20), default="1/1", nullable=False)

    # Right-Pane: Official Cadastral Field Verification & Adjudication Status
    adjudication_status = Column(String(50), default="PENDING_REVIEW", nullable=False, index=True)
    # Statuses: PENDING_REVIEW, VERIFIED_FOR_AWARD, CLARIFICATION_REQUESTED, HEARING_FLAGGED, REJECTED
    discrepancy_flag = Column(Boolean, default=False, nullable=False)
    discrepancy_details = Column(Text, nullable=True)
    
    # LAO / Collector Verification Metadata (Decoupled from payment execution)
    adjudication_notes = Column(Text, nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    parcel = relationship("LandParcel")
    citizen_user = relationship("User", foreign_keys=[citizen_user_id])
    verified_by_user = relationship("User", foreign_keys=[verified_by_user_id])

    def __repr__(self) -> str:
        return f"<CitizenClaim(id={self.id}, claim_ref='{self.claim_reference_no}', status='{self.adjudication_status}')>"
