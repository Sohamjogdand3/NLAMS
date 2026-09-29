from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# 1. Field Surveyor Mobile Schemas
# -----------------------------------------------------------------------------

class GpsCoordinatePoint(BaseModel):
    latitude: float = Field(..., json_schema_extra={"example": 18.5794})
    longitude: float = Field(..., json_schema_extra={"example": 73.9842})
    accuracy_meters: Optional[float] = Field(2.5, json_schema_extra={"example": 2.4})
    timestamp: Optional[str] = Field(None, json_schema_extra={"example": "2026-09-29T10:30:00Z"})


class CropRecordSchema(BaseModel):
    id: Optional[str] = None
    cropName: str = Field(..., json_schema_extra={"example": "Sugarcane (Co 86032)"})
    cultivatedAreaHa: float = Field(..., ge=0, json_schema_extra={"example": 1.2})
    season: str = Field("Kharif", json_schema_extra={"example": "Perennial"})
    irrigationType: str = Field("Canal", json_schema_extra={"example": "Drip Irrigation"})


class TreeRecordSchema(BaseModel):
    id: Optional[str] = None
    species: str = Field(..., json_schema_extra={"example": "Alphonso Mango"})
    category: str = Field("Fruit-Bearing", json_schema_extra={"example": "Fruit-Bearing"})
    quantity: int = Field(..., ge=1, json_schema_extra={"example": 25})
    girthClass: Optional[str] = Field("30-60 cm", json_schema_extra={"example": "30-60 cm"})
    condition: str = Field("Good", json_schema_extra={"example": "Good"})
    isProductive: bool = Field(True, json_schema_extra={"example": True})


class StructureRecordSchema(BaseModel):
    id: Optional[str] = None
    type: str = Field(..., json_schema_extra={"example": "Residential House"})
    constructionType: str = Field("Pucca", json_schema_extra={"example": "Pucca"})
    plinthAreaSqM: float = Field(..., ge=0, json_schema_extra={"example": 120.5})
    floors: int = Field(1, ge=1, json_schema_extra={"example": 1})
    condition: str = Field("Good", json_schema_extra={"example": "Good"})


class WaterAssetRecordSchema(BaseModel):
    id: Optional[str] = None
    type: str = Field(..., json_schema_extra={"example": "Borewell"})
    depthMeters: Optional[float] = Field(None, json_schema_extra={"example": 120.0})
    operationalStatus: str = Field("Operational", json_schema_extra={"example": "Operational"})


class BoundaryWalkSubmitRequest(BaseModel):
    task_id: int = Field(..., json_schema_extra={"example": 1})
    gps_coordinates: List[GpsCoordinatePoint] = Field(..., min_length=3)
    measured_area_ha: float = Field(..., gt=0, json_schema_extra={"example": 2.45})
    gps_perimeter_meters: Optional[float] = Field(None, json_schema_extra={"example": 640.2})
    gps_accuracy_meters: Optional[float] = Field(2.5, json_schema_extra={"example": 2.2})
    land_use_type: Optional[str] = Field("Agricultural", json_schema_extra={"example": "Agricultural"})
    occupant_name_on_site: Optional[str] = Field(None, json_schema_extra={"example": "Suresh Deshmukh"})
    occupant_type: Optional[str] = Field("Self-Cultivating Owner", json_schema_extra={"example": "Self-Cultivating Owner"})
    road_access: Optional[str] = Field("Direct Paved Village Road", json_schema_extra={"example": "Direct Paved Village Road"})
    is_disputed_boundary: bool = Field(False, json_schema_extra={"example": False})
    dispute_notes: Optional[str] = Field(None, json_schema_extra={"example": None})
    surveyor_remarks: Optional[str] = Field(None, json_schema_extra={"example": "Boundary pillars walked with farmer present."})


class AssetEvidenceCreateRequest(BaseModel):
    survey_id: int = Field(..., json_schema_extra={"example": 1})
    category: str = Field("SITE_OVERVIEW", json_schema_extra={"example": "STRUCTURE"})
    caption: str = Field(..., json_schema_extra={"example": "Front elevation of residential house on parcel 101/1"})
    latitude: float = Field(..., json_schema_extra={"example": 18.5794})
    longitude: float = Field(..., json_schema_extra={"example": 73.9842})
    accuracy_meters: float = Field(2.5, json_schema_extra={"example": 2.1})
    file_url: str = Field(..., json_schema_extra={"example": "/storage/photos/survey_101_struc.jpg"})


class BatchSyncSurveyItem(BaseModel):
    offline_client_uuid: str = Field(..., json_schema_extra={"example": "uuid-client-12345"})
    parcel_id: int = Field(..., json_schema_extra={"example": 1})
    proposal_id: int = Field(..., json_schema_extra={"example": 1})
    measured_area_ha: Optional[float] = Field(None, json_schema_extra={"example": 2.45})
    gps_coordinates: Optional[List[GpsCoordinatePoint]] = None
    gps_perimeter_meters: Optional[float] = None
    gps_accuracy_meters: Optional[float] = None
    is_disputed_boundary: bool = False
    dispute_notes: Optional[str] = None
    land_use_type: Optional[str] = "Agricultural"
    occupant_name_on_site: Optional[str] = None
    occupant_type: Optional[str] = "Self-Cultivating Owner"
    road_access: Optional[str] = "Direct Paved Village Road"
    crops: Optional[List[CropRecordSchema]] = None
    trees: Optional[List[TreeRecordSchema]] = None
    structures: Optional[List[StructureRecordSchema]] = None
    water_assets: Optional[List[WaterAssetRecordSchema]] = None
    owner_signature_captured: bool = False
    surveyor_remarks: Optional[str] = None
    photos: Optional[List[AssetEvidenceCreateRequest]] = None


class BatchSyncRequest(BaseModel):
    sync_batch_id: str = Field(..., json_schema_extra={"example": "SYNC-BATCH-2026-001"})
    survey_items: List[BatchSyncSurveyItem] = Field(..., min_length=1)


class SurveyVerifyRequest(BaseModel):
    survey_id: int = Field(..., json_schema_extra={"example": 1})
    decision: str = Field(..., json_schema_extra={"example": "APPROVE"})
    # Decisions: APPROVE, REMAND_FOR_RESURVEY, FLAG_DISPUTE
    verification_remarks: Optional[str] = Field(None, json_schema_extra={"example": "Ground boundaries matched 7/12 record."})


class GeotaggedEvidenceOut(BaseModel):
    id: int
    survey_id: int
    parcel_id: int
    proposal_id: int
    category: str
    caption: str
    latitude: float
    longitude: float
    accuracy_meters: float
    timestamp_captured: datetime
    file_url: str
    surveyor_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FieldSurveyOut(BaseModel):
    id: int
    proposal_id: int
    parcel_id: int
    surveyor_user_id: int
    khasra_gat_number: str
    village_name: str
    taluka_name: str
    district_name: str
    prescribed_area_ha: float
    measured_area_ha: Optional[float] = None
    variance_percentage: Optional[float] = None
    survey_status: str
    gps_coordinates_json: Optional[str] = None
    gps_perimeter_meters: Optional[float] = None
    gps_accuracy_meters: Optional[float] = None
    is_disputed_boundary: bool
    dispute_notes: Optional[str] = None
    land_use_type: str
    occupant_name_on_site: Optional[str] = None
    occupant_type: Optional[str] = None
    road_access: Optional[str] = None
    crops_data_json: Optional[str] = None
    trees_data_json: Optional[str] = None
    structures_data_json: Optional[str] = None
    water_assets_data_json: Optional[str] = None
    owner_signature_captured: bool
    surveyor_remarks: Optional[str] = None
    offline_client_uuid: Optional[str] = None
    synced_at: Optional[datetime] = None
    verified_by_user_id: Optional[int] = None
    verified_at: Optional[datetime] = None
    verification_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    evidence_photos: List[GeotaggedEvidenceOut] = []

    class Config:
        from_attributes = True


class ProposalSurveySummaryOut(BaseModel):
    proposal_id: int
    total_parcels: int
    total_prescribed_area_ha: float
    surveys_completed_count: int
    surveys_in_progress_count: int
    surveys_disputed_count: int
    verified_by_revenue_count: int
    overall_measured_area_ha: float
    average_variance_percentage: float
