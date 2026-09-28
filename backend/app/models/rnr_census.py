from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class AffectedFamilyCensus(Base):
    """
    Non-Owner Affected Family Census Index (Second Schedule, RFCTLARR 2013).
    Captures agricultural laborers, tenants, sharecroppers, and rural artisans
    whose primary livelihood is affected by the corridor acquisition.
    """
    __tablename__ = "affected_family_census"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    
    census_family_code = Column(String(100), unique=True, nullable=False, index=True)
    family_head_name = Column(String(200), nullable=False)
    ration_card_no = Column(String(50), nullable=True)
    aadhaar_vault_ref = Column(String(100), nullable=True)
    village_name = Column(String(100), nullable=False, index=True)
    associated_survey_number = Column(String(50), nullable=True)

    # Classification & Livelihood Dependency
    category = Column(String(100), nullable=False, default="AGRICULTURAL_LABORER")
    # Categories: AGRICULTURAL_LABORER, TENANT_SHARECROPPER, ARTISAN_TRADER, RESIDENTIAL_TENANT, FOREST_DWELLER
    caste_category = Column(String(50), nullable=False, default="GENERAL")
    # Caste Categories: GENERAL, OBC, SC, ST
    is_scheduled_area_displacement = Column(Boolean, default=False, nullable=False)
    is_bpl = Column(Boolean, default=False, nullable=False)
    family_members_count = Column(Integer, default=4, nullable=False)
    primary_livelihood_source = Column(String(200), nullable=False)
    dependency_years = Column(Integer, default=5, nullable=False)

    # Verification Lifecycle
    verification_status = Column(String(50), default="SURVEYED", nullable=False, index=True)
    # Statuses: SURVEYED, VERIFIED_BY_RNR_OFFICER, DISPUTE_FLAGGED
    verification_notes = Column(Text, nullable=True)
    verified_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    verified_by_user = relationship("User", foreign_keys=[verified_by_user_id])
    entitlement_package = relationship("RnREntitlementPackage", back_populates="family", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<AffectedFamilyCensus(id={self.id}, code='{self.census_family_code}', head='{self.family_head_name}', category='{self.category}')>"
