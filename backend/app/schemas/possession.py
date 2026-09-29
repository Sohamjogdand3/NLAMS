from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# 2. Possession, Mutation, PIA Handover & Archival Schemas
# -----------------------------------------------------------------------------

class PanchaWitnessSchema(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "Ramdas Patil"})
    address: str = Field(..., json_schema_extra={"example": "Wagholi Village, Taluka Haveli, District Pune"})
    aadhaar_masked: str = Field(..., json_schema_extra={"example": "XXXX-XXXX-8821"})
    sign_confirmed: bool = Field(True, json_schema_extra={"example": True})


class PanchnamaCreateRequest(BaseModel):
    proposal_id: int = Field(..., json_schema_extra={"example": 1})
    site_location_description: str = Field(
        ...,
        json_schema_extra={"example": "Village Wagholi & Hadapsar survey numbers along proposed 6-lane Pune bypass corridor."},
    )
    circle_officer_name: str = Field(..., json_schema_extra={"example": "Shri P. K. Deshmukh (Circle Officer)"})
    talathi_name: str = Field(..., json_schema_extra={"example": "Smt. S. M. Kulkarni (Talathi Wagholi)"})
    tehsildar_name: str = Field(..., json_schema_extra={"example": "Shri V. R. Joshi (Executive Magistrate / Tehsildar Haveli)"})
    witnesses: List[PanchaWitnessSchema] = Field(..., min_length=2)
    physical_encumbrances_cleared: bool = Field(True, json_schema_extra={"example": True})
    boundary_pillars_fixed: bool = Field(True, json_schema_extra={"example": True})
    standing_crops_harvested_or_compensated: bool = Field(True, json_schema_extra={"example": True})
    panchnama_doc_url: Optional[str] = Field(
        "/storage/panchnamas/panchnama_pune_ring_road_signed.pdf",
        json_schema_extra={"example": "/storage/panchnamas/panchnama_pune_ring_road_signed.pdf"},
    )


class PossessionCertificateIssueRequest(BaseModel):
    proposal_id: int = Field(..., json_schema_extra={"example": 1})
    panchnama_id: Optional[int] = Field(None, json_schema_extra={"example": 1})
    issuing_authority_title: Optional[str] = Field(
        "District Collector & Competent Authority for Land Acquisition (CALA)",
        json_schema_extra={"example": "District Collector & Competent Authority for Land Acquisition (CALA)"},
    )
    certificate_doc_url: Optional[str] = Field(
        "/storage/certificates/possession_cert_sec38_signed.pdf",
        json_schema_extra={"example": "/storage/certificates/possession_cert_sec38_signed.pdf"},
    )


class DigitalMutationExecuteRequest(BaseModel):
    proposal_id: int = Field(..., json_schema_extra={"example": 1})
    new_owner_name: Optional[str] = Field(
        None,
        json_schema_extra={"example": "National Highways Authority of India (NHAI) / Govt of Maharashtra"},
    )


class PiaHandoverActionRequest(BaseModel):
    proposal_id: int = Field(..., json_schema_extra={"example": 1})
    decision: str = Field(..., json_schema_extra={"example": "ACCEPT"})
    # Decision: ACCEPT, REJECT_DEFECT
    pia_representative_name: str = Field(..., json_schema_extra={"example": "Er. Rajesh Sharma"})
    pia_representative_designation: str = Field(
        "Project Director / General Manager (Tech)",
        json_schema_extra={"example": "Project Director / General Manager (Tech)"},
    )
    corridor_length_km: Optional[float] = Field(None, json_schema_extra={"example": 24.5})
    acceptance_notes: Optional[str] = Field(
        None,
        json_schema_extra={"example": "Corridor inspected on-site. Boundary pillars confirmed, all encumbrances cleared."},
    )
    dispute_reasons: Optional[str] = Field(None, json_schema_extra={"example": None})


class ProjectCompletionRequest(BaseModel):
    proposal_id: int = Field(..., json_schema_extra={"example": 1})
    administrative_charges_inr: Optional[float] = Field(0.0, ge=0, json_schema_extra={"example": 150000.0})


# Out Models
class PanchnamaOut(BaseModel):
    id: int
    proposal_id: int
    panchnama_number: str
    execution_date: datetime
    site_location_description: str
    circle_officer_name: str
    talathi_name: str
    tehsildar_name: str
    panchas_witnesses_json: str
    total_parcels_taken_count: int
    total_area_ha_taken: float
    physical_encumbrances_cleared: bool
    boundary_pillars_fixed: bool
    standing_crops_harvested_or_compensated: bool
    panchnama_doc_url: str
    created_by_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PossessionCertificateOut(BaseModel):
    id: int
    proposal_id: int
    certificate_number: str
    statutory_section: str
    issuing_authority_title: str
    issued_by_user_id: int
    issued_to_requiring_agency: str
    possession_date: datetime
    total_area_acquired_ha: float
    total_parcels_count: int
    compensation_cleared_confirmation: bool
    rnr_cleared_confirmation: bool
    panchnama_id: Optional[int] = None
    certificate_doc_url: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MutationRecordOut(BaseModel):
    id: int
    proposal_id: int
    parcel_id: int
    ferfar_number: str
    mutation_type: str
    previous_owner_name: str
    new_owner_name: str
    village_name: str
    taluka_name: str
    district_name: str
    survey_number: str
    gut_number: Optional[str] = None
    mutated_area_ha: float
    e_ferfar_status: str
    previous_section11_restriction_status: str
    new_restriction_status: str
    data_source: str
    is_simulated: bool
    disclaimer: str
    mutation_timestamp: datetime
    approved_by_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PiaHandoverOut(BaseModel):
    id: int
    proposal_id: int
    handover_number: str
    possession_certificate_id: int
    requiring_agency: str
    pia_representative_name: str
    pia_representative_designation: str
    verification_status: str
    encumbrance_free_verified: bool
    boundary_demarcation_verified: bool
    mutations_verified: bool
    corridor_length_km: Optional[float] = None
    total_area_ha: float
    acceptance_notes: Optional[str] = None
    dispute_reasons: Optional[str] = None
    accepted_at: Optional[datetime] = None
    action_by_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectCompletionOut(BaseModel):
    id: int
    proposal_id: int
    archival_dossier_no: str
    total_budget_allocated_inr: float
    total_escrow_deposited_inr: float
    total_compensation_disbursed_inr: float
    total_rnr_disbursed_inr: float
    total_cpr_reconstruction_inr: float
    total_administrative_charges_inr: float
    remaining_escrow_balance_inr: float
    reconciliation_status: str
    all_parcels_surveyed: bool
    all_objections_disposed: bool
    all_awards_pronounced: bool
    all_disbursals_settled: bool
    all_mutations_completed: bool
    pia_acceptance_confirmed: bool
    final_audit_hash: str
    completed_at: datetime
    closed_by_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PossessionReadinessOut(BaseModel):
    proposal_id: int
    proposal_code: str
    current_stage: str
    is_stage_11_or_higher: bool
    total_parcels_count: int
    surveys_completed: bool
    awards_count: int
    land_compensation_disbursed_inr: float
    rnr_disbursed_inr: float
    ready_for_possession: bool
    readiness_notes: str
