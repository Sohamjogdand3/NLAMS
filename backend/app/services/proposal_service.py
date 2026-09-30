import hashlib
import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.project_proposal import ProjectProposal, WorkflowStage
from app.models.proposal_geography import ProposalGeographyMapping
from app.models.project_dpr import ProjectDpr
from app.models.project_gis_corridor import ProjectGisCorridor
from app.models.land_parcel import LandParcel
from app.models.cala_appointment import CalaAppointment
from app.models.expert_committee_appraisal import ExpertCommitteeAppraisal
from app.models.jurisdiction import Jurisdiction, JurisdictionType
from app.models.user import User
from app.core.workflow_engine import WorkflowEngine
from app.services.land_registry_service import LandRegistryService
from app.services.escrow_service import EscrowService
from app.services.audit_service import AuditService

logger = logging.getLogger("nlams.proposal.service")


class ProposalService:
    """
    Project Proposal & State Gateway Orchestration Service.
    Statutory workflow state machine driving stages from Proposal Ingestion to Expert Committee Gate,
    Valuation, Statutory Award, Possession, and Required PIA Handover Acceptance.
    """

    @classmethod
    def create_proposal(
        cls,
        db: Session,
        user: User,
        project_title: str,
        requiring_agency: str,
        ministry: str,
        public_purpose: str,
        estimated_budget_inr: float,
        required_area_ha: float,
        target_district_id: Optional[int] = None,
        target_taluka_ids: Optional[str] = None,
        description: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> ProjectProposal:
        """Creates a new Project Proposal in STAGE_1_REQUISITION with relational geography mappings."""
        seq_count = db.query(ProjectProposal).count() + 1
        agency_clean = (requiring_agency or "PIA").upper().replace(" ", "")
        code = f"PROP-2026-MHA-{agency_clean}-{seq_count:04d}"
        while db.query(ProjectProposal).filter(ProjectProposal.proposal_code == code).first():
            seq_count += 1
            code = f"PROP-2026-MHA-{agency_clean}-{seq_count:04d}"

        # Resolve District & State for Relational Mapping
        district_name = "Pune"
        state_id = None
        taluka_id = None

        if target_district_id:
            d_jur = db.query(Jurisdiction).filter(Jurisdiction.id == target_district_id).first()
            if d_jur:
                district_name = d_jur.name
                state_id = d_jur.parent_id
        
        if not state_id:
            mh = db.query(Jurisdiction).filter(Jurisdiction.code == "MH").first()
            state_id = mh.id if mh else 1

        dist_record = db.query(Jurisdiction).filter(Jurisdiction.name == district_name, Jurisdiction.type == JurisdictionType.DISTRICT).first()
        dist_id = dist_record.id if dist_record else (target_district_id or 2)

        # Resolve Taluka
        taluka_record = db.query(Jurisdiction).filter(Jurisdiction.name == "Haveli", Jurisdiction.parent_id == dist_id).first()
        taluka_id = taluka_record.id if taluka_record else None

        village_names = ["Wagholi", "Manjari Khurd", "Kharadi", "Loni Kalbhor", "Uruli Kanchan"]

        proposal = ProjectProposal(
            proposal_code=code,
            project_title=project_title,
            requiring_agency=requiring_agency,
            ministry=ministry,
            public_purpose=public_purpose,
            description=description,
            estimated_budget_inr=estimated_budget_inr,
            required_area_ha=required_area_ha,
            target_district_id=dist_id,
            target_taluka_ids=target_taluka_ids,
            impacted_districts_json=json.dumps([district_name]),
            impacted_talukas_json=json.dumps(["Haveli"]),
            impacted_villages_json=json.dumps(village_names),
            current_stage=WorkflowStage.STAGE_1_REQUISITION,
            status="DRAFT",
            conflict_status="PENDING_CHECK",
            multiplier_compliance_verified=False,
            created_by_user_id=user.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(proposal)
        db.commit()
        db.refresh(proposal)

        # 1. Relational Geography Mapping: Create normalized relational table records
        primary_mapping = ProposalGeographyMapping(
            proposal_id=proposal.id,
            state_id=state_id,
            district_id=dist_id,
            taluka_id=taluka_id,
            village_id=None,
            is_primary=True,
            created_at=datetime.utcnow(),
        )
        db.add(primary_mapping)

        # Map individual villages if present in database
        for v_name in village_names:
            v_jur = db.query(Jurisdiction).filter(Jurisdiction.name == v_name, Jurisdiction.type == JurisdictionType.VILLAGE).first()
            if v_jur:
                v_map = ProposalGeographyMapping(
                    proposal_id=proposal.id,
                    state_id=state_id,
                    district_id=dist_id,
                    taluka_id=v_jur.parent_id,
                    village_id=v_jur.id,
                    is_primary=False,
                    created_at=datetime.utcnow(),
                )
                db.add(v_map)

        db.commit()

        # 2. Initialize Project Escrow Account
        EscrowService.initialize_escrow(
            db=db,
            proposal_id=proposal.id,
            sanctioned_amount=estimated_budget_inr,
            initial_deposit=estimated_budget_inr * 0.10,
        )

        AuditService.log_event(
            db=db,
            event_type="PROPOSAL_CREATED",
            actor_id=user.id,
            actor_email=user.email,
            ip_address=ip_address,
            jurisdiction_id=dist_id,
            entity_name="PROJECT_PROPOSAL",
            entity_id=str(proposal.id),
            details={
                "proposal_code": code,
                "agency": requiring_agency,
                "budget": estimated_budget_inr,
                "stage": proposal.current_stage,
            },
        )

        logger.info(f"Created Proposal #{code} in {proposal.current_stage} by {user.email}")
        return proposal

    @classmethod
    def attach_dpr_document(
        cls,
        db: Session,
        proposal_id: int,
        user: User,
        document_name: str,
        document_type: str,
        file_path: str,
        file_size_bytes: int = 0,
        file_content: Optional[bytes] = None,
        ip_address: Optional[str] = None,
    ) -> ProjectDpr:
        """Attaches a digital DPR, Feasibility Report, or Cost Voucher."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        file_hash = hashlib.sha256(file_content).hexdigest() if file_content else hashlib.sha256(file_path.encode()).hexdigest()

        dpr = ProjectDpr(
            proposal_id=proposal_id,
            document_name=document_name,
            document_type=document_type,
            file_path=file_path,
            file_size_bytes=file_size_bytes or (len(file_content) if file_content else 1024),
            file_hash=file_hash,
            uploaded_by_user_id=user.id,
            uploaded_at=datetime.utcnow(),
        )
        db.add(dpr)
        db.commit()
        db.refresh(dpr)

        AuditService.log_event(
            db=db,
            event_type="DPR_DOCUMENT_UPLOADED",
            actor_id=user.id,
            actor_email=user.email,
            ip_address=ip_address,
            entity_name="PROJECT_DPR",
            entity_id=str(dpr.id),
            details={"document_name": document_name, "document_type": document_type, "proposal_id": proposal_id},
        )

        return dpr

    @classmethod
    def ingest_gis_corridor_and_populate_parcels(
        cls,
        db: Session,
        proposal_id: int,
        user: User,
        geojson_data: Dict[str, Any],
        bounding_box: Optional[str] = None,
        corridor_length_km: Optional[float] = None,
        corridor_width_meters: Optional[float] = None,
        ip_address: Optional[str] = None,
    ) -> Tuple[ProjectGisCorridor, int]:
        """
        Ingests GIS Corridor Polygon (GeoJSON) and auto-populates cadastral parcels
        via the State Land Registry Service (updating estimated parcels and families).
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        geojson_str = json.dumps(geojson_data) if isinstance(geojson_data, dict) else str(geojson_data)

        gis = db.query(ProjectGisCorridor).filter(ProjectGisCorridor.proposal_id == proposal_id).first()
        if gis:
            gis.geojson_data = geojson_str
            gis.bounding_box = bounding_box
            gis.total_corridor_length_km = corridor_length_km
            gis.corridor_width_meters = corridor_width_meters
        else:
            gis = ProjectGisCorridor(
                proposal_id=proposal_id,
                geojson_data=geojson_str,
                bounding_box=bounding_box,
                total_corridor_length_km=corridor_length_km or 24.5,
                corridor_width_meters=corridor_width_meters or 60.0,
                created_at=datetime.utcnow(),
            )
            db.add(gis)

        db.commit()
        db.refresh(gis)

        # Resolve district & taluka
        district_name = "Pune"
        taluka_name = "Haveli"
        if proposal.target_district_id:
            dist_jur = db.query(Jurisdiction).filter(Jurisdiction.id == proposal.target_district_id).first()
            if dist_jur:
                district_name = dist_jur.name

        parcels = LandRegistryService.query_and_populate_parcels(
            db=db,
            proposal_id=proposal.id,
            district_name=district_name,
            taluka_name=taluka_name,
            estimated_area_ha=proposal.required_area_ha or 15.0,
            jurisdiction_id=proposal.target_district_id,
        )

        # Update estimated counts on proposal
        proposal.estimated_affected_parcels_count = len(parcels)
        proposal.estimated_affected_families_count = sum(p.khatedar_count for p in parcels)
        proposal.updated_at = datetime.utcnow()
        db.commit()

        AuditService.log_event(
            db=db,
            event_type="GIS_CORRIDOR_INGESTED",
            actor_id=user.id,
            actor_email=user.email,
            ip_address=ip_address,
            entity_name="PROJECT_GIS_CORRIDOR",
            entity_id=str(gis.id),
            details={
                "proposal_id": proposal_id,
                "parcels_auto_extracted": len(parcels),
                "estimated_families": proposal.estimated_affected_families_count,
            },
        )

        return gis, len(parcels)

    @classmethod
    def submit_to_state_gateway(
        cls,
        db: Session,
        proposal_id: int,
        user: User,
        ip_address: Optional[str] = None,
    ) -> ProjectProposal:
        """Transitions proposal to STAGE_2_STATE_SCRUTINY via WorkflowEngine."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        proposal = WorkflowEngine.execute_transition(
            db=db,
            proposal=proposal,
            target_stage=WorkflowStage.STAGE_2_STATE_SCRUTINY,
            actor_user=user,
            ip_address=ip_address,
        )

        AuditService.log_event(
            db=db,
            event_type="PROPOSAL_SUBMITTED_TO_STATE",
            actor_id=user.id,
            actor_email=user.email,
            ip_address=ip_address,
            entity_name="PROJECT_PROPOSAL",
            entity_id=str(proposal.id),
            details={
                "proposal_code": proposal.proposal_code,
                "current_stage": proposal.current_stage,
                "status": proposal.status,
            },
        )
        return proposal

    @classmethod
    def scrutinize_proposal(
        cls,
        db: Session,
        proposal_id: int,
        state_admin_user: User,
        conflict_status: str,
        conflict_notes: Optional[str] = None,
        multiplier_verified: bool = True,
        approved: bool = True,
        ip_address: Optional[str] = None,
    ) -> ProjectProposal:
        """State Revenue Nodal conducts conflict scrutiny & Section 26(2) multiplier checks."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        proposal.conflict_status = conflict_status
        proposal.conflict_notes = conflict_notes
        proposal.multiplier_compliance_verified = multiplier_verified

        if approved and conflict_status == "NO_CONFLICT":
            proposal.status = "SCRUTINY_APPROVED"
        elif conflict_status in ["FOREST_CONFLICT", "STRUCTURAL_CONFLICT"]:
            proposal.status = "CONFLICTS_FLAGGED"
        else:
            proposal.status = "UNDER_SCRUTINY"

        proposal.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(proposal)

        AuditService.log_event(
            db=db,
            event_type="PROPOSAL_SCRUTINY_COMPLETED",
            actor_id=state_admin_user.id,
            actor_email=state_admin_user.email,
            ip_address=ip_address,
            entity_name="PROJECT_PROPOSAL",
            entity_id=str(proposal.id),
            details={
                "conflict_status": conflict_status,
                "multiplier_verified": multiplier_verified,
                "status": proposal.status,
                "stage": proposal.current_stage,
            },
        )

        return proposal

    @classmethod
    def appoint_cala(
        cls,
        db: Session,
        proposal_id: int,
        district_id: int,
        collector_user_id: int,
        state_admin_user: User,
        gazette_notification_ref: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> CalaAppointment:
        """Formally appoints District Collector as CALA and transitions to STAGE_3_CALA_APPOINTED."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        collector = db.query(User).filter(User.id == collector_user_id).first()
        if not collector:
            raise ValueError(f"Collector user #{collector_user_id} not found")

        order_no = f"CALA-ORD-MHA-{proposal.id:04d}-{district_id:02d}-{int(datetime.utcnow().timestamp()) % 100000:05d}"
        
        appointment = db.query(CalaAppointment).filter(CalaAppointment.proposal_id == proposal_id).first()
        if appointment:
            appointment.district_id = district_id
            appointment.collector_user_id = collector_user_id
            appointment.appointed_by_user_id = state_admin_user.id
            appointment.appointment_order_no = order_no
            appointment.gazette_notification_ref = gazette_notification_ref
            appointment.status = "ACTIVE"
        else:
            appointment = CalaAppointment(
                proposal_id=proposal_id,
                district_id=district_id,
                collector_user_id=collector_user_id,
                appointed_by_user_id=state_admin_user.id,
                appointment_order_no=order_no,
                gazette_notification_ref=gazette_notification_ref or "MAH-GOV-GAZ-2026/CALA-DELEGATION-441",
                status="ACTIVE",
                appointment_date=datetime.utcnow(),
                created_at=datetime.utcnow(),
            )
            db.add(appointment)

        proposal.target_district_id = district_id
        db.commit()
        db.refresh(appointment)

        # Advance State Machine to STAGE_3_CALA_APPOINTED via WorkflowEngine
        WorkflowEngine.execute_transition(
            db=db,
            proposal=proposal,
            target_stage=WorkflowStage.STAGE_3_CALA_APPOINTED,
            actor_user=state_admin_user,
            action_metadata={"order_no": order_no, "collector_user_id": collector_user_id},
            ip_address=ip_address,
        )

        AuditService.log_event(
            db=db,
            event_type="CALA_APPOINTED_BY_STATE",
            actor_id=state_admin_user.id,
            actor_email=state_admin_user.email,
            ip_address=ip_address,
            entity_name="CALA_APPOINTMENT",
            entity_id=str(appointment.id),
            details={
                "proposal_id": proposal_id,
                "collector_user_id": collector_user_id,
                "order_no": order_no,
            },
        )

        return appointment

    @classmethod
    def record_expert_committee_appraisal(
        cls,
        db: Session,
        proposal_id: int,
        committee_user: User,
        committee_chairperson: str,
        recommendation_status: str,
        clearance_remarks: str,
        public_purpose_verified: bool = True,
        minimal_land_verified: bool = True,
        simp_feasibility_verified: bool = True,
        signed_by_expert_ids: Optional[List[str]] = None,
        ip_address: Optional[str] = None,
    ) -> ExpertCommitteeAppraisal:
        """
        Statutory Expert Committee Appraisal Gate (Section 7, RFCTLARR 2013).
        Validates SIA recommendations and advances workflow to STAGE_5_EXPERT_COMMITTEE_GATE.
        """
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        appraisal = db.query(ExpertCommitteeAppraisal).filter(ExpertCommitteeAppraisal.proposal_id == proposal_id).first()
        if appraisal:
            appraisal.committee_chairperson = committee_chairperson
            appraisal.recommendation_status = recommendation_status
            appraisal.clearance_remarks = clearance_remarks
            appraisal.public_purpose_verified = public_purpose_verified
            appraisal.minimal_land_verified = minimal_land_verified
            appraisal.simp_feasibility_verified = simp_feasibility_verified
            appraisal.signed_by_expert_ids_json = json.dumps(signed_by_expert_ids or [committee_chairperson])
            appraisal.submitted_by_user_id = committee_user.id
        else:
            appraisal = ExpertCommitteeAppraisal(
                proposal_id=proposal_id,
                committee_chairperson=committee_chairperson,
                recommendation_status=recommendation_status,
                clearance_remarks=clearance_remarks,
                public_purpose_verified=public_purpose_verified,
                minimal_land_verified=minimal_land_verified,
                simp_feasibility_verified=simp_feasibility_verified,
                signed_by_expert_ids_json=json.dumps(signed_by_expert_ids or [committee_chairperson]),
                submitted_by_user_id=committee_user.id,
                appraisal_date=datetime.utcnow(),
                created_at=datetime.utcnow(),
            )
            db.add(appraisal)

        db.commit()
        db.refresh(appraisal)

        if recommendation_status == "RECOMMENDED_FOR_ACQUISITION":
            WorkflowEngine.execute_transition(
                db=db,
                proposal=proposal,
                target_stage=WorkflowStage.STAGE_5_EXPERT_COMMITTEE_GATE,
                actor_user=committee_user,
                action_metadata={"recommendation_status": recommendation_status},
                ip_address=ip_address,
            )

        AuditService.log_event(
            db=db,
            event_type="EXPERT_COMMITTEE_APPRAISAL_RECORDED",
            actor_id=committee_user.id,
            actor_email=committee_user.email,
            ip_address=ip_address,
            entity_name="EXPERT_COMMITTEE_APPRAISAL",
            entity_id=str(appraisal.id),
            details={
                "proposal_id": proposal_id,
                "recommendation_status": recommendation_status,
                "committee_chairperson": committee_chairperson,
            },
        )

        return appraisal

    @classmethod
    def compute_valuation(
        cls,
        db: Session,
        proposal_id: int,
        user: User,
        valuation_total_inr: float,
        ip_address: Optional[str] = None,
    ) -> ProjectProposal:
        """Step 9: LAO & CALA computes RFCTLARR statutory award valuation."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        return WorkflowEngine.execute_transition(
            db=db,
            proposal=proposal,
            target_stage=WorkflowStage.STAGE_9_VALUATION_COMPUTED,
            actor_user=user,
            action_metadata={"valuation_total_inr": valuation_total_inr},
            ip_address=ip_address,
        )

    @classmethod
    def pronounce_award(
        cls,
        db: Session,
        proposal_id: int,
        collector_user: User,
        award_order_no: str,
        ip_address: Optional[str] = None,
    ) -> ProjectProposal:
        """Step 10: District Collector pronounces formal Section 23/30 Statutory Award."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        return WorkflowEngine.execute_transition(
            db=db,
            proposal=proposal,
            target_stage=WorkflowStage.STAGE_10_AWARD_PRONOUNCED,
            actor_user=collector_user,
            action_metadata={"award_order_no": award_order_no},
            ip_address=ip_address,
        )

    @classmethod
    def execute_possession_and_mutation(
        cls,
        db: Session,
        proposal_id: int,
        user: User,
        possession_certificate_no: str,
        ip_address: Optional[str] = None,
    ) -> ProjectProposal:
        """Step 12: Tehsildar & CALA execute possession handover and digital RoR mutation."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        return WorkflowEngine.execute_transition(
            db=db,
            proposal=proposal,
            target_stage=WorkflowStage.STAGE_12_POSSESSION_AND_MUTATION,
            actor_user=user,
            action_metadata={"possession_certificate_no": possession_certificate_no},
            ip_address=ip_address,
        )

    @classmethod
    def accept_pia_handover(
        cls,
        db: Session,
        proposal_id: int,
        pia_user: User,
        acceptance_notes: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> ProjectProposal:
        """Step 13: Requiring Agency (PIA) formally accepts site corridor handover after mutation verification."""
        proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
        if not proposal:
            raise ValueError(f"Proposal #{proposal_id} not found")

        return WorkflowEngine.execute_transition(
            db=db,
            proposal=proposal,
            target_stage=WorkflowStage.STAGE_13_PIA_HANDOVER_ACCEPTED,
            actor_user=pia_user,
            action_metadata={"acceptance_notes": acceptance_notes or "Corridor accepted in full after field verification"},
            ip_address=ip_address,
        )
