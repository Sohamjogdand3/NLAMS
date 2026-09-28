from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class LandParcel(Base):
    """
    Land Parcel / Cadastral Survey Record auto-populated from State Land Registry (MahaBhulekh)
    upon spatial intersection with the Project GIS Corridor.
    """
    __tablename__ = "land_parcels"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Revenue Identifiers
    survey_number = Column(String(50), nullable=False, index=True)
    gut_number = Column(String(50), nullable=True, index=True)
    sub_division = Column(String(50), nullable=True)
    village_name = Column(String(100), nullable=False, index=True)
    taluka_name = Column(String(100), nullable=False, index=True)
    district_name = Column(String(100), nullable=False, index=True)
    jurisdiction_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="SET NULL"), nullable=True, index=True)

    # Classification & Extent
    land_category = Column(String(50), nullable=False, default="DRY_CROP")  # DRY_CROP, BAGAYAT_IRRIGATED, NON_AGRICULTURAL, COMMERCIAL, GOVERNMENT_FOREST
    total_area_ha = Column(Float, nullable=False, default=0.0)
    affected_area_ha = Column(Float, nullable=False, default=0.0)

    # Ownership & RoR Extracted Metadata
    owner_name = Column(String(200), nullable=False)
    aadhaar_vault_ref = Column(String(100), nullable=True)
    khatedar_count = Column(Integer, default=1, nullable=False)
    khasra_roster_json = Column(Text, nullable=True)  # Structured JSON of co-owners, share fractions & mutation entries

    # Integration Origin & Source Tracking (Demarcates simulator vs future live NIC API)
    data_source = Column(String(50), default="SIMULATED_MAHABHULEKH_ADAPTER", nullable=False)
    api_version = Column(String(20), default="v2.4-sim", nullable=False)

    # Three-Tier Section 11 Statutory Freeze Flags
    is_frozen = Column(Boolean, default=False, nullable=False)
    freeze_timestamp = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal", back_populates="parcels")
    jurisdiction = relationship("Jurisdiction")

    def __repr__(self) -> str:
        return f"<LandParcel(id={self.id}, survey='{self.survey_number}', village='{self.village_name}', owner='{self.owner_name}')>"
