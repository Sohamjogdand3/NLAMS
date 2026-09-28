from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class LandCompensationDisbursal(Base):
    """
    Controlled Land Statutory Award PFMS DBT Disbursal (Stage 11: Compensation Disbursed).
    Executes simulated direct benefit transfer from the Project Escrow Account to verified titleholders.
    """
    __tablename__ = "land_compensation_disbursals"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    award_id = Column(Integer, ForeignKey("statutory_awards.id", ondelete="RESTRICT"), nullable=False, index=True)
    escrow_account_id = Column(Integer, ForeignKey("escrow_accounts.id", ondelete="RESTRICT"), nullable=False, index=True)

    disbursal_batch_ref = Column(String(100), nullable=False, index=True)
    beneficiary_name = Column(String(200), nullable=False)
    survey_number = Column(String(50), nullable=False)
    bank_account_no = Column(String(50), nullable=False)
    bank_ifsc_code = Column(String(20), nullable=False)
    bank_name = Column(String(100), nullable=False)
    amount_inr = Column(Float, nullable=False)

    # Simulated PFMS Provenance & UTR References
    pfms_transaction_ref = Column(String(100), unique=True, nullable=False, index=True)
    data_source = Column(String(50), default="SIMULATED_PFMS_GATEWAY_ADAPTER", nullable=False)
    is_simulated = Column(Boolean, default=True, nullable=False)
    disclaimer = Column(
        String(255),
        default="Simulated PFMS DBT transaction record. Executes simulated escrow debit within NLAMS workspace.",
        nullable=False,
    )

    payment_status = Column(String(50), default="PROCESSED_SIMULATED", nullable=False, index=True)
    # Statuses: INITIATED, PROCESSED_SIMULATED, FAILED, SETTLED
    disbursed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    authorized_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    award = relationship("StatutoryAward")
    escrow_account = relationship("EscrowAccount")
    authorized_by_user = relationship("User", foreign_keys=[authorized_by_user_id])

    def __repr__(self) -> str:
        return f"<LandCompensationDisbursal(id={self.id}, ref='{self.pfms_transaction_ref}', amount=₹{self.amount_inr:,.2f})>"


class RnRBenefitDisbursal(Base):
    """
    Controlled R&R Social Welfare Entitlement PFMS DBT Disbursal (Stage 11: Compensation Disbursed).
    Executes separate, distinct social grant payouts from the Project Escrow Account to affected non-owner families.
    """
    __tablename__ = "rnr_benefit_disbursals"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    entitlement_package_id = Column(Integer, ForeignKey("rnr_entitlement_packages.id", ondelete="RESTRICT"), nullable=False, index=True)
    family_id = Column(Integer, ForeignKey("affected_family_census.id", ondelete="RESTRICT"), nullable=False, index=True)
    escrow_account_id = Column(Integer, ForeignKey("escrow_accounts.id", ondelete="RESTRICT"), nullable=False, index=True)

    disbursal_batch_ref = Column(String(100), nullable=False, index=True)
    beneficiary_name = Column(String(200), nullable=False)
    family_code = Column(String(100), nullable=False)
    bank_account_no = Column(String(50), nullable=False)
    bank_ifsc_code = Column(String(20), nullable=False)
    bank_name = Column(String(100), nullable=False)
    amount_inr = Column(Float, nullable=False)

    # Simulated PFMS Provenance & UTR References
    pfms_transaction_ref = Column(String(100), unique=True, nullable=False, index=True)
    data_source = Column(String(50), default="SIMULATED_PFMS_GATEWAY_ADAPTER", nullable=False)
    is_simulated = Column(Boolean, default=True, nullable=False)
    disclaimer = Column(
        String(255),
        default="Simulated PFMS DBT transaction record for R&R Social Welfare Grants. Executes simulated escrow debit.",
        nullable=False,
    )

    payment_status = Column(String(50), default="PROCESSED_SIMULATED", nullable=False, index=True)
    disbursed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    authorized_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    entitlement_package = relationship("RnREntitlementPackage", back_populates="disbursals")
    family = relationship("AffectedFamilyCensus")
    escrow_account = relationship("EscrowAccount")
    authorized_by_user = relationship("User", foreign_keys=[authorized_by_user_id])

    def __repr__(self) -> str:
        return f"<RnRBenefitDisbursal(id={self.id}, ref='{self.pfms_transaction_ref}', amount=₹{self.amount_inr:,.2f})>"
