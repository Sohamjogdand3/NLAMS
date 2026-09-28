from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class StatutoryAward(Base):
    """
    Section 23/30 Statutory Award Ledger (RFCTLARR 2013).
    Stores auditable, itemized calculation breakdowns per survey parcel
    and formal Collector award pronouncements.
    """
    __tablename__ = "statutory_awards"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    parcel_id = Column(Integer, ForeignKey("land_parcels.id", ondelete="CASCADE"), nullable=False, index=True)
    claim_id = Column(Integer, ForeignKey("citizen_claims.id", ondelete="SET NULL"), nullable=True)

    award_order_no = Column(String(100), unique=True, nullable=False, index=True)
    survey_number = Column(String(50), nullable=False, index=True)
    village_name = Column(String(100), nullable=False)
    primary_khatedar_name = Column(String(200), nullable=False)
    affected_area_ha = Column(Float, nullable=False, default=0.0)

    # Auditable Itemized Breakdown (JSON)
    valuation_breakdown_json = Column(Text, nullable=False)
    
    # Summary Award Ledger Totals
    base_market_value_inr = Column(Float, nullable=False, default=0.0)
    multiplied_land_value_inr = Column(Float, nullable=False, default=0.0)
    solatium_100_pct_inr = Column(Float, nullable=False, default=0.0)
    additional_market_value_12_pct_inr = Column(Float, nullable=False, default=0.0)
    structural_assets_inr = Column(Float, nullable=False, default=0.0)
    total_statutory_award_inr = Column(Float, nullable=False, default=0.0)

    # Pronouncement & Sign-Off (Stage 10)
    is_pronounced = Column(Boolean, default=False, nullable=False)
    award_declared_at = Column(DateTime, nullable=True)
    pronounced_by_collector_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=True)

    # Disbursal Status (Linked to Stage 11)
    disbursal_status = Column(String(50), default="AWAITING_PFMS_DISBURSAL", nullable=False, index=True)
    disbursed_at = Column(DateTime, nullable=True)
    pfms_transaction_ref = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    parcel = relationship("LandParcel")
    claim = relationship("CitizenClaim")
    pronounced_by_collector = relationship("User", foreign_keys=[pronounced_by_collector_id])

    def __repr__(self) -> str:
        return f"<StatutoryAward(id={self.id}, order='{self.award_order_no}', total=₹{self.total_statutory_award_inr:,.2f})>"
