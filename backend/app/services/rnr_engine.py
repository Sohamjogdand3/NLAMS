from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from app.models.rnr_census import AffectedFamilyCensus


class RnRStatutoryCitation(BaseModel):
    statute: str = "RFCTLARR Act 2013 (Act 30 of 2013)"
    schedule: str = "Second Schedule (Elements of Rehabilitation and Resettlement Entitlements)"
    item_or_section: str
    description: str


class EntitlementItemBreakdown(BaseModel):
    item_code: str
    amount_inr: float
    description: str
    eligibility_rule_applied: str
    statutory_citation: RnRStatutoryCitation


class FullEntitlementAssessment(BaseModel):
    rule_config_version: str = "v2.4-MHA-RNR-2026"
    family_code: str
    family_head_name: str
    category: str
    caste_category: str
    
    # Scheme Eligibility Matching (Not Direct Allotment)
    pmay_housing_eligibility_status: str
    housing_scheme_details: str

    # Itemized Benefit Breakdown
    subsistence_grant: EntitlementItemBreakdown
    resettlement_grant: EntitlementItemBreakdown
    livelihood_annuity: EntitlementItemBreakdown
    cattle_shed_or_petty_shop: Optional[EntitlementItemBreakdown] = None
    artisan_transport_grant: Optional[EntitlementItemBreakdown] = None
    sc_st_special_provision: Optional[EntitlementItemBreakdown] = None

    total_rnr_entitlement_inr: float


class RnRRuleEngine:
    """
    Configurable, Versioned Statutory R&R Entitlement Evaluation Engine.
    Implements Second Schedule entitlements and Section 41/42 SC/ST provisions
    using configurable state rule configurations.
    """

    RULE_CONFIG_VERSION = "v2.4-MHA-RNR-2026"

    # Configurable State Rates (Maharashtra State R&R Directives)
    DEFAULT_MONTHLY_SUBSISTENCE_RATE_INR = 3000.0
    DEFAULT_SUBSISTENCE_MONTHS = 12
    DEFAULT_ONE_TIME_RESETTLEMENT_GRANT_INR = 50000.0
    DEFAULT_ONE_TIME_LIVELIHOOD_ANNUITY_INR = 500000.0
    DEFAULT_CATTLE_SHED_GRANT_INR = 25000.0
    DEFAULT_ARTISAN_TRANSPORT_GRANT_INR = 50000.0
    DEFAULT_SC_ST_ADDITIONAL_GRANT_INR = 50000.0 # Rule-based additional resettlement grant for Scheduled Area displacement

    @classmethod
    def evaluate_family_entitlements(
        cls,
        family: AffectedFamilyCensus,
        is_rural: bool = True,
        monthly_subsistence_override: Optional[float] = None,
        livelihood_annuity_override: Optional[float] = None,
    ) -> FullEntitlementAssessment:
        """
        Evaluates Second Schedule statutory entitlements for an affected non-owner family
        based on their category, livelihood dependency, and caste/vulnerability status.
        """
        monthly_rate = monthly_subsistence_override or cls.DEFAULT_MONTHLY_SUBSISTENCE_RATE_INR
        total_subsistence = round(monthly_rate * cls.DEFAULT_SUBSISTENCE_MONTHS, 2)
        resettlement_grant = cls.DEFAULT_ONE_TIME_RESETTLEMENT_GRANT_INR
        livelihood_annuity = livelihood_annuity_override or cls.DEFAULT_ONE_TIME_LIVELIHOOD_ANNUITY_INR

        # 1. Housing Scheme Eligibility Matching (Second Schedule, Item 1)
        if is_rural:
            pmay_status = "ELIGIBLE_PMAY_RURAL_MATCHING"
            housing_details = "Eligible for Pradhan Mantri Awas Yojana (Gramin) matching allotment (100 sq.m developed homestead plot)."
        else:
            pmay_status = "ELIGIBLE_PMAY_URBAN_MATCHING"
            housing_details = "Eligible for PMAY-Urban / State Housing Board matching (min 50 sq.m carpet area unit)."

        # 2. Subsistence Grant (Second Schedule, Item 4)
        subsistence_item = EntitlementItemBreakdown(
            item_code="SUBSISTENCE_ALLOWANCE_ITEM_4",
            amount_inr=total_subsistence,
            description=f"Monthly subsistence allowance of ₹{monthly_rate:,.2f} for {cls.DEFAULT_SUBSISTENCE_MONTHS} months.",
            eligibility_rule_applied=f"Affected non-owner family dependent on acquired corridor (Category: {family.category}).",
            statutory_citation=RnRStatutoryCitation(
                item_or_section="Second Schedule, Item 4",
                description="Mandatory subsistence grant for displaced / livelihood-affected families.",
            ),
        )

        # 3. One-Time Resettlement Grant (Second Schedule, Item 6)
        resettlement_item = EntitlementItemBreakdown(
            item_code="RESETTLEMENT_GRANT_ITEM_6",
            amount_inr=resettlement_grant,
            description=f"One-time resettlement allowance of ₹{resettlement_grant:,.2f}.",
            eligibility_rule_applied="All verified affected families relocating from acquisition corridor.",
            statutory_citation=RnRStatutoryCitation(
                item_or_section="Second Schedule, Item 6",
                description="One-time financial assistance for shifting and temporary accommodation.",
            ),
        )

        # 4. Livelihood Annuity / Employment Lump Sum (Second Schedule, Item 3)
        livelihood_item = EntitlementItemBreakdown(
            item_code="LIVELIHOOD_ANNUITY_ITEM_3",
            amount_inr=livelihood_annuity,
            description=f"One-time annuity lump-sum grant of ₹{livelihood_annuity:,.2f} in lieu of mandatory employment.",
            eligibility_rule_applied=f"Primary livelihood source loss ({family.primary_livelihood_source}) for family head {family.family_head_name}.",
            statutory_citation=RnRStatutoryCitation(
                item_or_section="Second Schedule, Item 3",
                description="Provision of employment or one-time lump-sum grant of not less than five lakh rupees per family.",
            ),
        )

        # 5. Cattle Shed or Petty Shop Grant (Second Schedule, Item 8)
        cattle_shed_item = None
        if family.category in ["AGRICULTURAL_LABORER", "ARTISAN_TRADER", "TENANT_SHARECROPPER"]:
            cattle_shed_item = EntitlementItemBreakdown(
                item_code="CATTLE_SHED_PETTY_SHOP_ITEM_8",
                amount_inr=cls.DEFAULT_CATTLE_SHED_GRANT_INR,
                description=f"One-time financial assistance of ₹{cls.DEFAULT_CATTLE_SHED_GRANT_INR:,.2f} for cattle shed / commercial setup.",
                eligibility_rule_applied=f"Category verification: {family.category}.",
                statutory_citation=RnRStatutoryCitation(
                    item_or_section="Second Schedule, Item 8",
                    description="Financial assistance for construction of cattle shed or petty shop.",
                ),
            )

        # 6. Artisan / Trader Transport Grant (Second Schedule, Item 7)
        artisan_item = None
        if family.category == "ARTISAN_TRADER":
            artisan_item = EntitlementItemBreakdown(
                item_code="ARTISAN_TRANSPORT_GRANT_ITEM_7",
                amount_inr=cls.DEFAULT_ARTISAN_TRANSPORT_GRANT_INR,
                description=f"One-time artisan / craft equipment transport grant of ₹{cls.DEFAULT_ARTISAN_TRANSPORT_GRANT_INR:,.2f}.",
                eligibility_rule_applied="Rural artisan or self-employed small enterprise relocation.",
                statutory_citation=RnRStatutoryCitation(
                    item_or_section="Second Schedule, Item 7",
                    description="One-time grant for rural artisans and small traders for transport of working tools and equipment.",
                ),
            )

        # 7. SC/ST Rule-Based Special Provision (Section 41 & 42)
        # Eligibility criteria: Belongs to SC/ST caste AND displaced in Scheduled Area / Forest rights zone
        sc_st_item = None
        if family.caste_category in ["SC", "ST"] and (family.is_scheduled_area_displacement or family.category == "FOREST_DWELLER"):
            sc_st_item = EntitlementItemBreakdown(
                item_code="SC_ST_SPECIAL_PROVISION_SEC41_42",
                amount_inr=cls.DEFAULT_SC_ST_ADDITIONAL_GRANT_INR,
                description=f"Section 41/42 Special Tribal R&R Development Grant of ₹{cls.DEFAULT_SC_ST_ADDITIONAL_GRANT_INR:,.2f}.",
                eligibility_rule_applied=f"Caste: {family.caste_category} + Scheduled Area Displacement: {family.is_scheduled_area_displacement}.",
                statutory_citation=RnRStatutoryCitation(
                    item_or_section="Section 41 & 42 of RFCTLARR Act 2013",
                    description="Special provisions and additional financial assistance for Scheduled Castes and Scheduled Tribes displaced from Scheduled Areas.",
                ),
            )

        # Calculate Grand Total
        total_entitlement = (
            subsistence_item.amount_inr
            + resettlement_item.amount_inr
            + livelihood_item.amount_inr
            + (cattle_shed_item.amount_inr if cattle_shed_item else 0.0)
            + (artisan_item.amount_inr if artisan_item else 0.0)
            + (sc_st_item.amount_inr if sc_st_item else 0.0)
        )

        return FullEntitlementAssessment(
            rule_config_version=cls.RULE_CONFIG_VERSION,
            family_code=family.census_family_code,
            family_head_name=family.family_head_name,
            category=family.category,
            caste_category=family.caste_category,
            pmay_housing_eligibility_status=pmay_status,
            housing_scheme_details=housing_details,
            subsistence_grant=subsistence_item,
            resettlement_grant=resettlement_item,
            livelihood_annuity=livelihood_item,
            cattle_shed_or_petty_shop=cattle_shed_item,
            artisan_transport_grant=artisan_item,
            sc_st_special_provision=sc_st_item,
            total_rnr_entitlement_inr=round(total_entitlement, 2),
        )
