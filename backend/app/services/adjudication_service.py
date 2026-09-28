import json
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.project_proposal import ProjectProposal, WorkflowStage
from app.models.land_parcel import LandParcel
from app.models.section15_objection import Section15Objection
from app.models.citizen_claim import CitizenClaim
from app.models.statutory_award import StatutoryAward
from app.models.user import User
from app.core.workflow_engine import WorkflowEngine
from app.services.statutory_valuation_engine import StatutoryValuationEngine
from app.services.audit_service import AuditService

logger = logging.getLogger("nlams.adjudication.service")


class AdjudicationService:
    """
    Statutory Adjudication Service for District Collector (CALA) and LAO.
    Orchestrates Section 11 Preliminary Notification, 60-day objection timer,
    NLAMS Registry Restriction Layer, Section 15 hearings, Dual-Pane claim verification,
    modular RFCTLARR valuation, and Section 23/30 Statutory Award pronouncements.
    """

    # -------------------------------------------------------------------------
    # 1. Section 11 Notification & NLAMS Registry Restriction Layer
    # -------------------------------------------------------------------------
    @classmethod
    def publish_section11_notification(
        cls,
        db: Session,
        proposal_id: int,
        collector_user: User,
        gazette_notification_no: str,
        public_notice_summary: str,
        published_date: Optional[datetime] = None,
        ip_address: Optional[str] = None,
    ) -> ProjectProposal:
        """
        Publishes Section 11 Preliminary Notification in official gazette,
        starts the 60-day statutory objection timer, and activates the
        NLAMS Registry Restriction Layer on all corridor parcels.
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        pub_time = published_date or datetime.utcnow()
        objection_deadline = pub_time + timedelta(days=60)

        proposal.sec11_notification_no = gazette_notification_no
        proposal.sec11_published_at = pub_time
        proposal.sec11_objection_deadline = objection_deadline

        # Activate NLAMS Registry Restriction Layer on all corridor parcels
        parcels = db.query(LandParcel).filter(LandParcel.proposal_id == proposal_id).all()
        for p in parcels:
            p.is_frozen = True
            p.freeze_timestamp = pub_time

        db.commit()

        # Advance workflow to STAGE_6_SEC11_PRELIMINARY_NOTIF via WorkflowEngine
        proposal = WorkflowEngine.execute_transition(
            db=db,
            proposal=proposal,
            target_stage=WorkflowStage.STAGE_6_SEC11_PRELIMINARY_NOTIF,
            actor_user=collector_user,
            action_metadata={
                "gazette_notification_no": gazette_notification_no,
                "objection_deadline": objection_deadline.isoformat(),
                "restricted_parcels_count": len(parcels),
            },
            ip_address=ip_address,
        )

        AuditService.log_event(
            db=db,
            event_type="SECTION_11_GAZETTE_PUBLISHED",
            actor_id=collector_user.id,
            actor_email=collector_user.email,
            ip_address=ip_address,
            jurisdiction_id=proposal.target_district_id,
            entity_name="PROJECT_PROPOSAL",
            entity_id=str(proposal.id),
            details={
                "proposal_code": proposal.proposal_code,
                "notification_no": gazette_notification_no,
                "restricted_parcels_count": len(parcels),
                "objection_deadline": objection_deadline.isoformat(),
            },
        )

        logger.info(f"Published Section 11 for Proposal #{proposal.proposal_code}. Restriction layer active on {len(parcels)} parcels.")
        return proposal

    @classmethod
    def get_sec11_and_restriction_status(
        cls,
        db: Session,
        proposal_id: int,
    ) -> Dict[str, Any]:
        """Calculates live 60-day objection timer and returns simulated registry restriction status."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        parcels_count = db.query(LandParcel).filter(LandParcel.proposal_id == proposal_id).count()

        pub_at = proposal.sec11_published_at or datetime.utcnow()
        deadline = proposal.sec11_objection_deadline or (pub_at + timedelta(days=60))
        now = datetime.utcnow()

        days_remaining = max(0, (deadline - now).days)
        is_open = now <= deadline and proposal.sec11_published_at is not None

        return {
            "proposal_id": proposal.id,
            "proposal_code": proposal.proposal_code,
            "sec11_notification_no": proposal.sec11_notification_no or "NOT_PUBLISHED",
            "sec11_published_at": pub_at,
            "sec11_objection_deadline": deadline,
            "remaining_objection_days": days_remaining,
            "is_objection_window_open": is_open,
            "current_stage": proposal.current_stage,
            "status": proposal.status,
            "registry_restriction_layer": {
                "proposal_id": proposal.id,
                "data_source": "SIMULATED_MAHABHULEKH_ADAPTER",
                "restriction_layer": "NLAMS_SIMULATION_GATEWAY",
                "status": "ACTIVE" if proposal.sec11_published_at else "INACTIVE",
                "is_live_government_lock": False,
                "disclaimer": (
                    "NLAMS Registry Restriction Layer active in simulation mode. "
                    "Transactions, title transfers, and mutations are restricted within the NLAMS workspace. "
                    "Does not claim direct legal freezing of live MahaBhulekh databases without state gateway handshake."
                ),
                "sale_subdivision_locked": bool(proposal.sec11_published_at),
                "title_transfer_locked": bool(proposal.sec11_published_at),
                "mutation_mortgage_locked": bool(proposal.sec11_published_at),
                "restricted_parcels_count": parcels_count,
            },
        }

    # -------------------------------------------------------------------------
    # 2. Section 15 Objections & Hearing Disposal Ledger
    # -------------------------------------------------------------------------
    @classmethod
    def file_objection(
        cls,
        db: Session,
        proposal_id: int,
        citizen_user: User,
        survey_number: str,
        village_name: str,
        objector_name: str,
        objection_category: str,
        description: str,
        parcel_id: Optional[int] = None,
        supporting_document_url: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Section15Objection:
        """Files a statutory Section 15 objection within the 60-day window."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        seq = db.query(Section15Objection).filter(Section15Objection.proposal_id == proposal_id).count() + 1
        case_no = f"OBJ-SEC15-{proposal.id:04d}-{seq:03d}"

        objection = Section15Objection(
            proposal_id=proposal_id,
            parcel_id=parcel_id,
            citizen_user_id=citizen_user.id,
            objection_case_no=case_no,
            objector_name=objector_name,
            survey_number=survey_number,
            village_name=village_name,
            objection_category=objection_category,
            description=description,
            supporting_document_url=supporting_document_url,
            disposal_status="FILED",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(objection)
        db.commit()
        db.refresh(objection)

        AuditService.log_event(
            db=db,
            event_type="SECTION_15_OBJECTION_FILED",
            actor_id=citizen_user.id,
            actor_email=citizen_user.email,
            ip_address=ip_address,
            jurisdiction_id=proposal.target_district_id,
            entity_name="SECTION15_OBJECTION",
            entity_id=str(objection.id),
            details={
                "case_no": case_no,
                "category": objection_category,
                "survey_number": survey_number,
                "proposal_id": proposal_id,
            },
        )

        return objection

    @classmethod
    def schedule_hearing(
        cls,
        db: Session,
        objection_id: int,
        hearing_date: datetime,
        hearing_location: str,
        hearing_officer_user_id: int,
        admin_user: User,
        ip_address: Optional[str] = None,
    ) -> Section15Objection:
        """LAO / SDM schedules formal statutory objection hearing."""
        objection = db.query(Section15Objection).filter(Section15Objection.id == objection_id).first()
        if not objection:
            raise ValueError(f"Objection #{objection_id} not found")

        objection.hearing_date = hearing_date
        objection.hearing_location = hearing_location
        objection.hearing_officer_user_id = hearing_officer_user_id
        objection.disposal_status = "HEARING_SCHEDULED"
        objection.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(objection)

        AuditService.log_event(
            db=db,
            event_type="OBJECTION_HEARING_SCHEDULED",
            actor_id=admin_user.id,
            actor_email=admin_user.email,
            ip_address=ip_address,
            entity_name="SECTION15_OBJECTION",
            entity_id=str(objection.id),
            details={
                "case_no": objection.objection_case_no,
                "hearing_date": hearing_date.isoformat(),
                "location": hearing_location,
            },
        )

        return objection

    @classmethod
    def dispose_objection(
        cls,
        db: Session,
        objection_id: int,
        disposal_status: str,
        disposal_order_no: str,
        disposal_order_summary: str,
        lao_user: User,
        hearing_minutes: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Section15Objection:
        """Records formal CALA / LAO disposal order on Section 15 objection."""
        objection = db.query(Section15Objection).filter(Section15Objection.id == objection_id).first()
        if not objection:
            raise ValueError(f"Objection #{objection_id} not found")

        objection.disposal_status = disposal_status
        objection.disposal_order_no = disposal_order_no
        objection.disposal_order_summary = disposal_order_summary
        objection.hearing_minutes = hearing_minutes
        objection.disposal_order_date = datetime.utcnow()
        objection.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(objection)

        AuditService.log_event(
            db=db,
            event_type="OBJECTION_DISPOSED_BY_CALA",
            actor_id=lao_user.id,
            actor_email=lao_user.email,
            ip_address=ip_address,
            entity_name="SECTION15_OBJECTION",
            entity_id=str(objection.id),
            details={
                "case_no": objection.objection_case_no,
                "disposal_status": disposal_status,
                "order_no": disposal_order_no,
            },
        )

        return objection

    # -------------------------------------------------------------------------
    # 3. Dual-Pane Citizen Claim Adjudication
    # -------------------------------------------------------------------------
    @classmethod
    def submit_citizen_claim(
        cls,
        db: Session,
        proposal_id: int,
        parcel_id: int,
        citizen_user: User,
        claimant_name: str,
        survey_number: str,
        village_name: str,
        bank_account_no: str,
        bank_ifsc_code: str,
        bank_name: str,
        claimed_area_ha: float,
        claimed_share_fraction: str = "1/1",
        uploaded_title_deed_url: Optional[str] = None,
        uploaded_7_12_extract_url: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> CitizenClaim:
        """Submits citizen ownership deed & bank credentials for dual-pane claim queue."""
        seq = db.query(CitizenClaim).filter(CitizenClaim.proposal_id == proposal_id).count() + 1
        ref_no = f"CLM-RFCTLARR-{proposal_id:04d}-{seq:04d}"

        claim = CitizenClaim(
            proposal_id=proposal_id,
            parcel_id=parcel_id,
            citizen_user_id=citizen_user.id,
            claim_reference_no=ref_no,
            claimant_name=claimant_name,
            survey_number=survey_number,
            village_name=village_name,
            uploaded_title_deed_url=uploaded_title_deed_url,
            uploaded_7_12_extract_url=uploaded_7_12_extract_url,
            aadhaar_vault_ref=f"UID-VAULT-XXXX-XXXX-{citizen_user.id:04d}",
            aadhaar_kyc_status="VERIFIED_OTP",
            bank_account_no=bank_account_no,
            bank_ifsc_code=bank_ifsc_code,
            bank_name=bank_name,
            claimed_area_ha=claimed_area_ha,
            claimed_share_fraction=claimed_share_fraction,
            adjudication_status="PENDING_REVIEW",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(claim)
        db.commit()
        db.refresh(claim)

        AuditService.log_event(
            db=db,
            event_type="CITIZEN_CLAIM_SUBMITTED",
            actor_id=citizen_user.id,
            actor_email=citizen_user.email,
            ip_address=ip_address,
            entity_name="CITIZEN_CLAIM",
            entity_id=str(claim.id),
            details={
                "claim_ref": ref_no,
                "survey_number": survey_number,
                "claimed_area_ha": claimed_area_ha,
            },
        )

        return claim

    @classmethod
    def adjudicate_claim(
        cls,
        db: Session,
        claim_id: int,
        adjudication_status: str,
        adjudication_notes: str,
        lao_user: User,
        discrepancy_flag: bool = False,
        discrepancy_details: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> CitizenClaim:
        """
        Adjudicates claim: "Approve/Verify Claim for Award Processing".
        Decoupled from payment execution.
        """
        claim = db.query(CitizenClaim).filter(CitizenClaim.id == claim_id).first()
        if not claim:
            raise ValueError(f"Claim #{claim_id} not found")

        claim.adjudication_status = adjudication_status
        claim.adjudication_notes = adjudication_notes
        claim.discrepancy_flag = discrepancy_flag
        claim.discrepancy_details = discrepancy_details
        claim.verified_by_user_id = lao_user.id
        claim.verified_at = datetime.utcnow()
        claim.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(claim)

        AuditService.log_event(
            db=db,
            event_type=f"CLAIM_ADJUDICATION_{adjudication_status}",
            actor_id=lao_user.id,
            actor_email=lao_user.email,
            ip_address=ip_address,
            entity_name="CITIZEN_CLAIM",
            entity_id=str(claim.id),
            details={
                "claim_ref": claim.claim_reference_no,
                "adjudication_status": adjudication_status,
                "notes": adjudication_notes,
            },
        )

        return claim

    # -------------------------------------------------------------------------
    # 4. Modular Statutory Valuation & Section 23/30 Award Pronouncement
    # -------------------------------------------------------------------------
    @classmethod
    def compute_and_record_statutory_valuation(
        cls,
        db: Session,
        proposal_id: int,
        parcel_id: int,
        lao_user: User,
        circle_rate_inr_per_ha: float,
        avg_top_sale_deeds_rate_inr_per_ha: float,
        is_rural: bool = True,
        distance_from_urban_boundary_km: float = 15.0,
        structures_pwd_dsr_inr: float = 0.0,
        trees_horticulture_inr: float = 0.0,
        standing_crops_inr: float = 0.0,
        custom_multiplier_override: Optional[float] = None,
        ip_address: Optional[str] = None,
    ) -> StatutoryAward:
        """
        Computes modular, auditable RFCTLARR Statutory Award breakdown for a parcel
        and saves it to the Statutory Award Ledger (Stage 9).
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        parcel = db.query(LandParcel).filter(LandParcel.id == parcel_id, LandParcel.proposal_id == proposal_id).first()
        if not parcel:
            raise ValueError(f"Parcel #{parcel_id} not found on Proposal #{proposal_id}")

        breakdown = StatutoryValuationEngine.compute_full_statutory_award(
            survey_number=parcel.survey_number,
            affected_area_ha=parcel.affected_area_ha or parcel.total_area_ha or 1.0,
            land_category=parcel.land_category,
            circle_rate_inr_per_ha=circle_rate_inr_per_ha,
            avg_top_sale_deeds_rate_inr_per_ha=avg_top_sale_deeds_rate_inr_per_ha,
            is_rural=is_rural,
            distance_from_urban_boundary_km=distance_from_urban_boundary_km,
            structures_pwd_dsr_inr=structures_pwd_dsr_inr,
            trees_horticulture_inr=trees_horticulture_inr,
            standing_crops_inr=standing_crops_inr,
            sec11_published_at=proposal.sec11_published_at,
            award_declaration_date=datetime.utcnow(),
            custom_multiplier_override=custom_multiplier_override,
        )

        seq = db.query(StatutoryAward).filter(StatutoryAward.proposal_id == proposal_id).count() + 1
        award_order_no = f"AWARD-RFCTLARR-{proposal.id:04d}-{parcel.id:04d}-{seq:02d}"

        breakdown_json = breakdown.model_dump_json(indent=2)

        award = db.query(StatutoryAward).filter(StatutoryAward.parcel_id == parcel_id).first()
        if award:
            award.valuation_breakdown_json = breakdown_json
            award.base_market_value_inr = breakdown.base_land_value_inr
            award.multiplied_land_value_inr = breakdown.multiplied_land_value_inr
            award.solatium_100_pct_inr = breakdown.total_solatium_inr
            award.additional_market_value_12_pct_inr = breakdown.total_additional_market_value_inr
            award.structural_assets_inr = breakdown.total_assets_valuation_inr
            award.total_statutory_award_inr = breakdown.grand_total_award_inr
            award.is_pronounced = False
            award.disbursal_status = "AWAITING_PRONOUNCEMENT"
            award.updated_at = datetime.utcnow()
        else:
            award = StatutoryAward(
                proposal_id=proposal_id,
                parcel_id=parcel_id,
                award_order_no=award_order_no,
                survey_number=parcel.survey_number,
                village_name=parcel.village_name,
                primary_khatedar_name=parcel.owner_name,
                affected_area_ha=parcel.affected_area_ha or parcel.total_area_ha or 1.0,
                valuation_breakdown_json=breakdown_json,
                base_market_value_inr=breakdown.base_land_value_inr,
                multiplied_land_value_inr=breakdown.multiplied_land_value_inr,
                solatium_100_pct_inr=breakdown.total_solatium_inr,
                additional_market_value_12_pct_inr=breakdown.total_additional_market_value_inr,
                structural_assets_inr=breakdown.total_assets_valuation_inr,
                total_statutory_award_inr=breakdown.grand_total_award_inr,
                is_pronounced=False,
                disbursal_status="AWAITING_PRONOUNCEMENT",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(award)

        db.commit()
        db.refresh(award)

        AuditService.log_event(
            db=db,
            event_type="VALUATION_COMPUTED_PER_PARCEL",
            actor_id=lao_user.id,
            actor_email=lao_user.email,
            ip_address=ip_address,
            entity_name="STATUTORY_AWARD",
            entity_id=str(award.id),
            details={
                "award_order_no": award.award_order_no,
                "survey_number": parcel.survey_number,
                "total_award_inr": breakdown.grand_total_award_inr,
            },
        )

        return award

    @classmethod
    def pronounce_statutory_award(
        cls,
        db: Session,
        award_id: int,
        collector_user: User,
        declaration_notes: str,
        ip_address: Optional[str] = None,
    ) -> StatutoryAward:
        """
        District Collector pronounces formal Section 23/30 Statutory Award (Stage 10).
        Locks the compensation award and queues it for PFMS direct disbursal (Stage 11).
        """
        award = db.query(StatutoryAward).filter(StatutoryAward.id == award_id).first()
        if not award:
            raise ValueError(f"Statutory Award #{award_id} not found")

        award.is_pronounced = True
        award.award_declared_at = datetime.utcnow()
        award.pronounced_by_collector_id = collector_user.id
        award.disbursal_status = "AWAITING_PFMS_DISBURSAL"
        award.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(award)

        # Update proposal summary award date
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == award.proposal_id).first()
        if proposal:
            proposal.award_declaration_date = datetime.utcnow()
            proposal.award_order_no = award.award_order_no
            db.commit()

        AuditService.log_event(
            db=db,
            event_type="SECTION_23_30_AWARD_PRONOUNCED",
            actor_id=collector_user.id,
            actor_email=collector_user.email,
            ip_address=ip_address,
            entity_name="STATUTORY_AWARD",
            entity_id=str(award.id),
            details={
                "award_order_no": award.award_order_no,
                "total_inr": award.total_statutory_award_inr,
                "notes": declaration_notes,
            },
        )

        return award
