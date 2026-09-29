from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class FieldParcelSurvey(Base):
    """
    Field Parcel Survey Record.
    Captures on-ground GPS boundary walk coordinates, cadastral variance,
    crop/tree/structure inventories, and local farmer sign-offs.
    """
    __tablename__ = "field_parcel_surveys"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    parcel_id = Column(Integer, ForeignKey("land_parcels.id", ondelete="CASCADE"), nullable=False, index=True)
    surveyor_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)

    # Cadastral & Location Keys
    khasra_gat_number = Column(String(50), nullable=False, index=True)
    village_name = Column(String(100), nullable=False, index=True)
    taluka_name = Column(String(100), nullable=False, index=True)
    district_name = Column(String(100), nullable=False, index=True)

    # Areas & Variance
    prescribed_area_ha = Column(Float, nullable=False, default=0.0)
    measured_area_ha = Column(Float, nullable=True)
    variance_percentage = Column(Float, nullable=True)

    # Survey Execution State
    # Statuses: ASSIGNED, IN_PROGRESS, BOUNDARY_WALKED, ASSETS_AUDITED, COMPLETED, VERIFIED_BY_TALATHI, DISPUTED
    survey_status = Column(String(50), nullable=False, default="ASSIGNED", index=True)

    # GPS Boundary Walk Data
    gps_coordinates_json = Column(Text, nullable=True)  # JSON array of {lat, lng, accuracy, timestamp}
    gps_perimeter_meters = Column(Float, nullable=True)
    gps_accuracy_meters = Column(Float, nullable=True)

    # Boundary Dispute Flags
    is_disputed_boundary = Column(Boolean, default=False, nullable=False)
    dispute_notes = Column(Text, nullable=True)

    # Land Use & Occupancy
    land_use_type = Column(String(50), default="Agricultural", nullable=False)
    occupant_name_on_site = Column(String(200), nullable=True)
    occupant_type = Column(String(100), default="Self-Cultivating Owner", nullable=True)
    road_access = Column(String(100), default="Direct Paved Village Road", nullable=True)

    # Itemized Assets Inventory (JSON Strings)
    crops_data_json = Column(Text, nullable=True)       # JSON list of CropRecord
    trees_data_json = Column(Text, nullable=True)       # JSON list of TreeRecord
    structures_data_json = Column(Text, nullable=True)  # JSON list of StructureRecord
    water_assets_data_json = Column(Text, nullable=True)# JSON list of WaterAssetRecord

    # Verification & Sign-off
    owner_signature_captured = Column(Boolean, default=False, nullable=False)
    surveyor_remarks = Column(Text, nullable=True)

    # Offline Client Sync Metadata
    offline_client_uuid = Column(String(100), nullable=True, index=True)
    synced_at = Column(DateTime, nullable=True)

    # Revenue Verification Gate (Talathi / Tehsildar)
    verified_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    verification_remarks = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    parcel = relationship("LandParcel")
    surveyor_user = relationship("User", foreign_keys=[surveyor_user_id])
    verified_by_user = relationship("User", foreign_keys=[verified_by_user_id])
    evidence_photos = relationship("GeotaggedAssetEvidence", back_populates="survey", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<FieldParcelSurvey(id={self.id}, parcel_id={self.parcel_id}, status='{self.survey_status}')>"


class GeotaggedAssetEvidence(Base):
    """
    Geotagged Photo & Evidence Record captured during mobile survey.
    """
    __tablename__ = "geotagged_asset_evidence"

    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("field_parcel_surveys.id", ondelete="CASCADE"), nullable=False, index=True)
    parcel_id = Column(Integer, ForeignKey("land_parcels.id", ondelete="CASCADE"), nullable=False, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    surveyor_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    # Evidence Metadata
    category = Column(String(50), nullable=False, default="SITE_OVERVIEW", index=True)
    # Categories: SITE_OVERVIEW, BOUNDARY_MARKER, STRUCTURE, CROP_TREES, DISPUTE, POSSESSION_HANDOVER
    caption = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy_meters = Column(Float, default=2.5, nullable=False)
    timestamp_captured = Column(DateTime, default=datetime.utcnow, nullable=False)
    file_url = Column(String(500), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    survey = relationship("FieldParcelSurvey", back_populates="evidence_photos")
    parcel = relationship("LandParcel")
    proposal = relationship("ProjectProposal")
    surveyor_user = relationship("User", foreign_keys=[surveyor_user_id])

    def __repr__(self) -> str:
        return f"<GeotaggedAssetEvidence(id={self.id}, category='{self.category}', lat={self.latitude}, lng={self.longitude})>"
