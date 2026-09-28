from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class RnREntitlementPackage(Base):
    """
    Statutory R&R Entitlement Package (Second Schedule, RFCTLARR 2013).
    Versioned, rule-based social welfare benefits matched per affected family.
    """
    __tablename__ = "rnr_entitlement_packages"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    family_id = Column(Integer, ForeignKey("affected_family_census.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    entitlement_package_code = Column(String(100), unique=True, nullable=False, index=True)
    rule_config_version = Column(String(50), nullable=False, default="v2.4-MHA-RNR-2026")
    
    # Scheme Eligibility & Matching (PMAY / State Housing Board Integration)
    pmay_housing_eligibility_status = Column(String(100), default="ELIGIBLE_PMAY_MATCHING", nullable=False)
    # Statuses: ELIGIBLE_PMAY_MATCHING, MATCHED_STATE_HOUSING_BOARD, CASH_IN_LIEU_OPTED, NOT_ELIGIBLE
    pmay_matching_reference = Column(String(100), nullable=True)
    housing_plot_or_unit_details = Column(String(255), nullable=True)

    # Auditable Itemized Entitlement Amounts (INR) - Rule Configured
    subsistence_allowance_inr = Column(Float, nullable=False, default=0.0)
    resettlement_grant_inr = Column(Float, nullable=False, default=0.0)
    livelihood_annuity_inr = Column(Float, nullable=False, default=0.0)
    cattle_shed_petty_shop_inr = Column(Float, nullable=False, default=0.0)
    artisan_transport_grant_inr = Column(Float, nullable=False, default=0.0)
    
    # SC/ST Rule-Based Provision (Section 41 & 42)
    sc_st_eligibility_criteria_met = Column(Boolean, default=False, nullable=False)
    sc_st_additional_grant_inr = Column(Float, nullable=False, default=0.0)

    total_rnr_entitlement_inr = Column(Float, nullable=False, default=0.0)
    breakdown_json = Column(Text, nullable=False)

    # Approval Lifecycle
    status = Column(String(50), default="DRAFT_ASSESSMENT", nullable=False, index=True)
    # Statuses: DRAFT_ASSESSMENT, APPROVED_BY_RNR_ADMIN, AWAITING_DISBURSAL, DISBURSED
    approval_notes = Column(Text, nullable=True)
    approved_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=True)
    approved_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    family = relationship("AffectedFamilyCensus", back_populates="entitlement_package")
    approved_by_user = relationship("User", foreign_keys=[approved_by_user_id])
    disbursals = relationship("RnRBenefitDisbursal", back_populates="entitlement_package", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<RnREntitlementPackage(id={self.id}, code='{self.entitlement_package_code}', total=₹{self.total_rnr_entitlement_inr:,.2f})>"
