from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class WorkflowStage:
    """Canonical Statutory Workflow Stages for NLAMS Land Acquisition Lifecycle (RFCTLARR 2013)."""
    STAGE_1_REQUISITION = "STAGE_1_REQUISITION"
    STAGE_2_STATE_SCRUTINY = "STAGE_2_STATE_SCRUTINY"
    STAGE_3_CALA_APPOINTED = "STAGE_3_CALA_APPOINTED"
    STAGE_4_SIA_STUDY = "STAGE_4_SIA_STUDY"
    STAGE_5_EXPERT_COMMITTEE_GATE = "STAGE_5_EXPERT_COMMITTEE_GATE"
    STAGE_6_SEC11_PRELIMINARY_NOTIF = "STAGE_6_SEC11_PRELIMINARY_NOTIF"
    STAGE_7_SEC15_OBJECTIONS = "STAGE_7_SEC15_OBJECTIONS"
    STAGE_8_SEC19_FINAL_DECLARATION = "STAGE_8_SEC19_FINAL_DECLARATION"
    STAGE_9_VALUATION_COMPUTED = "STAGE_9_VALUATION_COMPUTED"
    STAGE_10_AWARD_PRONOUNCED = "STAGE_10_AWARD_PRONOUNCED"
    STAGE_11_COMPENSATION_DISBURSED = "STAGE_11_COMPENSATION_DISBURSED"
    STAGE_12_POSSESSION_AND_MUTATION = "STAGE_12_POSSESSION_AND_MUTATION"
    STAGE_13_PIA_HANDOVER_ACCEPTED = "STAGE_13_PIA_HANDOVER_ACCEPTED"
    STAGE_14_COMPLETED = "STAGE_14_COMPLETED"


class ProjectProposal(Base):
    """
    Project Proposal Model for Requiring Agencies (NHAI, Railways, MoRTH, MMRDA, PWD, NTPC).
    Statutory lifecycle managed via canonical `current_stage` State Machine.
    """
    __tablename__ = "project_proposals"

    id = Column(Integer, primary_key=True, index=True)
    proposal_code = Column(String(100), unique=True, nullable=False, index=True)
    project_title = Column(String(255), nullable=False, index=True)
    requiring_agency = Column(String(100), nullable=False, index=True)  # NHAI, RAILWAYS, MMRDA, CIDCO, PWD, NTPC
    ministry = Column(String(150), nullable=False)  # e.g., MoRTH, Ministry of Railways
    public_purpose = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    estimated_budget_inr = Column(Float, nullable=False, default=0.0)
    required_area_ha = Column(Float, nullable=False, default=0.0)

    # Statutory Workflow State Machine
    current_stage = Column(String(50), nullable=False, default=WorkflowStage.STAGE_1_REQUISITION, index=True)
    status = Column(String(50), nullable=False, default="DRAFT", index=True)  # Legacy & Display Status

    # Jurisdiction Scope & Geography Metadata (Relational Source of Truth backed by proposal_geography_mappings)
    target_district_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="SET NULL"), nullable=True, index=True)
    target_taluka_ids = Column(String(255), nullable=True)
    impacted_districts_json = Column(Text, nullable=True)  # Cached JSON list of district names
    impacted_talukas_json = Column(Text, nullable=True)    # Cached JSON list of taluka names
    impacted_villages_json = Column(Text, nullable=True)   # Cached JSON list of village names

    # Estimated Counts for SIA & Census Planning
    estimated_affected_parcels_count = Column(Integer, default=0, nullable=False)
    estimated_affected_families_count = Column(Integer, default=0, nullable=False)

    # Scrutiny & Conflict Attributes
    conflict_status = Column(String(50), default="PENDING_CHECK", nullable=False)
    conflict_notes = Column(Text, nullable=True)
    multiplier_compliance_verified = Column(Boolean, default=False, nullable=False)

    # Prepared Statutory Milestones (Sections 11, 19, Valuation, Award, Handover, PIA Acceptance)
    sec11_notification_no = Column(String(100), nullable=True)
    sec11_published_at = Column(DateTime, nullable=True)
    sec11_objection_deadline = Column(DateTime, nullable=True)

    sec19_declaration_no = Column(String(100), nullable=True)
    sec19_published_at = Column(DateTime, nullable=True)

    valuation_computed_at = Column(DateTime, nullable=True)
    valuation_total_inr = Column(Float, nullable=True)

    award_declaration_date = Column(DateTime, nullable=True)
    award_order_no = Column(String(100), nullable=True)

    compensation_disbursed_at = Column(DateTime, nullable=True)
    total_disbursed_inr = Column(Float, nullable=True)

    possession_certificate_no = Column(String(100), nullable=True)
    possession_handed_over_at = Column(DateTime, nullable=True)

    pia_accepted_at = Column(DateTime, nullable=True)
    pia_acceptance_notes = Column(Text, nullable=True)

    # Audit & User References
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    target_district = relationship("Jurisdiction", foreign_keys=[target_district_id])
    created_by_user = relationship("User", foreign_keys=[created_by_user_id])
    geography_mappings = relationship("ProposalGeographyMapping", back_populates="proposal", cascade="all, delete-orphan")
    dpr_documents = relationship("ProjectDpr", back_populates="proposal", cascade="all, delete-orphan")
    gis_corridor = relationship("ProjectGisCorridor", back_populates="proposal", uselist=False, cascade="all, delete-orphan")
    parcels = relationship("LandParcel", back_populates="proposal", cascade="all, delete-orphan")
    escrow_account = relationship("EscrowAccount", back_populates="proposal", uselist=False, cascade="all, delete-orphan")
    cala_appointment = relationship("CalaAppointment", back_populates="proposal", uselist=False, cascade="all, delete-orphan")
    expert_appraisal = relationship("ExpertCommitteeAppraisal", back_populates="proposal", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<ProjectProposal(id={self.id}, code='{self.proposal_code}', stage='{self.current_stage}')>"
