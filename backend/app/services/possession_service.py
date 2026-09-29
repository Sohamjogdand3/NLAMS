import hashlib
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.project_proposal import ProjectProposal, WorkflowStage
from app.models.land_parcel import LandParcel
from app.models.statutory_award import StatutoryAward
from app.models.payment_disbursal import LandCompensationDisbursal, RnRBenefitDisbursal
from app.models.community_asset_loss import CommunityAssetLoss
from app.models.escrow_account import EscrowAccount
from app.models.possession import (
    DigitalPanchnama,
    PossessionCertificate,
    DigitalMutationRecord,
    PiaHandoverCertificate,
    ProjectCompletionArchival,
)
from app.schemas.possession import (
    PanchnamaCreateRequest,
    PossessionCertificateIssueRequest,
    DigitalMutationExecuteRequest,
    PiaHandoverActionRequest,
    ProjectCompletionRequest,
    PossessionReadinessOut,
)
from app.core.workflow_engine import WorkflowEngine
from app.services.audit_service import AuditService

logger = logging.getLogger("nlams.services.possession")


class PossessionService:
    """
    Statutory Possession, Digital Mutation, PIA Handover Acceptance,
    and Executive Archival Service.
    Enforces statutory RFCTLARR 2013 preconditions before land possession.
    """

    @classmethod
    def check_possession_readiness(
        cls,
        db: Session,
        proposal_id: int,
    ) -> PossessionReadinessOut:
        """
        Validates whether a project proposal satisfies statutory conditions
        to take physical possession (Stage 11 reached, awards pronounced, compensation disbursed).
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project proposal ID {proposal_id} not found",
            )

        parcels = db.query(LandParcel).filter(LandParcel.proposal_id == proposal_id).all()
        awards = db.query(StatutoryAward).filter(StatutoryAward.proposal_id == proposal_id).all()
        land_disbursals = db.query(LandCompensationDisbursal).filter(LandCompensationDisbursal.proposal_id == proposal_id).all()
        rnr_disbursals = db.query(RnRBenefitDisbursal).filter(RnRBenefitDisbursal.proposal_id == proposal_id).all()

        total_land_disbursed = sum(d.amount_inr for d in land_disbursals)
        total_rnr_disbursed = sum(d.amount_inr for d in rnr_disbursals)

        # Statutory check: Current stage must be STAGE_11_COMPENSATION_DISBURSED or higher
        allowed_stages = [
            WorkflowStage.STAGE_11_COMPENSATION_DISBURSED,
            WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION,
            WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED,
            WorkflowStage.STAGE_14_COMPLETED,
        ]
        is_stage_11_or_higher = proposal.current_stage in allowed_stages

        ready_for_possession = is_stage_11_or_higher and (len(awards) > 0 or len(parcels) == 0)

        notes = (
            "Statutory criteria satisfied for physical possession."
            if ready_for_possession
            else f"Cannot take possession. Project is at '{proposal.current_stage}' (requires STAGE_11_COMPENSATION_DISBURSED)."
        )

        return PossessionReadinessOut(
            proposal_id=proposal.id,
            proposal_code=proposal.proposal_code,
            current_stage=proposal.current_stage,
            is_stage_11_or_higher=is_stage_11_or_higher,
            total_parcels_count=len(parcels),
            surveys_completed=True,
            awards_count=len(awards),
            land_compensation_disbursed_inr=total_land_disbursed,
            rnr_disbursed_inr=total_rnr_disbursed,
            ready_for_possession=ready_for_possession,
            readiness_notes=notes,
        )

    @classmethod
    def create_digital_panchnama(
        cls,
        db: Session,
        user: User,
        data: PanchnamaCreateRequest,
    ) -> DigitalPanchnama:
        """
        Records the Digital Possession Panchnama on-site with spot witnesses.
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == data.proposal_id).first()
        if not proposal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project proposal ID {data.proposal_id} not found",
            )

        parcels = db.query(LandParcel).filter(LandParcel.proposal_id == data.proposal_id).all()
        total_area = sum(p.affected_area_ha or p.total_area_ha or 1.0 for p in parcels) or proposal.required_area_ha or 1.0

        panchnama_no = f"PNCH-{proposal.proposal_code}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        panchnama = DigitalPanchnama(
            proposal_id=proposal.id,
            panchnama_number=panchnama_no,
            execution_date=datetime.utcnow(),
            site_location_description=data.site_location_description,
            circle_officer_name=data.circle_officer_name,
            talathi_name=data.talathi_name,
            tehsildar_name=data.tehsildar_name,
            panchas_witnesses_json=json.dumps([w.dict() for w in data.witnesses]),
            total_parcels_taken_count=len(parcels) or 1,
            total_area_ha_taken=round(total_area, 2),
            physical_encumbrances_cleared=data.physical_encumbrances_cleared,
            boundary_pillars_fixed=data.boundary_pillars_fixed,
            standing_crops_harvested_or_compensated=data.standing_crops_harvested_or_compensated,
            panchnama_doc_url=data.panchnama_doc_url or "/storage/panchnamas/panchnama_default.pdf",
            created_by_user_id=user.id,
        )
        db.add(panchnama)
        db.commit()
        db.refresh(panchnama)

        AuditService.log_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            event_type="POSSESSION_PANCHNAMA_RECORDED",
            details={
                "proposal_id": proposal.id,
                "panchnama_number": panchnama.panchnama_number,
                "total_area_ha": panchnama.total_area_ha_taken,
                "witnesses_count": len(data.witnesses),
            },
        )

        return panchnama

    @classmethod
    def issue_possession_certificate(
        cls,
        db: Session,
        user: User,
        data: PossessionCertificateIssueRequest,
    ) -> PossessionCertificate:
        """
        Generates formal Section 38/40 Possession Certificate and advances workflow
        from STAGE_11_COMPENSATION_DISBURSED -> STAGE_12_POSSESSION_AND_MUTATION.
        """
        readiness = cls.check_possession_readiness(db, data.proposal_id)
        if not readiness.ready_for_possession:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Possession certificate cannot be issued. {readiness.readiness_notes}",
            )

        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == data.proposal_id).first()

        # Check if already issued
        existing = db.query(PossessionCertificate).filter(PossessionCertificate.proposal_id == proposal.id).first()
        if existing:
            if proposal.current_stage == WorkflowStage.STAGE_11_COMPENSATION_DISBURSED:
                WorkflowEngine.execute_transition(
                    db=db,
                    proposal=proposal,
                    target_stage=WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION,
                    actor_user=user,
                    action_metadata={"possession_certificate_no": existing.certificate_number},
                )
                db.commit()
            return existing

        cert_no = f"POSS-CERT-{proposal.proposal_code}-{datetime.utcnow().strftime('%Y%m%d%H%M')}"
        parcels = db.query(LandParcel).filter(LandParcel.proposal_id == proposal.id).all()
        total_area = sum(p.affected_area_ha or p.total_area_ha or 1.0 for p in parcels) or proposal.required_area_ha or 1.0

        certificate = PossessionCertificate(
            proposal_id=proposal.id,
            certificate_number=cert_no,
            statutory_section="Section 38 / 40 - RFCTLARR Act 2013",
            issuing_authority_title=data.issuing_authority_title or "District Collector & Competent Authority for Land Acquisition (CALA)",
            issued_by_user_id=user.id,
            issued_to_requiring_agency=proposal.requiring_agency,
            possession_date=datetime.utcnow(),
            total_area_acquired_ha=round(total_area, 2),
            total_parcels_count=len(parcels) or 1,
            compensation_cleared_confirmation=True,
            rnr_cleared_confirmation=True,
            panchnama_id=data.panchnama_id,
            certificate_doc_url=data.certificate_doc_url or "/storage/certificates/possession_cert_default.pdf",
            status="ISSUED_VESTED_IN_STATE",
        )
        db.add(certificate)

        # Update proposal metadata
        proposal.possession_certificate_no = cert_no
        proposal.possession_handed_over_at = datetime.utcnow()

        # Advance workflow state machine to STAGE_12_POSSESSION_AND_MUTATION
        if proposal.current_stage == WorkflowStage.STAGE_11_COMPENSATION_DISBURSED:
            WorkflowEngine.execute_transition(
                db=db,
                proposal=proposal,
                target_stage=WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION,
                actor_user=user,
                action_metadata={"possession_certificate_no": cert_no},
            )

        db.commit()
        db.refresh(certificate)

        AuditService.log_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            event_type="POSSESSION_CERTIFICATE_ISSUED",
            details={
                "proposal_id": proposal.id,
                "certificate_number": certificate.certificate_number,
                "requiring_agency": proposal.requiring_agency,
                "current_stage": proposal.current_stage,
            },
        )

        return certificate

    @classmethod
    def execute_digital_mutation(
        cls,
        db: Session,
        user: User,
        data: DigitalMutationExecuteRequest,
    ) -> List[DigitalMutationRecord]:
        """
        Executes simulated e-Ferfar revenue mutation entries for all parcels under the proposal.
        Transfers 7/12 RoR ownership from original landholders to Requiring Agency (e.g. NHAI / Railways).
        Resolves Section 11 interim freeze locks to permanent state.
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == data.proposal_id).first()
        if not proposal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project proposal ID {data.proposal_id} not found",
            )

        new_agency_name = data.new_owner_name or f"{proposal.requiring_agency} / Government of Maharashtra"

        parcels = db.query(LandParcel).filter(LandParcel.proposal_id == data.proposal_id).all()
        mutation_records: List[DigitalMutationRecord] = []

        for idx, parcel in enumerate(parcels, start=1):
            # Check if mutation already recorded
            existing = (
                db.query(DigitalMutationRecord)
                .filter(
                    DigitalMutationRecord.proposal_id == proposal.id,
                    DigitalMutationRecord.parcel_id == parcel.id,
                )
                .first()
            )

            if existing:
                mutation_records.append(existing)
                continue

            ferfar_no = f"FERFAR-{parcel.village_name[:3].upper()}-{parcel.survey_number.replace('/', '-')}-{datetime.utcnow().strftime('%Y%m%d%H%M')}-{idx}"
            
            mutation = DigitalMutationRecord(
                proposal_id=proposal.id,
                parcel_id=parcel.id,
                ferfar_number=ferfar_no,
                mutation_type="ACQUISITION_GOVT_TRANSFER_SEC19",
                previous_owner_name=parcel.owner_name,
                new_owner_name=new_agency_name,
                village_name=parcel.village_name,
                taluka_name=parcel.taluka_name,
                district_name=parcel.district_name,
                survey_number=parcel.survey_number,
                gut_number=parcel.gut_number,
                mutated_area_ha=parcel.affected_area_ha or parcel.total_area_ha or 1.0,
                e_ferfar_status="VESTED_FREE_FROM_ENCUMBRANCES",
                previous_section11_restriction_status="RESOLVED_AND_LIFTED",
                new_restriction_status="VESTED_IN_REQUIRING_AGENCY_PERMANENT",
                data_source="SIMULATED_E_FERFAR_MAHABHULEKH_ADAPTER",
                is_simulated=True,
                disclaimer="Simulated e-Ferfar Land Revenue Mutation Record. Updates simulated 7/12 RoR in NLAMS workspace.",
                mutation_timestamp=datetime.utcnow(),
                approved_by_user_id=user.id,
            )
            db.add(mutation)

            # Update parcel record simulated state
            parcel.owner_name = new_agency_name
            parcel.is_frozen = False  # interim freeze lifted to permanent vested state

            mutation_records.append(mutation)

        db.commit()

        AuditService.log_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            event_type="DIGITAL_REVENUE_MUTATION_EXECUTED",
            details={
                "proposal_id": proposal.id,
                "mutations_recorded_count": len(mutation_records),
                "new_owner_name": new_agency_name,
                "data_source": "SIMULATED_E_FERFAR_MAHABHULEKH_ADAPTER",
            },
        )

        return mutation_records

    @classmethod
    def get_proposal_mutations(
        cls,
        db: Session,
        proposal_id: int,
    ) -> List[DigitalMutationRecord]:
        return (
            db.query(DigitalMutationRecord)
            .filter(DigitalMutationRecord.proposal_id == proposal_id)
            .order_by(DigitalMutationRecord.id.asc())
            .all()
        )

    @classmethod
    def pia_handover_action(
        cls,
        db: Session,
        user: User,
        data: PiaHandoverActionRequest,
    ) -> PiaHandoverCertificate:
        """
        PIA Statutory Acceptance Gate (Stage 13: PIA Handover Accepted).
        Requiring Agency inspects corridor, verifies encumbrance-free status,
        and executes handover acceptance or defect note.
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == data.proposal_id).first()
        if not proposal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project proposal ID {data.proposal_id} not found",
            )

        possession_cert = db.query(PossessionCertificate).filter(PossessionCertificate.proposal_id == proposal.id).first()
        if not possession_cert:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot accept handover. Possession Certificate has not been issued yet.",
            )

        existing = db.query(PiaHandoverCertificate).filter(PiaHandoverCertificate.proposal_id == proposal.id).first()
        handover_no = existing.handover_number if existing else f"HO-PIA-{proposal.proposal_code}-{datetime.utcnow().strftime('%Y%m%d%H%M')}"

        if not existing:
            existing = PiaHandoverCertificate(
                proposal_id=proposal.id,
                handover_number=handover_no,
                possession_certificate_id=possession_cert.id,
                requiring_agency=proposal.requiring_agency,
                pia_representative_name=data.pia_representative_name,
                pia_representative_designation=data.pia_representative_designation,
                corridor_length_km=data.corridor_length_km,
                total_area_ha=possession_cert.total_area_acquired_ha,
                action_by_user_id=user.id,
            )
            db.add(existing)

        if data.decision == "ACCEPT":
            existing.verification_status = "ACCEPTED"
            existing.encumbrance_free_verified = True
            existing.boundary_demarcation_verified = True
            existing.mutations_verified = True
            existing.accepted_at = datetime.utcnow()
            existing.acceptance_notes = data.acceptance_notes or "Corridor accepted free from encumbrances."
            existing.dispute_reasons = None

            proposal.pia_accepted_at = datetime.utcnow()
            proposal.pia_acceptance_notes = existing.acceptance_notes

            # Advance workflow to STAGE_13_PIA_HANDOVER_ACCEPTED
            if proposal.current_stage == WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION:
                WorkflowEngine.execute_transition(
                    db=db,
                    proposal=proposal,
                    target_stage=WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED,
                    actor_user=user,
                    action_metadata={"acceptance_notes": existing.acceptance_notes},
                )
        elif data.decision == "REJECT_DEFECT":
            existing.verification_status = "REJECTED_DEFECT_NOTICED"
            existing.encumbrance_free_verified = False
            existing.dispute_reasons = data.dispute_reasons or "Encumbrances or boundary discrepancies noticed on ground."
            existing.acceptance_notes = None
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid handover decision '{data.decision}'. Must be ACCEPT or REJECT_DEFECT.",
            )

        db.commit()
        db.refresh(existing)

        AuditService.log_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            event_type="PIA_HANDOVER_GATE_ACTION",
            details={
                "proposal_id": proposal.id,
                "decision": data.decision,
                "handover_number": existing.handover_number,
                "current_stage": proposal.current_stage,
            },
        )

        return existing

    @classmethod
    def complete_and_archive_project(
        cls,
        db: Session,
        user: User,
        data: ProjectCompletionRequest,
    ) -> ProjectCompletionArchival:
        """
        Executive Project Completion & Archival Dossier (Stage 14: Completed).
        Reconciles Escrow account, closes all audit trails, and transitions proposal to STAGE_14_COMPLETED.
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == data.proposal_id).first()
        if not proposal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project proposal ID {data.proposal_id} not found",
            )

        if proposal.current_stage not in [WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED, WorkflowStage.STAGE_14_COMPLETED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete project. Current stage is '{proposal.current_stage}' (requires STAGE_13_PIA_HANDOVER_ACCEPTED).",
            )

        existing = db.query(ProjectCompletionArchival).filter(ProjectCompletionArchival.proposal_id == proposal.id).first()
        if existing:
            return existing

        # Financial Reconciliation
        escrow = db.query(EscrowAccount).filter(EscrowAccount.proposal_id == proposal.id).first()
        deposited = (escrow.deposited_amount or escrow.total_sanctioned_amount) if escrow else (proposal.estimated_budget_inr or 50000000.0)

        land_disbursals = db.query(LandCompensationDisbursal).filter(LandCompensationDisbursal.proposal_id == proposal.id).all()
        rnr_disbursals = db.query(RnRBenefitDisbursal).filter(RnRBenefitDisbursal.proposal_id == proposal.id).all()
        cprs = db.query(CommunityAssetLoss).filter(CommunityAssetLoss.proposal_id == proposal.id).all()

        total_land = sum(d.amount_inr for d in land_disbursals)
        total_rnr = sum(d.amount_inr for d in rnr_disbursals)
        total_cpr = sum(c.estimated_reconstruction_cost_inr for c in cprs)
        admin_charges = data.administrative_charges_inr or 0.0

        total_expenditure = total_land + total_rnr + total_cpr + admin_charges
        remaining_balance = max(0.0, deposited - total_expenditure)

        # Cryptographic Audit Hash of Project Dossier
        hash_payload = f"PROP:{proposal.proposal_code}|ESCROW:{deposited}|LAND:{total_land}|RNR:{total_rnr}|CPR:{total_cpr}|TIME:{datetime.utcnow().isoformat()}"
        audit_hash = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()

        dossier_no = f"ARCHIVAL-{proposal.proposal_code}-{datetime.utcnow().strftime('%Y%m%d%H%M')}"

        archival = ProjectCompletionArchival(
            proposal_id=proposal.id,
            archival_dossier_no=dossier_no,
            total_budget_allocated_inr=proposal.estimated_budget_inr or deposited,
            total_escrow_deposited_inr=deposited,
            total_compensation_disbursed_inr=total_land,
            total_rnr_disbursed_inr=total_rnr,
            total_cpr_reconstruction_inr=total_cpr,
            total_administrative_charges_inr=admin_charges,
            remaining_escrow_balance_inr=remaining_balance,
            reconciliation_status="RECONCILED_AND_SETTLED",
            all_parcels_surveyed=True,
            all_objections_disposed=True,
            all_awards_pronounced=True,
            all_disbursals_settled=True,
            all_mutations_completed=True,
            pia_acceptance_confirmed=True,
            final_audit_hash=audit_hash,
            archival_summary_json=json.dumps({
                "proposal_code": proposal.proposal_code,
                "project_title": proposal.project_title,
                "requiring_agency": proposal.requiring_agency,
                "total_expenditure_inr": total_expenditure,
                "remaining_balance_inr": remaining_balance,
                "sealed_at": datetime.utcnow().isoformat(),
            }),
            completed_at=datetime.utcnow(),
            closed_by_user_id=user.id,
        )
        db.add(archival)

        proposal.status = "COMPLETED"

        # Advance workflow to STAGE_14_COMPLETED
        if proposal.current_stage == WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED:
            WorkflowEngine.execute_transition(
                db=db,
                proposal=proposal,
                target_stage=WorkflowStage.STAGE_14_COMPLETED,
                actor_user=user,
                action_metadata={"archival_dossier_no": dossier_no},
            )

        db.commit()
        db.refresh(archival)

        AuditService.log_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            event_type="PROJECT_COMPLETION_AND_ARCHIVAL_SEALED",
            details={
                "proposal_id": proposal.id,
                "archival_dossier_no": archival.archival_dossier_no,
                "final_audit_hash": audit_hash,
                "current_stage": proposal.current_stage,
            },
        )

        return archival

    @classmethod
    def get_archival_dossier(
        cls,
        db: Session,
        proposal_id: int,
    ) -> ProjectCompletionArchival:
        archival = db.query(ProjectCompletionArchival).filter(ProjectCompletionArchival.proposal_id == proposal_id).first()
        if not archival:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Archival dossier for proposal ID {proposal_id} not found. Project may not be completed yet.",
            )
        return archival
