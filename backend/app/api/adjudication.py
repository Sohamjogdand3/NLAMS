from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.section15_objection import Section15Objection
from app.models.citizen_claim import CitizenClaim
from app.models.statutory_award import StatutoryAward
from app.schemas.adjudication import (
    Sec11PublishRequest,
    Sec11NotificationOut,
    ObjectionCreateRequest,
    ObjectionScheduleHearingRequest,
    ObjectionDisposalRequest,
    ObjectionOut,
    ClaimSubmitRequest,
    ClaimAdjudicateRequest,
    ClaimOut,
    ValuationComputeRequest,
    AwardPronounceRequest,
    StatutoryAwardOut,
)
from app.services.adjudication_service import AdjudicationService

router = APIRouter(prefix="/adjudication", tags=["CALA Statutory Adjudication & Valuation Console"])


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


# -----------------------------------------------------------------------------
# 1. Section 11 Notification & NLAMS Registry Restriction Layer Endpoints
# -----------------------------------------------------------------------------
@router.post("/proposals/{proposal_id}/publish-sec11", response_model=Sec11NotificationOut)
def publish_sec11_notification(
    proposal_id: int,
    payload: Sec11PublishRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 6: District Collector (CALA) publishes Section 11 Preliminary Notification,
    starts the 60-day objection timer, and activates the NLAMS Registry Restriction Layer.
    """
    client_ip = get_client_ip(request)
    try:
        AdjudicationService.publish_section11_notification(
            db=db,
            proposal_id=proposal_id,
            collector_user=current_user,
            gazette_notification_no=payload.gazette_notification_no,
            public_notice_summary=payload.public_notice_summary,
            published_date=payload.published_date,
            ip_address=client_ip,
        )
        status_data = AdjudicationService.get_sec11_and_restriction_status(db=db, proposal_id=proposal_id)
        return status_data
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/proposals/{proposal_id}/sec11-status", response_model=Sec11NotificationOut)
def get_sec11_status_and_restriction_layer(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns the live 60-day countdown timer and NLAMS Registry Restriction Layer status."""
    try:
        return AdjudicationService.get_sec11_and_restriction_status(db=db, proposal_id=proposal_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# -----------------------------------------------------------------------------
# 2. Section 15 Objections & Hearing Disposal Ledger Endpoints
# -----------------------------------------------------------------------------
@router.post("/proposals/{proposal_id}/objections", response_model=ObjectionOut, status_code=status.HTTP_201_CREATED)
def file_section15_objection(
    proposal_id: int,
    payload: ObjectionCreateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Citizen / Landowner submits a Section 15 objection within the 60-day window."""
    client_ip = get_client_ip(request)
    try:
        objection = AdjudicationService.file_objection(
            db=db,
            proposal_id=proposal_id,
            citizen_user=current_user,
            survey_number=payload.survey_number,
            village_name=payload.village_name,
            objector_name=payload.objector_name,
            objection_category=payload.objection_category,
            description=payload.description,
            parcel_id=payload.parcel_id,
            supporting_document_url=payload.supporting_document_url,
            ip_address=client_ip,
        )
        return objection
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/proposals/{proposal_id}/objections", response_model=List[ObjectionOut])
def list_proposal_objections(
    proposal_id: int,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """LAO & CALA view all filed Section 15 objections."""
    q = db.query(Section15Objection).filter(Section15Objection.proposal_id == proposal_id)
    if status_filter:
        q = q.filter(Section15Objection.disposal_status == status_filter.upper())
    return q.order_by(Section15Objection.created_at.asc()).all()


@router.post("/objections/{objection_id}/schedule-hearing", response_model=ObjectionOut)
def schedule_objection_hearing(
    objection_id: int,
    payload: ObjectionScheduleHearingRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """LAO / SDM schedules formal statutory objection hearing."""
    client_ip = get_client_ip(request)
    try:
        return AdjudicationService.schedule_hearing(
            db=db,
            objection_id=objection_id,
            hearing_date=payload.hearing_date,
            hearing_location=payload.hearing_location,
            hearing_officer_user_id=payload.hearing_officer_user_id,
            admin_user=current_user,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/objections/{objection_id}/dispose", response_model=ObjectionOut)
def dispose_objection(
    objection_id: int,
    payload: ObjectionDisposalRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """District Collector / LAO issues formal disposal order on Section 15 objection."""
    client_ip = get_client_ip(request)
    try:
        return AdjudicationService.dispose_objection(
            db=db,
            objection_id=objection_id,
            disposal_status=payload.disposal_status,
            disposal_order_no=payload.disposal_order_no,
            disposal_order_summary=payload.disposal_order_summary,
            lao_user=current_user,
            hearing_minutes=payload.hearing_minutes,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# -----------------------------------------------------------------------------
# 3. Dual-Pane Citizen Claim Adjudication Endpoints
# -----------------------------------------------------------------------------
@router.post("/proposals/{proposal_id}/claims", response_model=ClaimOut, status_code=status.HTTP_201_CREATED)
def submit_claim(
    proposal_id: int,
    payload: ClaimSubmitRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Citizen submits title deed and bank details for dual-pane adjudication."""
    client_ip = get_client_ip(request)
    try:
        return AdjudicationService.submit_citizen_claim(
            db=db,
            proposal_id=proposal_id,
            parcel_id=payload.parcel_id,
            citizen_user=current_user,
            claimant_name=payload.claimant_name,
            survey_number=payload.survey_number,
            village_name=payload.village_name,
            bank_account_no=payload.bank_account_no,
            bank_ifsc_code=payload.bank_ifsc_code,
            bank_name=payload.bank_name,
            claimed_area_ha=payload.claimed_area_ha,
            claimed_share_fraction=payload.claimed_share_fraction,
            uploaded_title_deed_url=payload.uploaded_title_deed_url,
            uploaded_7_12_extract_url=payload.uploaded_7_12_extract_url,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/proposals/{proposal_id}/claims", response_model=List[ClaimOut])
def list_proposal_claims(
    proposal_id: int,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """LAO & CALA fetch all submitted citizen claims for dual-pane review queue."""
    q = db.query(CitizenClaim).filter(CitizenClaim.proposal_id == proposal_id)
    if status_filter:
        q = q.filter(CitizenClaim.adjudication_status == status_filter.upper())
    return q.order_by(CitizenClaim.created_at.asc()).all()


@router.post("/claims/{claim_id}/adjudicate", response_model=ClaimOut)
def adjudicate_claim(
    claim_id: int,
    payload: ClaimAdjudicateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 7: LAO adjudicates claim: "Approve/Verify Claim for Award Processing".
    Payment execution remains a separate controlled step in Stage 11.
    """
    client_ip = get_client_ip(request)
    try:
        return AdjudicationService.adjudicate_claim(
            db=db,
            claim_id=claim_id,
            adjudication_status=payload.adjudication_status,
            adjudication_notes=payload.adjudication_notes,
            lao_user=current_user,
            discrepancy_flag=payload.discrepancy_flag,
            discrepancy_details=payload.discrepancy_details,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# -----------------------------------------------------------------------------
# 4. Modular Statutory Valuation & Section 23/30 Award Endpoints
# -----------------------------------------------------------------------------
@router.post("/proposals/{proposal_id}/valuation", response_model=StatutoryAwardOut)
def compute_statutory_valuation_for_parcel(
    proposal_id: int,
    payload: ValuationComputeRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 9: LAO computes modular, auditable RFCTLARR Statutory Award breakdown per parcel.
    """
    client_ip = get_client_ip(request)
    try:
        award = AdjudicationService.compute_and_record_statutory_valuation(
            db=db,
            proposal_id=proposal_id,
            parcel_id=payload.parcel_id,
            lao_user=current_user,
            circle_rate_inr_per_ha=payload.circle_rate_inr_per_ha,
            avg_top_sale_deeds_rate_inr_per_ha=payload.avg_top_sale_deeds_rate_inr_per_ha,
            is_rural=payload.is_rural,
            distance_from_urban_boundary_km=payload.distance_from_urban_boundary_km,
            structures_pwd_dsr_inr=payload.structures_pwd_dsr_inr,
            trees_horticulture_inr=payload.trees_horticulture_inr,
            standing_crops_inr=payload.standing_crops_inr,
            custom_multiplier_override=payload.custom_multiplier_override,
            ip_address=client_ip,
        )
        return award
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/proposals/{proposal_id}/awards", response_model=List[StatutoryAwardOut])
def list_proposal_awards(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all computed and pronounced statutory awards for a proposal."""
    return db.query(StatutoryAward).filter(StatutoryAward.proposal_id == proposal_id).order_by(StatutoryAward.id.asc()).all()


@router.post("/awards/{award_id}/pronounce", response_model=StatutoryAwardOut)
def pronounce_award(
    award_id: int,
    payload: AwardPronounceRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 10: District Collector pronounces formal Section 23/30 Statutory Award.
    """
    client_ip = get_client_ip(request)
    try:
        return AdjudicationService.pronounce_statutory_award(
            db=db,
            award_id=award_id,
            collector_user=current_user,
            declaration_notes=payload.declaration_notes,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
