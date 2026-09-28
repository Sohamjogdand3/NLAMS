import math
from datetime import datetime, date
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class StatutoryCitation(BaseModel):
    statute: str = "Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (Act 30 of 2013)"
    section: str
    rule_or_notification: str
    description: str


class ComponentBreakdown(BaseModel):
    component_name: str
    amount_inr: float
    computation_formula: str
    parameters_applied: Dict[str, Any]
    statutory_citation: StatutoryCitation


class StatutoryValuationBreakdown(BaseModel):
    engine_version: str = "v2.4-MHA-CONFIGURABLE"
    jurisdiction_state: str = "Maharashtra"
    valuation_date: str
    survey_number: str
    affected_area_ha: float
    land_category: str
    
    # Itemized Components
    market_value_component: ComponentBreakdown
    multiplier_component: ComponentBreakdown
    solatium_component: ComponentBreakdown
    additional_market_value_component: Optional[ComponentBreakdown] = None
    assets_valuation_component: Optional[ComponentBreakdown] = None
    
    # Summary Totals
    base_land_value_inr: float
    multiplied_land_value_inr: float
    total_solatium_inr: float
    total_additional_market_value_inr: float
    total_assets_valuation_inr: float
    grand_total_award_inr: float


class StatutoryValuationEngine:
    """
    Configurable, Versioned RFCTLARR Statutory Award Valuation Engine.
    Implements independent, auditable calculation modules with explicit statutory citations
    (Sections 26, 29, 30 of RFCTLARR Act 2013 and Maharashtra State Notifications).
    """

    ENGINE_VERSION = "v2.4-MHA-CONFIGURABLE"

    @classmethod
    def resolve_market_value(
        cls,
        circle_rate_inr_per_ha: float,
        avg_top_sale_deeds_rate_inr_per_ha: float,
        consensual_agreement_rate_inr_per_ha: Optional[float] = None,
        affected_area_ha: float = 1.0,
    ) -> ComponentBreakdown:
        """
        Section 26(1): Determines baseline market value by comparing:
        (a) Ready Reckoner / Circle rate
        (b) Average of top 50% recorded sale deeds in the vicinity
        (c) Consensual / Negotiated amount
        Takes the HIGHEST value as per statutory requirement.
        """
        rates = {
            "circle_rate": circle_rate_inr_per_ha,
            "sale_deeds_avg": avg_top_sale_deeds_rate_inr_per_ha,
        }
        if consensual_agreement_rate_inr_per_ha:
            rates["consensual_rate"] = consensual_agreement_rate_inr_per_ha

        highest_rate_key = max(rates, key=rates.get)
        selected_rate_per_ha = rates[highest_rate_key]
        total_base_value = round(selected_rate_per_ha * affected_area_ha, 2)

        formula_desc = (
            f"MAX(Circle Rate: ₹{circle_rate_inr_per_ha:,.2f}/ha, "
            f"Sale Deeds Avg: ₹{avg_top_sale_deeds_rate_inr_per_ha:,.2f}/ha) "
            f"× {affected_area_ha:.4f} ha = ₹{total_base_value:,.2f}"
        )

        return ComponentBreakdown(
            component_name="BASE_MARKET_VALUE_SEC26",
            amount_inr=total_base_value,
            computation_formula=formula_desc,
            parameters_applied={
                "circle_rate_per_ha": circle_rate_inr_per_ha,
                "sale_deeds_avg_per_ha": avg_top_sale_deeds_rate_inr_per_ha,
                "selected_criterion": highest_rate_key,
                "selected_rate_per_ha": selected_rate_per_ha,
                "affected_area_ha": affected_area_ha,
            },
            statutory_citation=StatutoryCitation(
                section="Section 26(1)(a)/(b)/(c)",
                rule_or_notification="RFCTLARR Act 2013 Section 26(1) read with Rule 11 of Maharashtra State Land Acquisition Rules",
                description="Statutory determination of base market rate using the highest of circle rate or average sale deed value.",
            ),
        )

    @classmethod
    def resolve_multiplier_factor(
        cls,
        base_market_value_inr: float,
        is_rural: bool = True,
        distance_from_urban_boundary_km: float = 12.0,
        custom_multiplier_override: Optional[float] = None,
    ) -> ComponentBreakdown:
        """
        Section 26(2) + First Schedule (Item 2):
        Applies regional multiplier factor (Urban: 1.0x, Rural: 1.25x - 2.0x based on distance).
        """
        if custom_multiplier_override is not None:
            multiplier = custom_multiplier_override
            rule_ref = "State Government Notification Custom Schedule"
        elif not is_rural:
            multiplier = 1.0
            rule_ref = "Urban Area Multiplier (1.0x) as per First Schedule Table 1"
        else:
            # Maharashtra Government Revenue & Forest Department Multiplier Matrix
            if distance_from_urban_boundary_km <= 10.0:
                multiplier = 1.25
            elif distance_from_urban_boundary_km <= 20.0:
                multiplier = 1.50
            elif distance_from_urban_boundary_km <= 30.0:
                multiplier = 1.75
            else:
                multiplier = 2.00
            rule_ref = f"Rural Area Distance Matrix ({distance_from_urban_boundary_km} km from urban boundary: {multiplier}x)"

        multiplied_value = round(base_market_value_inr * multiplier, 2)
        formula_desc = f"Base Value ₹{base_market_value_inr:,.2f} × Multiplier {multiplier:.2f}x = ₹{multiplied_value:,.2f}"

        return ComponentBreakdown(
            component_name="REGIONAL_MULTIPLIER_SEC26_2",
            amount_inr=multiplied_value,
            computation_formula=formula_desc,
            parameters_applied={
                "is_rural": is_rural,
                "distance_from_urban_boundary_km": distance_from_urban_boundary_km,
                "multiplier_factor": multiplier,
                "base_market_value_inr": base_market_value_inr,
            },
            statutory_citation=StatutoryCitation(
                section="Section 26(2) read with First Schedule (Item 2)",
                rule_or_notification="Govt of Maharashtra Notification No. LQN-12/2014/CR-16/A-2 & Central SO 425(E)",
                description="Regional multiplier factor scaling rural land value based on proximity to urban centers.",
            ),
        )

    @classmethod
    def resolve_solatium(
        cls,
        multiplied_land_value_inr: float,
        assets_valuation_inr: float = 0.0,
    ) -> ComponentBreakdown:
        """
        Section 30(1) + First Schedule (Item 5):
        Mandatory 100% Solatium on the total value of multiplied land and attached assets.
        """
        qualifying_base = multiplied_land_value_inr + assets_valuation_inr
        solatium_amount = round(qualifying_base * 1.0, 2)
        formula_desc = f"100% × (Multiplied Land ₹{multiplied_land_value_inr:,.2f} + Assets ₹{assets_valuation_inr:,.2f}) = ₹{solatium_amount:,.2f}"

        return ComponentBreakdown(
            component_name="SOLATIUM_100_PCT_SEC30_1",
            amount_inr=solatium_amount,
            computation_formula=formula_desc,
            parameters_applied={
                "solatium_percentage": 100.0,
                "multiplied_land_value_inr": multiplied_land_value_inr,
                "assets_valuation_inr": assets_valuation_inr,
                "qualifying_base_inr": qualifying_base,
            },
            statutory_citation=StatutoryCitation(
                section="Section 30(1) read with First Schedule (Item 5)",
                rule_or_notification="RFCTLARR Act 2013 Section 30(1)",
                description="Mandatory 100% Solatium in addition to market value to compensate for compulsory nature of acquisition.",
            ),
        )

    @classmethod
    def resolve_additional_market_value(
        cls,
        base_market_value_inr: float,
        sec11_published_at: datetime,
        award_declaration_date: Optional[datetime] = None,
    ) -> ComponentBreakdown:
        """
        Section 30(3):
        Additional compensation of 12% per annum on base market value from Section 11 publication date to Award date.
        """
        end_date = award_declaration_date or datetime.utcnow()
        if isinstance(sec11_published_at, str):
            sec11_published_at = datetime.fromisoformat(sec11_published_at)
        if isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date)

        days_diff = max(0, (end_date - sec11_published_at).days)
        years_fraction = days_diff / 365.25
        interest_rate_pct = 12.0
        additional_amount = round(base_market_value_inr * (interest_rate_pct / 100.0) * years_fraction, 2)

        formula_desc = (
            f"Base Value ₹{base_market_value_inr:,.2f} × 12% p.a. × "
            f"({days_diff} days / 365.25 = {years_fraction:.3f} years) = ₹{additional_amount:,.2f}"
        )

        return ComponentBreakdown(
            component_name="ADDITIONAL_MARKET_VALUE_SEC30_3",
            amount_inr=additional_amount,
            computation_formula=formula_desc,
            parameters_applied={
                "sec11_published_at": sec11_published_at.isoformat(),
                "award_date": end_date.isoformat(),
                "duration_days": days_diff,
                "annual_rate_pct": interest_rate_pct,
            },
            statutory_citation=StatutoryCitation(
                section="Section 30(3)",
                rule_or_notification="RFCTLARR Act 2013 Section 30(3)",
                description="12% per annum additional compensation for the period between Section 11 publication and Award.",
            ),
        )

    @classmethod
    def resolve_assets_valuation(
        cls,
        structures_pwd_dsr_inr: float = 0.0,
        trees_horticulture_inr: float = 0.0,
        standing_crops_inr: float = 0.0,
        other_immovable_assets_inr: float = 0.0,
    ) -> ComponentBreakdown:
        """
        Section 29(1), 29(2), 29(3):
        Valuation of attached structures (PWD DSR), trees (Horticulture/Forest Dept), and standing crops.
        """
        total_assets = round(structures_pwd_dsr_inr + trees_horticulture_inr + standing_crops_inr + other_immovable_assets_inr, 2)
        formula_desc = (
            f"Structures: ₹{structures_pwd_dsr_inr:,.2f} + Trees: ₹{trees_horticulture_inr:,.2f} + "
            f"Crops: ₹{standing_crops_inr:,.2f} + Other: ₹{other_immovable_assets_inr:,.2f} = ₹{total_assets:,.2f}"
        )

        return ComponentBreakdown(
            component_name="ATTACHED_ASSETS_VALUATION_SEC29",
            amount_inr=total_assets,
            computation_formula=formula_desc,
            parameters_applied={
                "structures_pwd_dsr_inr": structures_pwd_dsr_inr,
                "trees_horticulture_inr": trees_horticulture_inr,
                "standing_crops_inr": standing_crops_inr,
                "other_immovable_assets_inr": other_immovable_assets_inr,
            },
            statutory_citation=StatutoryCitation(
                section="Section 29(1), 29(2), 29(3)",
                rule_or_notification="PWD District Schedule of Rates (DSR) & State Forest/Horticulture Valuation Directives",
                description="Statutory valuation of buildings, structures, wells, fruit/timber trees, and standing crops.",
            ),
        )

    @classmethod
    def compute_full_statutory_award(
        cls,
        survey_number: str,
        affected_area_ha: float,
        land_category: str,
        circle_rate_inr_per_ha: float,
        avg_top_sale_deeds_rate_inr_per_ha: float,
        is_rural: bool = True,
        distance_from_urban_boundary_km: float = 12.0,
        structures_pwd_dsr_inr: float = 0.0,
        trees_horticulture_inr: float = 0.0,
        standing_crops_inr: float = 0.0,
        sec11_published_at: Optional[datetime] = None,
        award_declaration_date: Optional[datetime] = None,
        custom_multiplier_override: Optional[float] = None,
    ) -> StatutoryValuationBreakdown:
        """
        Executes the full modular, auditable RFCTLARR Statutory Award pipeline.
        """
        # 1. Base Market Value (Sec 26(1))
        mv_comp = cls.resolve_market_value(
            circle_rate_inr_per_ha=circle_rate_inr_per_ha,
            avg_top_sale_deeds_rate_inr_per_ha=avg_top_sale_deeds_rate_inr_per_ha,
            affected_area_ha=affected_area_ha,
        )

        # 2. Multiplier Factor (Sec 26(2))
        mult_comp = cls.resolve_multiplier_factor(
            base_market_value_inr=mv_comp.amount_inr,
            is_rural=is_rural,
            distance_from_urban_boundary_km=distance_from_urban_boundary_km,
            custom_multiplier_override=custom_multiplier_override,
        )

        # 3. Attached Assets (Sec 29)
        asset_comp = cls.resolve_assets_valuation(
            structures_pwd_dsr_inr=structures_pwd_dsr_inr,
            trees_horticulture_inr=trees_horticulture_inr,
            standing_crops_inr=standing_crops_inr,
        )

        # 4. Solatium 100% (Sec 30(1))
        sol_comp = cls.resolve_solatium(
            multiplied_land_value_inr=mult_comp.amount_inr,
            assets_valuation_inr=asset_comp.amount_inr,
        )

        # 5. Additional Market Value 12% p.a. (Sec 30(3))
        sec30_3_comp = None
        if sec11_published_at:
            sec30_3_comp = cls.resolve_additional_market_value(
                base_market_value_inr=mv_comp.amount_inr,
                sec11_published_at=sec11_published_at,
                award_declaration_date=award_declaration_date,
            )

        addl_amount = sec30_3_comp.amount_inr if sec30_3_comp else 0.0

        grand_total = round(
            mult_comp.amount_inr + sol_comp.amount_inr + asset_comp.amount_inr + addl_amount,
            2,
        )

        return StatutoryValuationBreakdown(
            engine_version=cls.ENGINE_VERSION,
            jurisdiction_state="Maharashtra",
            valuation_date=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            survey_number=survey_number,
            affected_area_ha=affected_area_ha,
            land_category=land_category,
            market_value_component=mv_comp,
            multiplier_component=mult_comp,
            solatium_component=sol_comp,
            additional_market_value_component=sec30_3_comp,
            assets_valuation_component=asset_comp,
            base_land_value_inr=mv_comp.amount_inr,
            multiplied_land_value_inr=mult_comp.amount_inr,
            total_solatium_inr=sol_comp.amount_inr,
            total_additional_market_value_inr=addl_amount,
            total_assets_valuation_inr=asset_comp.amount_inr,
            grand_total_award_inr=grand_total,
        )
