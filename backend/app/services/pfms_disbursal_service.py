import logging
import random
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.project_proposal import ProjectProposal, WorkflowStage
from app.models.statutory_award import StatutoryAward
from app.models.rnr_entitlement import RnREntitlementPackage
from app.models.rnr_census import AffectedFamilyCensus
from app.models.escrow_account import EscrowAccount
from app.models.payment_disbursal import LandCompensationDisbursal, RnRBenefitDisbursal
from app.models.user import User
from app.core.workflow_engine import WorkflowEngine
from app.services.audit_service import AuditService

logger = logging.getLogger("nlams.pfms.disbursal")


class PfmsDisbursalService:
    """
    Simulated PFMS Direct Benefit Transfer (DBT) Disbursal Service.
    Enforces distinct, separate payment workflows for:
    1. Land Compensation (`StatutoryAward` -> `LandCompensationDisbursal`)
    2. R&R Social Welfare Grants (`RnREntitlementPackage` -> `RnRBenefitDisbursal`)
    All payouts are executed via a clearly labeled SIMULATED adapter that debits the Escrow Account.
    """

    DATA_SOURCE = "SIMULATED_PFMS_GATEWAY_ADAPTER"
    API_VERSION = "v2.4-sim"

    @classmethod
    def generate_simulated_pfms_utr(cls, prefix: str = "PFMS") -> str:
        """Generates authentic synthetic PFMS transaction reference UTR."""
        ts = int(datetime.utcnow().timestamp())
        rand_hex = f"{random.randint(100000, 999999):06d}"
        return f"SIM-{prefix}-2026-MHA-{ts % 100000:05d}-{rand_hex}"

    @classmethod
    def disburse_land_statutory_award(
        cls,
        db: Session,
        proposal_id: int,
        award_id: int,
        authorized_by_user: User,
        bank_account_no: Optional[str] = None,
        bank_ifsc_code: Optional[str] = None,
        bank_name: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> LandCompensationDisbursal:
        """
        Step 11: Controlled PFMS DBT payment of a Section 23/30 Statutory Land Award.
        Debits Escrow Account, records simulated PFMS UTR, and marks award as settled.
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        award = db.query(StatutoryAward).filter(StatutoryAward.id == award_id, StatutoryAward.proposal_id == proposal_id).first()
        if not award:
            raise ValueError(f"Statutory Award #{award_id} not found on Proposal #{proposal_id}")

        if not award.is_pronounced:
            raise ValueError(f"Cannot disburse unpronounced Award #{award.award_order_no}. Collector must pronounce the award first.")

        if award.disbursal_status == "SETTLED_SIMULATED":
            raise ValueError(f"Award #{award.award_order_no} is already settled.")

        escrow = db.query(EscrowAccount).filter(EscrowAccount.proposal_id == proposal_id).first()
        if not escrow:
            raise ValueError(f"Escrow Account not found for Proposal #{proposal_id}")

        amount = award.total_statutory_award_inr
        available_balance = (escrow.deposited_amount or 0.0) - (escrow.disbursed_amount or 0.0)
        if available_balance < amount:
            raise ValueError(
                f"Insufficient Escrow Balance. Available: ₹{available_balance:,.2f}, "
                f"Required: ₹{amount:,.2f}. Requiring Agency must top up Escrow."
            )

        utr = cls.generate_simulated_pfms_utr(prefix="LAND")
        batch_ref = f"BATCH-LAND-2026-{proposal.id:04d}-{int(datetime.utcnow().timestamp()) % 10000:04d}"

        disbursal = LandCompensationDisbursal(
            proposal_id=proposal_id,
            award_id=award_id,
            escrow_account_id=escrow.id,
            disbursal_batch_ref=batch_ref,
            beneficiary_name=award.primary_khatedar_name,
            survey_number=award.survey_number,
            bank_account_no=bank_account_no or "987654321099",
            bank_ifsc_code=bank_ifsc_code or "SBIN0001234",
            bank_name=bank_name or "State Bank of India",
            amount_inr=amount,
            pfms_transaction_ref=utr,
            data_source=cls.DATA_SOURCE,
            is_simulated=True,
            disclaimer="Simulated PFMS DBT transaction record. Executes simulated escrow debit within NLAMS workspace.",
            payment_status="PROCESSED_SIMULATED",
            disbursed_at=datetime.utcnow(),
            authorized_by_user_id=authorized_by_user.id,
            created_at=datetime.utcnow(),
        )
        db.add(disbursal)

        # Debit Escrow Account
        escrow.disbursed_amount = (escrow.disbursed_amount or 0.0) + amount
        escrow.balance_amount = (escrow.deposited_amount or 0.0) - escrow.disbursed_amount
        escrow.updated_at = datetime.utcnow()

        # Update Award status
        award.disbursal_status = "SETTLED_SIMULATED"
        award.disbursed_at = datetime.utcnow()
        award.pfms_transaction_ref = utr
        award.updated_at = datetime.utcnow()

        # Update proposal milestone
        proposal.compensation_disbursed_at = datetime.utcnow()
        proposal.total_disbursed_inr = (proposal.total_disbursed_inr or 0.0) + amount

        # Transition workflow to STAGE_11_COMPENSATION_DISBURSED if ready
        if proposal.current_stage in [WorkflowStage.STAGE_10_AWARD_PRONOUNCED, WorkflowStage.STAGE_9_VALUATION_COMPUTED]:
            WorkflowEngine.execute_transition(
                db=db,
                proposal=proposal,
                target_stage=WorkflowStage.STAGE_11_COMPENSATION_DISBURSED,
                actor_user=authorized_by_user,
                action_metadata={"disbursed_amount_inr": amount, "utr": utr},
                ip_address=ip_address,
            )

        db.commit()
        db.refresh(disbursal)

        AuditService.log_event(
            db=db,
            event_type="LAND_COMPENSATION_DISBURSED_PFMS",
            actor_id=authorized_by_user.id,
            actor_email=authorized_by_user.email,
            ip_address=ip_address,
            entity_name="LAND_COMPENSATION_DISBURSAL",
            entity_id=str(disbursal.id),
            details={
                "award_order_no": award.award_order_no,
                "amount_inr": amount,
                "utr": utr,
                "beneficiary": award.primary_khatedar_name,
            },
        )

        logger.info(f"Disbursed Land Compensation ₹{amount:,.2f} for Award #{award.award_order_no} via {utr}")
        return disbursal

    @classmethod
    def disburse_rnr_entitlement(
        cls,
        db: Session,
        proposal_id: int,
        entitlement_id: int,
        authorized_by_user: User,
        bank_account_no: Optional[str] = None,
        bank_ifsc_code: Optional[str] = None,
        bank_name: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> RnRBenefitDisbursal:
        """
        Step 11: Controlled PFMS DBT payment of R&R Social Welfare Entitlement Package.
        Executes separate social welfare grant payout from Escrow Account to affected family.
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        entitlement = db.query(RnREntitlementPackage).filter(
            RnREntitlementPackage.id == entitlement_id,
            RnREntitlementPackage.proposal_id == proposal_id,
        ).first()
        if not entitlement:
            raise ValueError(f"R&R Entitlement Package #{entitlement_id} not found on Proposal #{proposal_id}")

        if entitlement.status not in ["APPROVED_BY_RNR_ADMIN", "AWAITING_DISBURSAL"]:
            raise ValueError(f"Cannot disburse unapproved package #{entitlement.entitlement_package_code}. Status is '{entitlement.status}'.")

        escrow = db.query(EscrowAccount).filter(EscrowAccount.proposal_id == proposal_id).first()
        if not escrow:
            raise ValueError(f"Escrow Account not found for Proposal #{proposal_id}")

        amount = entitlement.total_rnr_entitlement_inr
        available_balance = (escrow.deposited_amount or 0.0) - (escrow.disbursed_amount or 0.0)
        if available_balance < amount:
            raise ValueError(
                f"Insufficient Escrow Balance for R&R. Available: ₹{available_balance:,.2f}, "
                f"Required: ₹{amount:,.2f}."
            )

        family = db.query(AffectedFamilyCensus).filter(AffectedFamilyCensus.id == entitlement.family_id).first()
        beneficiary_name = family.family_head_name if family else "Affected Family Head"
        family_code = family.census_family_code if family else "FAM-001"

        utr = cls.generate_simulated_pfms_utr(prefix="RNR")
        batch_ref = f"BATCH-RNR-2026-{proposal.id:04d}-{int(datetime.utcnow().timestamp()) % 10000:04d}"

        disbursal = RnRBenefitDisbursal(
            proposal_id=proposal_id,
            entitlement_package_id=entitlement_id,
            family_id=entitlement.family_id,
            escrow_account_id=escrow.id,
            disbursal_batch_ref=batch_ref,
            beneficiary_name=beneficiary_name,
            family_code=family_code,
            bank_account_no=bank_account_no or (family.ration_card_no or "998877665544"),
            bank_ifsc_code=bank_ifsc_code or "MAHB0000456",
            bank_name=bank_name or "Bank of Maharashtra",
            amount_inr=amount,
            pfms_transaction_ref=utr,
            data_source=cls.DATA_SOURCE,
            is_simulated=True,
            disclaimer="Simulated PFMS DBT transaction record for R&R Social Welfare Grants. Executes simulated escrow debit.",
            payment_status="PROCESSED_SIMULATED",
            disbursed_at=datetime.utcnow(),
            authorized_by_user_id=authorized_by_user.id,
            created_at=datetime.utcnow(),
        )
        db.add(disbursal)

        # Debit Escrow Account
        escrow.disbursed_amount = (escrow.disbursed_amount or 0.0) + amount
        escrow.balance_amount = (escrow.deposited_amount or 0.0) - escrow.disbursed_amount
        escrow.updated_at = datetime.utcnow()

        # Update Entitlement Package status
        entitlement.status = "DISBURSED"
        entitlement.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(disbursal)

        AuditService.log_event(
            db=db,
            event_type="RNR_SOCIAL_BENEFIT_DISBURSED_PFMS",
            actor_id=authorized_by_user.id,
            actor_email=authorized_by_user.email,
            ip_address=ip_address,
            entity_name="RNR_BENEFIT_DISBURSAL",
            entity_id=str(disbursal.id),
            details={
                "entitlement_code": entitlement.entitlement_package_code,
                "family_code": family_code,
                "amount_inr": amount,
                "utr": utr,
            },
        )

        logger.info(f"Disbursed R&R Entitlement ₹{amount:,.2f} for Family #{family_code} via {utr}")
        return disbursal
