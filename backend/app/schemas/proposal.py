from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# Proposal Schemas
# -----------------------------------------------------------------------------
class ProposalCreate(BaseModel):
    project_title: str = Field(..., min_length=3, max_length=255, json_schema_extra={"example": "Pune-Nashik Greenfield Semi-High-Speed Rail Corridor"})
    requiring_agency: str = Field(..., max_length=100, json_schema_extra={"example": "NHAI"})
    ministry: str = Field(..., max_length=150, json_schema_extra={"example": "Ministry of Road Transport and Highways (MoRTH)"})
    public_purpose: str = Field(..., max_length=255, json_schema_extra={"example": "National Highway Expansion & Multi-Modal Freight Logistics"})
    description: Optional[str] = Field(None, json_schema_extra={"example": "Acquisition of land for greenfield 6-lane bypass corridor."})
    estimated_budget_inr: float = Field(..., gt=0, json_schema_extra={"example": 450000000.0})
    required_area_ha: float = Field(..., gt=0, json_schema_extra={"example": 35.5})
    target_district_id: Optional[int] = Field(None, json_schema_extra={"example": 2})
    target_taluka_ids: Optional[str] = Field(None, json_schema_extra={"example": "1,2,3"})


class ProposalUpdate(BaseModel):
    project_title: Optional[str] = None
    description: Optional[str] = None
    estimated_budget_inr: Optional[float] = None
    required_area_ha: Optional[float] = None
    target_district_id: Optional[int] = None


class ProjectDprOut(BaseModel):
    id: int
    proposal_id: int
    document_name: str
    document_type: str
    file_path: str
    file_size_bytes: int
    file_hash: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


class GisCorridorIngest(BaseModel):
    geojson_data: Dict[str, Any] = Field(..., json_schema_extra={"example": {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[73.8567, 18.5204], [73.8600, 18.5250], [73.8700, 18.5220], [73.8567, 18.5204]]]
                },
                "properties": {"name": "Phase 1 Alignment"}
            }
        ]
    }})
    bounding_box: Optional[str] = Field(None, json_schema_extra={"example": "73.85,18.50,73.88,18.55"})
    corridor_length_km: Optional[float] = Field(None, json_schema_extra={"example": 28.4})
    corridor_width_meters: Optional[float] = Field(None, json_schema_extra={"example": 60.0})


class GisCorridorOut(BaseModel):
    id: int
    proposal_id: int
    bounding_box: Optional[str] = None
    total_corridor_length_km: Optional[float] = None
    corridor_width_meters: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LandParcelOut(BaseModel):
    id: int
    proposal_id: int
    survey_number: str
    gut_number: Optional[str] = None
    sub_division: Optional[str] = None
    village_name: str
    taluka_name: str
    district_name: str
    land_category: str
    total_area_ha: float
    affected_area_ha: float
    owner_name: str
    aadhaar_vault_ref: Optional[str] = None
    khatedar_count: int
    khasra_roster_json: Optional[str] = None
    data_source: str
    api_version: str
    is_frozen: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProposalOut(BaseModel):
    id: int
    proposal_code: str
    project_title: str
    requiring_agency: str
    ministry: str
    public_purpose: str
    description: Optional[str] = None
    estimated_budget_inr: float
    required_area_ha: float
    target_district_id: Optional[int] = None
    
    # State Machine & Lifecycle Status
    current_stage: str
    status: str
    
    # Geography & Counts
    impacted_districts_json: Optional[str] = None
    impacted_talukas_json: Optional[str] = None
    impacted_villages_json: Optional[str] = None
    estimated_affected_parcels_count: int = 0
    estimated_affected_families_count: int = 0

    # Scrutiny & Multipliers
    conflict_status: str
    conflict_notes: Optional[str] = None
    multiplier_compliance_verified: bool

    # Statutory Milestones
    sec11_notification_no: Optional[str] = None
    sec11_published_at: Optional[datetime] = None
    sec11_objection_deadline: Optional[datetime] = None
    sec19_declaration_no: Optional[str] = None
    sec19_published_at: Optional[datetime] = None
    valuation_computed_at: Optional[datetime] = None
    valuation_total_inr: Optional[float] = None
    award_declaration_date: Optional[datetime] = None
    award_order_no: Optional[str] = None
    compensation_disbursed_at: Optional[datetime] = None
    total_disbursed_inr: Optional[float] = None
    possession_certificate_no: Optional[str] = None
    possession_handed_over_at: Optional[datetime] = None
    pia_accepted_at: Optional[datetime] = None
    pia_acceptance_notes: Optional[str] = None

    created_by_user_id: int
    created_at: datetime
    updated_at: datetime
    parcels_count: Optional[int] = 0
    dpr_count: Optional[int] = 0

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# Scrutiny, CALA Appointment & Expert Committee Schemas
# -----------------------------------------------------------------------------
class ScrutinyRequest(BaseModel):
    conflict_status: str = Field(..., json_schema_extra={"example": "NO_CONFLICT"})
    conflict_notes: Optional[str] = Field(None, json_schema_extra={"example": "Verified against Maharashtra State Master Infrastructure Plan."})
    multiplier_verified: bool = Field(True, json_schema_extra={"example": True})
    approved: bool = Field(True, json_schema_extra={"example": True})


class CalaAppointmentRequest(BaseModel):
    district_id: int = Field(..., json_schema_extra={"example": 2})
    collector_user_id: int = Field(..., json_schema_extra={"example": 7})
    gazette_notification_ref: Optional[str] = Field(None, json_schema_extra={"example": "MAH-GAZ-2026/SEC4-CALA-089"})


class CalaAppointmentOut(BaseModel):
    id: int
    proposal_id: int
    district_id: int
    collector_user_id: int
    appointed_by_user_id: int
    appointment_order_no: str
    appointment_date: datetime
    gazette_notification_ref: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ExpertAppraisalRequest(BaseModel):
    committee_chairperson: str = Field(..., json_schema_extra={"example": "Dr. V. M. Gadgil, Chairman (SIA Expert Panel)"})
    recommendation_status: str = Field("RECOMMENDED_FOR_ACQUISITION", json_schema_extra={"example": "RECOMMENDED_FOR_ACQUISITION"})
    clearance_remarks: str = Field(..., json_schema_extra={"example": "SIA study demonstrates legitimate public purpose with minimal agricultural displacement."})
    public_purpose_verified: bool = Field(True, json_schema_extra={"example": True})
    minimal_land_verified: bool = Field(True, json_schema_extra={"example": True})
    simp_feasibility_verified: bool = Field(True, json_schema_extra={"example": True})
    signed_by_expert_ids: Optional[List[str]] = Field(None, json_schema_extra={"example": ["Dr. Gadgil", "Prof. Deshpande", "Panchayat Rep Shri Patil"]})


class ExpertAppraisalOut(BaseModel):
    id: int
    proposal_id: int
    committee_chairperson: str
    appraisal_date: datetime
    recommendation_status: str
    clearance_remarks: str
    public_purpose_verified: bool
    minimal_land_verified: bool
    simp_feasibility_verified: bool
    signed_by_expert_ids_json: Optional[str] = None
    submitted_by_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# Escrow Schemas
# -----------------------------------------------------------------------------
class EscrowDepositRequest(BaseModel):
    amount: float = Field(..., gt=0, json_schema_extra={"example": 50000000.0})


class EscrowSummaryOut(BaseModel):
    account_number: str
    bank_name: str
    ifsc_code: str
    total_sanctioned_inr: float
    deposited_inr: float
    disbursed_inr: float
    balance_inr: float
    burn_rate_pct: float
    replenishment_threshold_inr: float
    is_replenishment_needed: bool
    status: str
    last_updated: Optional[str] = None
