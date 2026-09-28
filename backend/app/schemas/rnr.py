from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# 1. Affected Family Census Schemas
# -----------------------------------------------------------------------------
class CensusCreateRequest(BaseModel):
    family_head_name: str = Field(..., json_schema_extra={"example": "Anand Shinde"})
    ration_card_no: Optional[str] = Field(None, json_schema_extra={"example": "RC-MH-PUN-99201"})
    village_name: str = Field(..., json_schema_extra={"example": "Wagholi"})
    associated_survey_number: Optional[str] = Field(None, json_schema_extra={"example": "101/2"})
    category: str = Field("AGRICULTURAL_LABORER", json_schema_extra={"example": "AGRICULTURAL_LABORER"})
    # Categories: AGRICULTURAL_LABORER, TENANT_SHARECROPPER, ARTISAN_TRADER, RESIDENTIAL_TENANT, FOREST_DWELLER
    caste_category: str = Field("OBC", json_schema_extra={"example": "SC"})
    # Caste Categories: GENERAL, OBC, SC, ST
    is_scheduled_area_displacement: bool = Field(False, json_schema_extra={"example": False})
    is_bpl: bool = Field(True, json_schema_extra={"example": True})
    family_members_count: int = Field(4, ge=1, json_schema_extra={"example": 5})
    primary_livelihood_source: str = Field(..., json_schema_extra={"example": "Daily Wage Agricultural Labor in Wagholi vineyards"})
    dependency_years: int = Field(6, ge=0, json_schema_extra={"example": 6})


class CensusOut(BaseModel):
    id: int
    proposal_id: int
    census_family_code: str
    family_head_name: str
    ration_card_no: Optional[str] = None
    aadhaar_vault_ref: Optional[str] = None
    village_name: str
    associated_survey_number: Optional[str] = None
    category: str
    caste_category: str
    is_scheduled_area_displacement: bool
    is_bpl: bool
    family_members_count: int
    primary_livelihood_source: str
    dependency_years: int
    verification_status: str
    verification_notes: Optional[str] = None
    verified_by_user_id: Optional[int] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# 2. R&R Entitlement Package Schemas
# -----------------------------------------------------------------------------
class EntitlementEvaluateRequest(BaseModel):
    family_id: int = Field(..., json_schema_extra={"example": 1})
    is_rural: bool = Field(True, json_schema_extra={"example": True})
    monthly_subsistence_override: Optional[float] = Field(None, json_schema_extra={"example": None})
    livelihood_annuity_override: Optional[float] = Field(None, json_schema_extra={"example": None})


class EntitlementApproveRequest(BaseModel):
    approval_notes: str = Field(..., json_schema_extra={"example": "Verified family dependency and SC/ST tribal criteria under Second Schedule."})


class EntitlementOut(BaseModel):
    id: int
    proposal_id: int
    family_id: int
    entitlement_package_code: str
    rule_config_version: str
    pmay_housing_eligibility_status: str
    pmay_matching_reference: Optional[str] = None
    housing_plot_or_unit_details: Optional[str] = None
    subsistence_allowance_inr: float
    resettlement_grant_inr: float
    livelihood_annuity_inr: float
    cattle_shed_petty_shop_inr: float
    artisan_transport_grant_inr: float
    sc_st_eligibility_criteria_met: bool
    sc_st_additional_grant_inr: float
    total_rnr_entitlement_inr: float
    breakdown_json: str
    status: str
    approval_notes: Optional[str] = None
    approved_by_user_id: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# 3. Community Asset & CPR Loss Schemas
# -----------------------------------------------------------------------------
class CommunityAssetCreateRequest(BaseModel):
    village_name: str = Field(..., json_schema_extra={"example": "Wagholi"})
    asset_name: str = Field(..., json_schema_extra={"example": "Village Public Well & Water Cistern"})
    asset_category: str = Field(..., json_schema_extra={"example": "DRINKING_WATER_WELL"})
    survey_number: Optional[str] = Field(None, json_schema_extra={"example": "102"})
    affected_extent: str = Field(..., json_schema_extra={"example": "1 Deep Borewell with Submersible Pump & 5000L Cistern"})
    estimated_restoration_cost_inr: float = Field(..., gt=0, json_schema_extra={"example": 450000.0})
    pwd_valuation_ref: Optional[str] = Field(None, json_schema_extra={"example": "PWD-EST-PUN-2026-091"})
    statutory_amenity_code: str = Field("AMENITY_ITEM_4", json_schema_extra={"example": "AMENITY_ITEM_4"})
    reconstruction_site_details: Optional[str] = Field(None, json_schema_extra={"example": "Gram Panchayat Plot No 14 (East of Gaothan)"})


class CommunityAssetOut(BaseModel):
    id: int
    proposal_id: int
    village_name: str
    asset_name: str
    asset_category: str
    survey_number: Optional[str] = None
    affected_extent: str
    estimated_restoration_cost_inr: float
    pwd_valuation_ref: Optional[str] = None
    statutory_amenity_code: str
    reconstruction_status: str
    reconstruction_site_details: Optional[str] = None
    reconstruction_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# 4. Separate Disbursal Schemas (Land Compensation vs R&R Grants)
# -----------------------------------------------------------------------------
class LandDisbursalRequest(BaseModel):
    bank_account_no: Optional[str] = Field(None, json_schema_extra={"example": "987654321099"})
    bank_ifsc_code: Optional[str] = Field(None, json_schema_extra={"example": "SBIN0001234"})
    bank_name: Optional[str] = Field(None, json_schema_extra={"example": "State Bank of India"})


class LandDisbursalOut(BaseModel):
    id: int
    proposal_id: int
    award_id: int
    escrow_account_id: int
    disbursal_batch_ref: str
    beneficiary_name: str
    survey_number: str
    bank_account_no: str
    bank_ifsc_code: str
    bank_name: str
    amount_inr: float
    pfms_transaction_ref: str
    data_source: str
    is_simulated: bool
    disclaimer: str
    payment_status: str
    disbursed_at: datetime
    authorized_by_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RnRDisbursalRequest(BaseModel):
    bank_account_no: Optional[str] = Field(None, json_schema_extra={"example": "998877665544"})
    bank_ifsc_code: Optional[str] = Field(None, json_schema_extra={"example": "MAHB0000456"})
    bank_name: Optional[str] = Field(None, json_schema_extra={"example": "Bank of Maharashtra"})


class RnRDisbursalOut(BaseModel):
    id: int
    proposal_id: int
    entitlement_package_id: int
    family_id: int
    escrow_account_id: int
    disbursal_batch_ref: str
    beneficiary_name: str
    family_code: str
    bank_account_no: str
    bank_ifsc_code: str
    bank_name: str
    amount_inr: float
    pfms_transaction_ref: str
    data_source: str
    is_simulated: bool
    disclaimer: str
    payment_status: str
    disbursed_at: datetime
    authorized_by_user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
