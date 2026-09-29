from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class DigitalPanchnama(Base):
    """
    Digital Possession Panchnama (Spot Verification & Boundary Demarcation Record).
    Recorded on-site by Revenue Officials (Tehsildar / Talathi / Circle Officer) with spot witnesses.
    """
    __tablename__ = "digital_panchnamas"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    panchnama_number = Column(String(100), unique=True, nullable=False, index=True)

    execution_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    site_location_description = Column(Text, nullable=False)

    # Revenue Official Representatives
    circle_officer_name = Column(String(150), nullable=False)
    talathi_name = Column(String(150), nullable=False)
    tehsildar_name = Column(String(150), nullable=False)

    # Structured Spot Witnesses (JSON Array of {name, address, aadhaar_masked, sign_confirmed})
    panchas_witnesses_json = Column(Text, nullable=False)

    total_parcels_taken_count = Column(Integer, default=1, nullable=False)
    total_area_ha_taken = Column(Float, nullable=False, default=0.0)

    # Statutory Demarcation & Clearance Confirmations
    physical_encumbrances_cleared = Column(Boolean, default=True, nullable=False)
    boundary_pillars_fixed = Column(Boolean, default=True, nullable=False)
    standing_crops_harvested_or_compensated = Column(Boolean, default=True, nullable=False)

    panchnama_doc_url = Column(String(500), nullable=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id])

    def __repr__(self) -> str:
        return f"<DigitalPanchnama(id={self.id}, number='{self.panchnama_number}', area={self.total_area_ha_taken} ha)>"


class PossessionCertificate(Base):
    """
    Statutory Possession Certificate issued under Section 38 / 40 of RFCTLARR Act 2013.
    Formally vests acquired land in the State / Competent Authority upon 100% compensation readiness.
    Advances proposal to STAGE_12_POSSESSION_AND_MUTATION.
    """
    __tablename__ = "possession_certificates"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    certificate_number = Column(String(100), unique=True, nullable=False, index=True)

    statutory_section = Column(String(100), default="Section 38 / 40 - RFCTLARR Act 2013", nullable=False)
    issuing_authority_title = Column(
        String(200),
        default="District Collector & Competent Authority for Land Acquisition (CALA)",
        nullable=False,
    )
    issued_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    issued_to_requiring_agency = Column(String(150), nullable=False)

    possession_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    total_area_acquired_ha = Column(Float, nullable=False, default=0.0)
    total_parcels_count = Column(Integer, default=1, nullable=False)

    # Statutory Precondition Confirmations
    compensation_cleared_confirmation = Column(Boolean, default=True, nullable=False)
    rnr_cleared_confirmation = Column(Boolean, default=True, nullable=False)
    panchnama_id = Column(Integer, ForeignKey("digital_panchnamas.id", ondelete="SET NULL"), nullable=True)

    certificate_doc_url = Column(String(500), nullable=False)
    status = Column(String(50), default="ISSUED_VESTED_IN_STATE", nullable=False, index=True)
    # Status: ISSUED_VESTED_IN_STATE, HANDOVER_COMPLETED

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    issued_by_user = relationship("User", foreign_keys=[issued_by_user_id])
    panchnama = relationship("DigitalPanchnama")

    def __repr__(self) -> str:
        return f"<PossessionCertificate(id={self.id}, number='{self.certificate_number}', area={self.total_area_acquired_ha} ha)>"


class DigitalMutationRecord(Base):
    """
    Simulated e-Ferfar Land Revenue Mutation Record (7/12 RoR transfer).
    Transfers title from original land owners to Requiring Agency (e.g. NHAI / Railways / PWD).
    Resolves interim Section 11 locks to permanent vested state.
    """
    __tablename__ = "digital_mutation_records"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    parcel_id = Column(Integer, ForeignKey("land_parcels.id", ondelete="CASCADE"), nullable=False, index=True)

    ferfar_number = Column(String(100), unique=True, nullable=False, index=True)
    mutation_type = Column(String(100), default="ACQUISITION_GOVT_TRANSFER_SEC19", nullable=False)

    previous_owner_name = Column(String(200), nullable=False)
    new_owner_name = Column(String(200), nullable=False)  # e.g., "National Highways Authority of India (NHAI) / Govt of Maharashtra"

    village_name = Column(String(100), nullable=False, index=True)
    taluka_name = Column(String(100), nullable=False, index=True)
    district_name = Column(String(100), nullable=False, index=True)
    survey_number = Column(String(50), nullable=False, index=True)
    gut_number = Column(String(50), nullable=True)
    mutated_area_ha = Column(Float, nullable=False, default=0.0)

    # Status: MUTATION_RECORDED, ROR_UPDATED, VESTED_FREE_FROM_ENCUMBRANCES
    e_ferfar_status = Column(String(50), default="MUTATION_RECORDED", nullable=False, index=True)
    previous_section11_restriction_status = Column(String(50), default="RESOLVED_AND_LIFTED", nullable=False)
    new_restriction_status = Column(String(50), default="VESTED_IN_REQUIRING_AGENCY_PERMANENT", nullable=False)

    # Simulation Notice & Provenance
    data_source = Column(String(100), default="SIMULATED_E_FERFAR_MAHABHULEKH_ADAPTER", nullable=False)
    is_simulated = Column(Boolean, default=True, nullable=False)
    disclaimer = Column(
        String(255),
        default="Simulated e-Ferfar Land Revenue Mutation Record. Updates simulated 7/12 RoR in NLAMS workspace.",
        nullable=False,
    )

    mutation_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    approved_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    parcel = relationship("LandParcel")
    approved_by_user = relationship("User", foreign_keys=[approved_by_user_id])

    def __repr__(self) -> str:
        return f"<DigitalMutationRecord(id={self.id}, ferfar='{self.ferfar_number}', survey='{self.survey_number}')>"


class PiaHandoverCertificate(Base):
    """
    Statutory PIA Project Handover Acceptance Gate (Stage 13: PIA Handover Accepted).
    Requiring Agency inspects corridor, verifies encumbrance-free status and mutation,
    and formally signs acceptance or records defect notes.
    """
    __tablename__ = "pia_handover_certificates"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    handover_number = Column(String(100), unique=True, nullable=False, index=True)
    possession_certificate_id = Column(Integer, ForeignKey("possession_certificates.id", ondelete="RESTRICT"), nullable=False)

    requiring_agency = Column(String(150), nullable=False)
    pia_representative_name = Column(String(150), nullable=False)
    pia_representative_designation = Column(String(150), default="Project Director / General Manager", nullable=False)

    # Acceptance Decision: ACCEPTED, REJECTED_DEFECT_NOTICED, PENDING_INSPECTION
    verification_status = Column(String(50), default="ACCEPTED", nullable=False, index=True)
    encumbrance_free_verified = Column(Boolean, default=True, nullable=False)
    boundary_demarcation_verified = Column(Boolean, default=True, nullable=False)
    mutations_verified = Column(Boolean, default=True, nullable=False)

    corridor_length_km = Column(Float, nullable=True)
    total_area_ha = Column(Float, nullable=False, default=0.0)

    acceptance_notes = Column(Text, nullable=True)
    dispute_reasons = Column(Text, nullable=True)

    accepted_at = Column(DateTime, nullable=True)
    action_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    possession_certificate = relationship("PossessionCertificate")
    action_by_user = relationship("User", foreign_keys=[action_by_user_id])

    def __repr__(self) -> str:
        return f"<PiaHandoverCertificate(id={self.id}, number='{self.handover_number}', status='{self.verification_status}')>"


class ProjectCompletionArchival(Base):
    """
    Final Executive Project Completion & Archival Dossier (Stage 14: Completed).
    Reconciles all escrow expenditures (land awards + R&R + CPR), closes audit trails,
    and seals the acquisition project with cryptographic audit hash.
    """
    __tablename__ = "project_completion_archivals"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    archival_dossier_no = Column(String(100), unique=True, nullable=False, index=True)

    # Financial Reconciliation
    total_budget_allocated_inr = Column(Float, nullable=False, default=0.0)
    total_escrow_deposited_inr = Column(Float, nullable=False, default=0.0)
    total_compensation_disbursed_inr = Column(Float, nullable=False, default=0.0)
    total_rnr_disbursed_inr = Column(Float, nullable=False, default=0.0)
    total_cpr_reconstruction_inr = Column(Float, nullable=False, default=0.0)
    total_administrative_charges_inr = Column(Float, nullable=False, default=0.0)
    remaining_escrow_balance_inr = Column(Float, nullable=False, default=0.0)

    # Reconciliation Status: RECONCILED_AND_SETTLED, PENDING_ESCROW_REFUND
    reconciliation_status = Column(String(50), default="RECONCILED_AND_SETTLED", nullable=False)

    # Statutory Closure Checklist Flags
    all_parcels_surveyed = Column(Boolean, default=True, nullable=False)
    all_objections_disposed = Column(Boolean, default=True, nullable=False)
    all_awards_pronounced = Column(Boolean, default=True, nullable=False)
    all_disbursals_settled = Column(Boolean, default=True, nullable=False)
    all_mutations_completed = Column(Boolean, default=True, nullable=False)
    pia_acceptance_confirmed = Column(Boolean, default=True, nullable=False)

    final_audit_hash = Column(String(128), nullable=False)
    archival_summary_json = Column(Text, nullable=True)

    completed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    closed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    closed_by_user = relationship("User", foreign_keys=[closed_by_user_id])

    def __repr__(self) -> str:
        return f"<ProjectCompletionArchival(id={self.id}, dossier='{self.archival_dossier_no}', hash='{self.final_audit_hash[:12]}...')>"
