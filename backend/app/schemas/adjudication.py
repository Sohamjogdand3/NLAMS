from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# Section 11 Notification & NLAMS Registry Restriction Layer Schemas
# -----------------------------------------------------------------------------
class Sec11PublishRequest(BaseModel):
    gazette_notification_no: str = Field(..., json_schema_extra={"example": "MAH-REV-GAZ-2026/PUN-EXP-11-042"})
    published_date: Optional[datetime] = Field(None, json_schema_extra={"example": "2026-09-29T00:00:00Z"})
    public_notice_summary: str = Field(..., json_schema_extra={"example": "Preliminary notification for acquisition of land for Pune Ring Road Package 3."})


class RegistryRestrictionLayerOut(BaseModel):
    proposal_id: int
    data_source: str = "SIMULATED_MAHABHULEKH_ADAPTER"
    restriction_layer: str = "NLAMS_SIMULATION_GATEWAY"
    status: str = "ACTIVE"
    is_live_government_lock: bool = False
    disclaimer: str = (
        "NLAMS Registry Restriction Layer active in simulation mode. "
        "Transactions, title transfers, and mutations are restricted within the NLAMS workspace. "
        "Does not claim direct legal freezing of live MahaBhulekh databases without state gateway handshake."
    )
    sale_subdivision_locked: bool = True
    title_transfer_locked: bool = True
    mutation_mortgage_locked: bool = True
    restricted_parcels_count: int


class Sec11NotificationOut(BaseModel):
    proposal_id: int
    proposal_code: str
    sec11_notification_no: str
    sec11_published_at: datetime
    sec11_objection_deadline: datetime
    remaining_objection_days: int
    is_objection_window_open: bool
    current_stage: str
    status: str
    registry_restriction_layer: RegistryRestrictionLayerOut


# -----------------------------------------------------------------------------
# Section 15 Objections & Hearing Disposal Schemas
# -----------------------------------------------------------------------------
class ObjectionCreateRequest(BaseModel):
    parcel_id: Optional[int] = Field(None, json_schema_extra={"example": 1})
    survey_number: str = Field(..., json_schema_extra={"example": "101/1"})
    village_name: str = Field(..., json_schema_extra={"example": "Wagholi"})
    objector_name: str = Field(..., json_schema_extra={"example": "Rajesh Patil"})
    objection_category: str = Field(..., json_schema_extra={"example": "AREA_DISCREPANCY"})
    description: str = Field(..., json_schema_extra={"example": "Recorded area in RoR is 2.5 ha, but GIS corridor marks 3.1 ha."})
    supporting_document_url: Optional[str] = Field(None, json_schema_extra={"example": "/uploads/objections/patil_survey_map.pdf"})


class ObjectionScheduleHearingRequest(BaseModel):
    hearing_date: datetime = Field(..., json_schema_extra={"example": "2026-10-15T10:30:00Z"})
    hearing_location: str = Field(..., json_schema_extra={"example": "Sub-Divisional Land Acquisition Office, Haveli Tehsil, Pune"})
    hearing_officer_user_id: int = Field(..., json_schema_extra={"example": 8})


class ObjectionDisposalRequest(BaseModel):
    disposal_status: str = Field(..., json_schema_extra={"example": "DISMISSED_WITH_ORDER"})
    disposal_order_no: str = Field(..., json_schema_extra={"example": "DISP-ORD-2026-PUN-019"})
    disposal_order_summary: str = Field(..., json_schema_extra={"example": "Joint measurement verified recorded boundary; area discrepancy reconciled."})
    hearing_minutes: Optional[str] = Field(None, json_schema_extra={"example": "Objector appeared in person; cadastral sheets reconciled with Talathi records."})


class ObjectionOut(BaseModel):
    id: int
    proposal_id: int
    parcel_id: Optional[int] = None
    citizen_user_id: int
    objection_case_no: str
    objector_name: str
    survey_number: str
    village_name: str
    objection_category: str
    description: str
    supporting_document_url: Optional[str] = None
    hearing_date: Optional[datetime] = None
    hearing_location: Optional[str] = None
    hearing_officer_user_id: Optional[int] = None
    hearing_minutes: Optional[str] = None
    disposal_status: str
    disposal_order_no: Optional[str] = None
    disposal_order_summary: Optional[str] = None
    disposal_order_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# Dual-Pane Citizen Claim Adjudication Schemas
# -----------------------------------------------------------------------------
class ClaimSubmitRequest(BaseModel):
    parcel_id: int = Field(..., json_schema_extra={"example": 1})
    claimant_name: str = Field(..., json_schema_extra={"example": "Rajesh Patil"})
    survey_number: str = Field(..., json_schema_extra={"example": "101/1"})
    village_name: str = Field(..., json_schema_extra={"example": "Wagholi"})
    uploaded_title_deed_url: Optional[str] = Field(None, json_schema_extra={"example": "/uploads/claims/deed_101_1.pdf"})
    uploaded_7_12_extract_url: Optional[str] = Field(None, json_schema_extra={"example": "/uploads/claims/ror_7_12_101_1.pdf"})
    bank_account_no: str = Field(..., json_schema_extra={"example": "987654321001"})
    bank_ifsc_code: str = Field(..., json_schema_extra={"example": "SBIN0001234"})
    bank_name: str = Field(..., json_schema_extra={"example": "State Bank of India"})
    claimed_area_ha: float = Field(..., gt=0, json_schema_extra={"example": 1.25})
    claimed_share_fraction: str = Field("1/1", json_schema_extra={"example": "1/2"})


class ClaimAdjudicateRequest(BaseModel):
    adjudication_status: str = Field(..., json_schema_extra={"example": "VERIFIED_FOR_AWARD"})
    # Statuses: VERIFIED_FOR_AWARD, CLARIFICATION_REQUESTED, HEARING_FLAGGED, REJECTED
    discrepancy_flag: bool = Field(False, json_schema_extra={"example": False})
    discrepancy_details: Optional[str] = Field(None, json_schema_extra={"example": None})
    adjudication_notes: str = Field(..., json_schema_extra={"example": "Verified against 7/12 mutation ledger; ownership share matches cadastral records."})


class ClaimOut(BaseModel):
    id: int
    proposal_id: int
    parcel_id: int
    citizen_user_id: int
    claim_reference_no: str
    claimant_name: str
    survey_number: str
    village_name: str
    uploaded_title_deed_url: Optional[str] = None
    uploaded_7_12_extract_url: Optional[str] = None
    aadhaar_vault_ref: Optional[str] = None
    aadhaar_kyc_status: str
    bank_account_no: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    claimed_area_ha: float
    claimed_share_fraction: str
    adjudication_status: str
    discrepancy_flag: bool
    discrepancy_details: Optional[str] = None
    adjudication_notes: Optional[str] = None
    verified_by_user_id: Optional[int] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# Statutory Valuation & Section 23/30 Award Schemas
# -----------------------------------------------------------------------------
class ValuationComputeRequest(BaseModel):
    parcel_id: int = Field(..., json_schema_extra={"example": 1})
    circle_rate_inr_per_ha: float = Field(..., gt=0, json_schema_extra={"example": 4500000.0})
    avg_top_sale_deeds_rate_inr_per_ha: float = Field(..., gt=0, json_schema_extra={"example": 5200000.0})
    is_rural: bool = Field(True, json_schema_extra={"example": True})
    distance_from_urban_boundary_km: float = Field(15.0, json_schema_extra={"example": 15.0})
    structures_pwd_dsr_inr: float = Field(0.0, ge=0, json_schema_extra={"example": 350000.0})
    trees_horticulture_inr: float = Field(0.0, ge=0, json_schema_extra={"example": 75000.0})
    standing_crops_inr: float = Field(0.0, ge=0, json_schema_extra={"example": 25000.0})
    custom_multiplier_override: Optional[float] = Field(None, json_schema_extra={"example": None})


class AwardPronounceRequest(BaseModel):
    award_order_no: str = Field(..., json_schema_extra={"example": "AWARD-RFCTLARR-2026-PUN-0089"})
    declaration_notes: str = Field(..., json_schema_extra={"example": "Statutory Award signed under Section 23/30 of RFCTLARR Act 2013."})


class StatutoryAwardOut(BaseModel):
    id: int
    proposal_id: int
    parcel_id: int
    claim_id: Optional[int] = None
    award_order_no: str
    survey_number: str
    village_name: str
    primary_khatedar_name: str
    affected_area_ha: float
    valuation_breakdown_json: str
    base_market_value_inr: float
    multiplied_land_value_inr: float
    solatium_100_pct_inr: float
    additional_market_value_12_pct_inr: float
    structural_assets_inr: float
    total_statutory_award_inr: float
    is_pronounced: bool
    award_declared_at: Optional[datetime] = None
    pronounced_by_collector_id: Optional[int] = None
    disbursal_status: str
    disbursed_at: Optional[datetime] = None
    pfms_transaction_ref: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
