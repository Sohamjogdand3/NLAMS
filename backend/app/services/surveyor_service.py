import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.project_proposal import ProjectProposal
from app.models.land_parcel import LandParcel
from app.models.field_survey import FieldParcelSurvey, GeotaggedAssetEvidence
from app.schemas.surveyor import (
    BoundaryWalkSubmitRequest,
    AssetEvidenceCreateRequest,
    BatchSyncRequest,
    BatchSyncSurveyItem,
    SurveyVerifyRequest,
    ProposalSurveySummaryOut,
)
from app.services.audit_service import AuditService

logger = logging.getLogger("nlams.services.surveyor")


class SurveyorService:
    """
    Field Surveyor Service handling GPS boundary walk calculations,
    geotagged asset audit submissions, offline sync queue processing,
    and revenue official (Talathi / Tehsildar) verifications.
    """

    @classmethod
    def get_surveyor_tasks(
        cls,
        db: Session,
        user: User,
        proposal_id: Optional[int] = None,
        status_filter: Optional[str] = None,
    ) -> List[FieldParcelSurvey]:
        """
        Retrieves list of survey tasks. Automatically seeds/initializes survey records
        for land parcels under active proposals if not already created.
        """
        # If proposal_id given, ensure surveys exist for its parcels
        if proposal_id:
            cls._ensure_surveys_for_proposal(db, proposal_id, user.id)

        query = db.query(FieldParcelSurvey)
        if proposal_id:
            query = query.filter(FieldParcelSurvey.proposal_id == proposal_id)
        if status_filter:
            query = query.filter(FieldParcelSurvey.survey_status == status_filter)

        return query.order_by(FieldParcelSurvey.id.asc()).all()

    @classmethod
    def _ensure_surveys_for_proposal(cls, db: Session, proposal_id: int, fallback_user_id: int):
        parcels = db.query(LandParcel).filter(LandParcel.proposal_id == proposal_id).all()
        for p in parcels:
            existing = (
                db.query(FieldParcelSurvey)
                .filter(
                    FieldParcelSurvey.proposal_id == proposal_id,
                    FieldParcelSurvey.parcel_id == p.id,
                )
                .first()
            )
            if not existing:
                survey = FieldParcelSurvey(
                    proposal_id=proposal_id,
                    parcel_id=p.id,
                    surveyor_user_id=fallback_user_id,
                    khasra_gat_number=p.gut_number or p.survey_number,
                    village_name=p.village_name,
                    taluka_name=p.taluka_name,
                    district_name=p.district_name,
                    prescribed_area_ha=p.affected_area_ha or p.total_area_ha or 1.0,
                    survey_status="ASSIGNED",
                    occupant_name_on_site=p.owner_name,
                    occupant_type="Self-Cultivating Owner",
                    land_use_type=p.land_category if p.land_category != "DRY_CROP" else "Agricultural",
                )
                db.add(survey)
        db.commit()

    @classmethod
    def get_survey_detail(cls, db: Session, task_id: int) -> FieldParcelSurvey:
        survey = db.query(FieldParcelSurvey).filter(FieldParcelSurvey.id == task_id).first()
        if not survey:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Field survey task ID {task_id} not found",
            )
        return survey

    @classmethod
    def record_boundary_walk(
        cls,
        db: Session,
        user: User,
        data: BoundaryWalkSubmitRequest,
    ) -> FieldParcelSurvey:
        """
        Records on-ground GPS boundary walk, calculates variance against prescribed 7/12 area.
        """
        survey = cls.get_survey_detail(db, data.task_id)

        # Calculate area variance percentage
        prescribed = survey.prescribed_area_ha or 1.0
        measured = data.measured_area_ha
        variance = round(abs(measured - prescribed) / prescribed * 100.0, 2)

        # Serialize GPS coordinates
        coords_list = [c.dict() for c in data.gps_coordinates]
        survey.gps_coordinates_json = json.dumps(coords_list)
        survey.measured_area_ha = measured
        survey.variance_percentage = variance
        survey.gps_perimeter_meters = data.gps_perimeter_meters or (measured * 400.0)  # estimate if not provided
        survey.gps_accuracy_meters = data.gps_accuracy_meters or 2.4
        survey.land_use_type = data.land_use_type or survey.land_use_type
        if data.occupant_name_on_site:
            survey.occupant_name_on_site = data.occupant_name_on_site
        if data.occupant_type:
            survey.occupant_type = data.occupant_type
        if data.road_access:
            survey.road_access = data.road_access
        survey.is_disputed_boundary = data.is_disputed_boundary
        survey.dispute_notes = data.dispute_notes
        if data.surveyor_remarks:
            survey.surveyor_remarks = data.surveyor_remarks

        survey.survey_status = "BOUNDARY_WALKED"
        survey.synced_at = datetime.utcnow()
        survey.surveyor_user_id = user.id

        db.commit()
        db.refresh(survey)

        AuditService.log_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            event_type="FIELD_SURVEY_BOUNDARY_WALK_SUBMITTED",
            details={
                "survey_id": survey.id,
                "parcel_id": survey.parcel_id,
                "measured_area_ha": measured,
                "variance_percentage": variance,
                "is_disputed": data.is_disputed_boundary,
            },
        )

        return survey

    @classmethod
    def add_asset_evidence(
        cls,
        db: Session,
        user: User,
        data: AssetEvidenceCreateRequest,
    ) -> GeotaggedAssetEvidence:
        """
        Uploads geotagged photo evidence stamped with location & timestamp.
        """
        survey = cls.get_survey_detail(db, data.survey_id)

        evidence = GeotaggedAssetEvidence(
            survey_id=survey.id,
            parcel_id=survey.parcel_id,
            proposal_id=survey.proposal_id,
            surveyor_user_id=user.id,
            category=data.category,
            caption=data.caption,
            latitude=data.latitude,
            longitude=data.longitude,
            accuracy_meters=data.accuracy_meters,
            file_url=data.file_url,
            timestamp_captured=datetime.utcnow(),
        )
        db.add(evidence)

        # Update survey status if not already completed
        if survey.survey_status in ["ASSIGNED", "IN_PROGRESS", "BOUNDARY_WALKED"]:
            survey.survey_status = "ASSETS_AUDITED"

        db.commit()
        db.refresh(evidence)

        AuditService.log_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            event_type="FIELD_SURVEY_EVIDENCE_ATTACHED",
            details={
                "evidence_id": evidence.id,
                "survey_id": survey.id,
                "category": data.category,
                "caption": data.caption,
            },
        )

        return evidence

    @classmethod
    def process_batch_sync(
        cls,
        db: Session,
        user: User,
        data: BatchSyncRequest,
    ) -> Dict[str, Any]:
        """
        Processes offline sync queue containing multiple survey items and attached photos.
        Executes atomic batch persistence.
        """
        synced_count = 0
        photo_count = 0

        for item in data.survey_items:
            # Find survey by parcel_id & proposal_id or offline_client_uuid
            survey = (
                db.query(FieldParcelSurvey)
                .filter(
                    FieldParcelSurvey.proposal_id == item.proposal_id,
                    FieldParcelSurvey.parcel_id == item.parcel_id,
                )
                .first()
            )

            if not survey:
                # Fetch parcel metadata
                parcel = db.query(LandParcel).filter(LandParcel.id == item.parcel_id).first()
                if not parcel:
                    continue
                survey = FieldParcelSurvey(
                    proposal_id=item.proposal_id,
                    parcel_id=item.parcel_id,
                    surveyor_user_id=user.id,
                    khasra_gat_number=parcel.gut_number or parcel.survey_number,
                    village_name=parcel.village_name,
                    taluka_name=parcel.taluka_name,
                    district_name=parcel.district_name,
                    prescribed_area_ha=parcel.affected_area_ha or parcel.total_area_ha or 1.0,
                )
                db.add(survey)
                db.flush()

            survey.offline_client_uuid = item.offline_client_uuid
            survey.synced_at = datetime.utcnow()
            survey.surveyor_user_id = user.id

            if item.measured_area_ha is not None:
                survey.measured_area_ha = item.measured_area_ha
                prescribed = survey.prescribed_area_ha or 1.0
                survey.variance_percentage = round(abs(item.measured_area_ha - prescribed) / prescribed * 100.0, 2)

            if item.gps_coordinates:
                survey.gps_coordinates_json = json.dumps([c.dict() for c in item.gps_coordinates])
            if item.gps_perimeter_meters:
                survey.gps_perimeter_meters = item.gps_perimeter_meters
            if item.gps_accuracy_meters:
                survey.gps_accuracy_meters = item.gps_accuracy_meters

            survey.is_disputed_boundary = item.is_disputed_boundary
            if item.dispute_notes:
                survey.dispute_notes = item.dispute_notes
            if item.land_use_type:
                survey.land_use_type = item.land_use_type
            if item.occupant_name_on_site:
                survey.occupant_name_on_site = item.occupant_name_on_site
            if item.occupant_type:
                survey.occupant_type = item.occupant_type
            if item.road_access:
                survey.road_access = item.road_access

            # Serialize asset lists
            if item.crops is not None:
                survey.crops_data_json = json.dumps([c.dict() for c in item.crops])
            if item.trees is not None:
                survey.trees_data_json = json.dumps([t.dict() for t in item.trees])
            if item.structures is not None:
                survey.structures_data_json = json.dumps([s.dict() for s in item.structures])
            if item.water_assets is not None:
                survey.water_assets_data_json = json.dumps([w.dict() for w in item.water_assets])

            survey.owner_signature_captured = item.owner_signature_captured
            if item.surveyor_remarks:
                survey.surveyor_remarks = item.surveyor_remarks

            survey.survey_status = "COMPLETED" if item.owner_signature_captured else "ASSETS_AUDITED"
            synced_count += 1

            # Process attached photos if present
            if item.photos:
                for ph in item.photos:
                    evidence = GeotaggedAssetEvidence(
                        survey_id=survey.id,
                        parcel_id=survey.parcel_id,
                        proposal_id=survey.proposal_id,
                        surveyor_user_id=user.id,
                        category=ph.category,
                        caption=ph.caption,
                        latitude=ph.latitude,
                        longitude=ph.longitude,
                        accuracy_meters=ph.accuracy_meters,
                        file_url=ph.file_url,
                        timestamp_captured=datetime.utcnow(),
                    )
                    db.add(evidence)
                    photo_count += 1

        db.commit()

        AuditService.log_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            event_type="FIELD_SURVEY_OFFLINE_BATCH_SYNC",
            details={
                "sync_batch_id": data.sync_batch_id,
                "surveys_synced": synced_count,
                "photos_synced": photo_count,
            },
        )

        return {
            "status": "BATCH_SYNC_SUCCESS",
            "sync_batch_id": data.sync_batch_id,
            "surveys_synced_count": synced_count,
            "photos_synced_count": photo_count,
            "server_timestamp": datetime.utcnow().isoformat(),
        }

    @classmethod
    def verify_survey_task(
        cls,
        db: Session,
        user: User,
        data: SurveyVerifyRequest,
    ) -> FieldParcelSurvey:
        """
        Talathi / Tehsildar review and approval of field survey data.
        """
        survey = cls.get_survey_detail(db, data.survey_id)

        if data.decision == "APPROVE":
            survey.survey_status = "VERIFIED_BY_TALATHI"
            survey.verified_by_user_id = user.id
            survey.verified_at = datetime.utcnow()
            survey.verification_remarks = data.verification_remarks or "Verified and approved by Revenue Official."
        elif data.decision == "REMAND_FOR_RESURVEY":
            survey.survey_status = "ASSIGNED"
            survey.verification_remarks = data.verification_remarks or "Remanded for field re-survey."
        elif data.decision == "FLAG_DISPUTE":
            survey.survey_status = "DISPUTED"
            survey.is_disputed_boundary = True
            survey.dispute_notes = data.verification_remarks or "Boundary dispute noted during verification."
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid verification decision '{data.decision}'. Must be APPROVE, REMAND_FOR_RESURVEY, or FLAG_DISPUTE.",
            )

        db.commit()
        db.refresh(survey)

        AuditService.log_event(
            db=db,
            actor_id=user.id,
            actor_email=user.email,
            event_type="FIELD_SURVEY_REVENUE_VERIFICATION",
            details={
                "survey_id": survey.id,
                "decision": data.decision,
                "verified_by_user_id": user.id,
            },
        )

        return survey

    @classmethod
    def get_proposal_survey_summary(
        cls,
        db: Session,
        proposal_id: int,
    ) -> ProposalSurveySummaryOut:
        """
        Aggregated field survey progress metrics for a proposal.
        """
        surveys = db.query(FieldParcelSurvey).filter(FieldParcelSurvey.proposal_id == proposal_id).all()
        total_parcels = len(surveys)
        total_prescribed = sum(s.prescribed_area_ha or 0.0 for s in surveys)

        completed = sum(1 for s in surveys if s.survey_status in ["COMPLETED", "VERIFIED_BY_TALATHI"])
        in_progress = sum(1 for s in surveys if s.survey_status in ["IN_PROGRESS", "BOUNDARY_WALKED", "ASSETS_AUDITED"])
        disputed = sum(1 for s in surveys if s.is_disputed_boundary or s.survey_status == "DISPUTED")
        verified = sum(1 for s in surveys if s.survey_status == "VERIFIED_BY_TALATHI")

        measured_surveys = [s for s in surveys if s.measured_area_ha is not None]
        overall_measured = sum(s.measured_area_ha for s in measured_surveys)
        avg_variance = (
            round(sum(s.variance_percentage or 0.0 for s in measured_surveys) / len(measured_surveys), 2)
            if measured_surveys
            else 0.0
        )

        return ProposalSurveySummaryOut(
            proposal_id=proposal_id,
            total_parcels=total_parcels,
            total_prescribed_area_ha=round(total_prescribed, 2),
            surveys_completed_count=completed,
            surveys_in_progress_count=in_progress,
            surveys_disputed_count=disputed,
            verified_by_revenue_count=verified,
            overall_measured_area_ha=round(overall_measured, 2),
            average_variance_percentage=avg_variance,
        )
