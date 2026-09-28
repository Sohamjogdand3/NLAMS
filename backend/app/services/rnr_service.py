import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.project_proposal import ProjectProposal
from app.models.rnr_census import AffectedFamilyCensus
from app.models.rnr_entitlement import RnREntitlementPackage
from app.models.community_asset_loss import CommunityAssetLoss
from app.models.user import User
from app.services.rnr_engine import RnRRuleEngine
from app.services.audit_service import AuditService

logger = logging.getLogger("nlams.rnr.service")


class RnRService:
    """
    R&R Social Welfare & Resettlement Administration Service.
    Orchestrates Non-Owner Affected Family Census, Second Schedule Entitlement Package matching,
    and Third Schedule Common Property Resource (CPR) restoration.
    """

    @classmethod
    def record_family_census(
        cls,
        db: Session,
        proposal_id: int,
        family_head_name: str,
        village_name: str,
        category: str,
        primary_livelihood_source: str,
        caste_category: str = "GENERAL",
        is_scheduled_area_displacement: bool = False,
        is_bpl: bool = False,
        family_members_count: int = 4,
        dependency_years: int = 5,
        ration_card_no: Optional[str] = None,
        associated_survey_number: Optional[str] = None,
        surveyor_user: Optional[User] = None,
        ip_address: Optional[str] = None,
    ) -> AffectedFamilyCensus:
        """Registers a non-owner affected family in the census index."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        seq = db.query(AffectedFamilyCensus).filter(AffectedFamilyCensus.proposal_id == proposal_id).count() + 1
        family_code = f"CENSUS-FAM-{proposal.id:04d}-{seq:04d}"

        census = AffectedFamilyCensus(
            proposal_id=proposal_id,
            census_family_code=family_code,
            family_head_name=family_head_name,
            ration_card_no=ration_card_no,
            aadhaar_vault_ref=f"UID-VAULT-XXXX-XXXX-{seq:04d}",
            village_name=village_name,
            associated_survey_number=associated_survey_number,
            category=category,
            caste_category=caste_category,
            is_scheduled_area_displacement=is_scheduled_area_displacement,
            is_bpl=is_bpl,
            family_members_count=family_members_count,
            primary_livelihood_source=primary_livelihood_source,
            dependency_years=dependency_years,
            verification_status="SURVEYED",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(census)
        db.commit()
        db.refresh(census)

        # Update proposal affected families count
        proposal.estimated_affected_families_count = db.query(AffectedFamilyCensus).filter(
            AffectedFamilyCensus.proposal_id == proposal_id
        ).count()
        db.commit()

        if surveyor_user:
            AuditService.log_event(
                db=db,
                event_type="AFFECTED_FAMILY_CENSUS_RECORDED",
                actor_id=surveyor_user.id,
                actor_email=surveyor_user.email,
                ip_address=ip_address,
                jurisdiction_id=proposal.target_district_id,
                entity_name="AFFECTED_FAMILY_CENSUS",
                entity_id=str(census.id),
                details={
                    "family_code": family_code,
                    "family_head": family_head_name,
                    "category": category,
                },
            )

        logger.info(f"Recorded Affected Family Census #{family_code} for Proposal #{proposal.proposal_code}")
        return census

    @classmethod
    def evaluate_and_create_entitlement_package(
        cls,
        db: Session,
        proposal_id: int,
        family_id: int,
        rnr_user: User,
        is_rural: bool = True,
        monthly_subsistence_override: Optional[float] = None,
        livelihood_annuity_override: Optional[float] = None,
        ip_address: Optional[str] = None,
    ) -> RnREntitlementPackage:
        """Evaluates Second Schedule entitlement package for an affected family using the versioned rule engine."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        family = db.query(AffectedFamilyCensus).filter(
            AffectedFamilyCensus.id == family_id,
            AffectedFamilyCensus.proposal_id == proposal_id,
        ).first()
        if not family:
            raise ValueError(f"Family #{family_id} not found on Proposal #{proposal_id}")

        assessment = RnRRuleEngine.evaluate_family_entitlements(
            family=family,
            is_rural=is_rural,
            monthly_subsistence_override=monthly_subsistence_override,
            livelihood_annuity_override=livelihood_annuity_override,
        )

        pkg_code = f"ENT-PKG-2026-{proposal.id:04d}-{family.id:04d}"
        breakdown_json = assessment.model_dump_json(indent=2)

        entitlement = db.query(RnREntitlementPackage).filter(RnREntitlementPackage.family_id == family_id).first()
        if entitlement:
            entitlement.rule_config_version = assessment.rule_config_version
            entitlement.pmay_housing_eligibility_status = assessment.pmay_housing_eligibility_status
            entitlement.housing_plot_or_unit_details = assessment.housing_scheme_details
            entitlement.subsistence_allowance_inr = assessment.subsistence_grant.amount_inr
            entitlement.resettlement_grant_inr = assessment.resettlement_grant.amount_inr
            entitlement.livelihood_annuity_inr = assessment.livelihood_annuity.amount_inr
            entitlement.cattle_shed_petty_shop_inr = assessment.cattle_shed_or_petty_shop.amount_inr if assessment.cattle_shed_or_petty_shop else 0.0
            entitlement.artisan_transport_grant_inr = assessment.artisan_transport_grant.amount_inr if assessment.artisan_transport_grant else 0.0
            entitlement.sc_st_eligibility_criteria_met = bool(assessment.sc_st_special_provision)
            entitlement.sc_st_additional_grant_inr = assessment.sc_st_special_provision.amount_inr if assessment.sc_st_special_provision else 0.0
            entitlement.total_rnr_entitlement_inr = assessment.total_rnr_entitlement_inr
            entitlement.breakdown_json = breakdown_json
            entitlement.status = "DRAFT_ASSESSMENT"
            entitlement.updated_at = datetime.utcnow()
        else:
            entitlement = RnREntitlementPackage(
                proposal_id=proposal_id,
                family_id=family_id,
                entitlement_package_code=pkg_code,
                rule_config_version=assessment.rule_config_version,
                pmay_housing_eligibility_status=assessment.pmay_housing_eligibility_status,
                housing_plot_or_unit_details=assessment.housing_scheme_details,
                subsistence_allowance_inr=assessment.subsistence_grant.amount_inr,
                resettlement_grant_inr=assessment.resettlement_grant.amount_inr,
                livelihood_annuity_inr=assessment.livelihood_annuity.amount_inr,
                cattle_shed_petty_shop_inr=assessment.cattle_shed_or_petty_shop.amount_inr if assessment.cattle_shed_or_petty_shop else 0.0,
                artisan_transport_grant_inr=assessment.artisan_transport_grant.amount_inr if assessment.artisan_transport_grant else 0.0,
                sc_st_eligibility_criteria_met=bool(assessment.sc_st_special_provision),
                sc_st_additional_grant_inr=assessment.sc_st_special_provision.amount_inr if assessment.sc_st_special_provision else 0.0,
                total_rnr_entitlement_inr=assessment.total_rnr_entitlement_inr,
                breakdown_json=breakdown_json,
                status="DRAFT_ASSESSMENT",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(entitlement)

        db.commit()
        db.refresh(entitlement)

        AuditService.log_event(
            db=db,
            event_type="RNR_ENTITLEMENT_PACKAGE_EVALUATED",
            actor_id=rnr_user.id,
            actor_email=rnr_user.email,
            ip_address=ip_address,
            entity_name="RNR_ENTITLEMENT_PACKAGE",
            entity_id=str(entitlement.id),
            details={
                "pkg_code": pkg_code,
                "family_code": family.census_family_code,
                "total_inr": assessment.total_rnr_entitlement_inr,
            },
        )

        logger.info(f"Evaluated Entitlement Package #{pkg_code} totaling ₹{assessment.total_rnr_entitlement_inr:,.2f}")
        return entitlement

    @classmethod
    def approve_entitlement_package(
        cls,
        db: Session,
        entitlement_id: int,
        rnr_admin_user: User,
        approval_notes: str,
        ip_address: Optional[str] = None,
    ) -> RnREntitlementPackage:
        """R&R Administrator formally approves the Second Schedule entitlement package."""
        entitlement = db.query(RnREntitlementPackage).filter(RnREntitlementPackage.id == entitlement_id).first()
        if not entitlement:
            raise ValueError(f"Entitlement Package #{entitlement_id} not found")

        entitlement.status = "APPROVED_BY_RNR_ADMIN"
        entitlement.approval_notes = approval_notes
        entitlement.approved_by_user_id = rnr_admin_user.id
        entitlement.approved_at = datetime.utcnow()
        entitlement.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(entitlement)

        AuditService.log_event(
            db=db,
            event_type="RNR_ENTITLEMENT_APPROVED",
            actor_id=rnr_admin_user.id,
            actor_email=rnr_admin_user.email,
            ip_address=ip_address,
            entity_name="RNR_ENTITLEMENT_PACKAGE",
            entity_id=str(entitlement.id),
            details={
                "pkg_code": entitlement.entitlement_package_code,
                "total_inr": entitlement.total_rnr_entitlement_inr,
                "notes": approval_notes,
            },
        )

        return entitlement

    @classmethod
    def record_community_asset_loss(
        cls,
        db: Session,
        proposal_id: int,
        village_name: str,
        asset_name: str,
        asset_category: str,
        affected_extent: str,
        estimated_restoration_cost_inr: float,
        statutory_amenity_code: str = "AMENITY_ITEM_1",
        survey_number: Optional[str] = None,
        pwd_valuation_ref: Optional[str] = None,
        reconstruction_site_details: Optional[str] = None,
        user: Optional[User] = None,
        ip_address: Optional[str] = None,
    ) -> CommunityAssetLoss:
        """Records loss of Common Property Resources (CPR) under Third Schedule."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        asset = CommunityAssetLoss(
            proposal_id=proposal_id,
            village_name=village_name,
            asset_name=asset_name,
            asset_category=asset_category,
            survey_number=survey_number,
            affected_extent=affected_extent,
            estimated_restoration_cost_inr=estimated_restoration_cost_inr,
            pwd_valuation_ref=pwd_valuation_ref,
            statutory_amenity_code=statutory_amenity_code,
            reconstruction_status="IDENTIFIED",
            reconstruction_site_details=reconstruction_site_details,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(asset)
        db.commit()
        db.refresh(asset)

        if user:
            AuditService.log_event(
                db=db,
                event_type="COMMUNITY_ASSET_LOSS_RECORDED",
                actor_id=user.id,
                actor_email=user.email,
                ip_address=ip_address,
                jurisdiction_id=proposal.target_district_id,
                entity_name="COMMUNITY_ASSET_LOSS",
                entity_id=str(asset.id),
                details={
                    "asset_name": asset_name,
                    "village": village_name,
                    "cost_inr": estimated_restoration_cost_inr,
                },
            )

        logger.info(f"Recorded Community Asset Loss: '{asset_name}' in {village_name} (Est. ₹{estimated_restoration_cost_inr:,.2f})")
        return asset
