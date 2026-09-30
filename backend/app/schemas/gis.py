from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class CoordinateInput(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius_m: float = Field(default=500, ge=0, le=5000)

class ReverseGeocodeResult(BaseModel):
    display_name: str
    village: Optional[str]
    taluka: Optional[str]
    district: Optional[str]
    state: Optional[str]
    country: Optional[str]
    raw_response: Dict[str, Any]

class ParcelResponse(BaseModel):
    parcel_id: UUID
    survey_number: str
    cts_number: Optional[str]
    village: str
    taluka: str
    district: str
    state: str
    area_sqm: float
    area_hectares: float
    perimeter_m: Optional[float] = None
    dimensions: Optional[str] = None
    owner_name: Optional[str]
    land_use: Optional[str] = None
    source: str = "NLAMS Demo Dataset"
    osm_id: Optional[str] = None
    osm_type: Optional[str] = None
    ulpin: Optional[str] = None
    last_updated: Optional[datetime]
    confidence_note: str = "Demo data — not authoritative cadastral record"
    geojson: Dict[str, Any]

class IdentifyLandResponse(BaseModel):
    latitude: float
    longitude: float
    reverse_geocode: Optional[ReverseGeocodeResult]
    parcel: Optional[ParcelResponse]
    nearby_parcels: List[ParcelResponse]
    message: str