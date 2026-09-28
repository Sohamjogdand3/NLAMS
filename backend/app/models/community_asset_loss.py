from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class CommunityAssetLoss(Base):
    """
    Common Property Resources (CPR) & Community Asset Loss Ledger (Third Schedule, RFCTLARR 2013).
    Catalogues community loss (grazing lands, wells, community halls, schools, shrines)
    and tracks statutory reconstruction & civic amenity provisioning.
    """
    __tablename__ = "community_asset_losses"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)

    village_name = Column(String(100), nullable=False, index=True)
    asset_name = Column(String(200), nullable=False)
    asset_category = Column(String(100), nullable=False)
    # Categories: GAUCHAR_GRAZING_LAND, DRINKING_WATER_WELL, COMMUNITY_HALL, CREMATION_GROUND, SCHOOL_FACILITY, VILLAGE_SHRINE, INTERNAL_ROAD, DRAINAGE_INFRASTRUCTURE
    
    survey_number = Column(String(50), nullable=True)
    affected_extent = Column(String(100), nullable=False) # e.g. "2.0 ha grazing ground" or "1 deep tube-well"
    estimated_restoration_cost_inr = Column(Float, nullable=False, default=0.0)
    pwd_valuation_ref = Column(String(100), nullable=True)
    
    # Third Schedule Mandatory Amenity Mapping (1 of 25 amenities)
    statutory_amenity_code = Column(String(50), nullable=False, default="AMENITY_ITEM_1")
    reconstruction_status = Column(String(50), default="IDENTIFIED", nullable=False, index=True)
    # Statuses: IDENTIFIED, BUDGET_SANCTIONED, SITE_ALLOCATED, RECONSTRUCTION_IN_PROGRESS, RESTORED
    reconstruction_site_details = Column(String(255), nullable=True)
    reconstruction_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")

    def __repr__(self) -> str:
        return f"<CommunityAssetLoss(id={self.id}, name='{self.asset_name}', village='{self.village_name}', cost=₹{self.estimated_restoration_cost_inr:,.2f})>"
