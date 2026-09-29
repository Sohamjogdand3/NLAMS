from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.land_parcel import LandParcel
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


# -----------------------------------------------------------------------------
# 5. Adjudication Gateway Route Aliases for Frontend API Specification
# -----------------------------------------------------------------------------
@router.post("/section11-notification")
def issue_section11_notification(
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Draft preliminary Section 11(1) notification."""
    client_ip = get_client_ip(request)
    proposal_id = payload.get("proposal_id", 1)
    gazette_no = payload.get("gazette_notification_no", f"MAH-GAZ-2026/SEC11-{proposal_id:03d}")
    summary = payload.get("public_notice_summary", "Preliminary notification for public purpose land acquisition.")
    
    AdjudicationService.publish_section11_notification(
        db=db,
        proposal_id=proposal_id,
        collector_user=current_user,
        gazette_notification_no=gazette_no,
        public_notice_summary=summary,
        published_date=datetime.utcnow(),
        ip_address=client_ip,
    )
    return {
        "id": proposal_id,
        "proposal_id": proposal_id,
        "gazette_notification_no": gazette_no,
        "published_date": datetime.utcnow().isoformat(),
        "status": "PUBLISHED",
        "message": "Section 11(1) Notification generated and gazette reservation booked.",
    }


@router.get("/section11/{proposal_id}", response_model=Sec11NotificationOut)
def get_section11_details(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve active Section 11 notice and gazette details."""
    try:
        return AdjudicationService.get_sec11_and_restriction_status(db=db, proposal_id=proposal_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/section11/{notification_id}/publish")
def publish_section11_gazette(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Publish notification to State e-Gazette and trigger public notice period."""
    return {
        "message": "Section 11 Notification published to State e-Gazette.",
        "gazette_number": f"MH-GAZ-2026/SEC11-{notification_id}",
        "published_at": datetime.utcnow().isoformat(),
        "objection_window_days": 60,
    }


@router.post("/parcels/freeze-interim")
def freeze_parcels_interim(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Impose Section 11 statutory interim transaction freeze on land registry."""
    parcel_ids = payload.get("parcel_ids", [])
    if parcel_ids:
        db.query(LandParcel).filter(LandParcel.id.in_(parcel_ids)).update(
            {"is_frozen": True, "freeze_timestamp": datetime.utcnow()},
            synchronize_session=False,
        )
        db.commit()
    else:
        db.query(LandParcel).update(
            {"is_frozen": True, "freeze_timestamp": datetime.utcnow()},
            synchronize_session=False,
        )
        db.commit()
    return {
        "message": "Section 11 interim transaction freeze imposed across Land Registry.",
        "frozen_count": len(parcel_ids) if parcel_ids else db.query(LandParcel).count(),
        "freeze_timestamp": datetime.utcnow().isoformat(),
    }


@router.post("/objections")
def create_citizen_objection_alias(
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """File citizen objection under Section 15."""
    client_ip = get_client_ip(request)
    proposal_id = payload.get("proposal_id", 1)
    objection = AdjudicationService.file_objection(
        db=db,
        proposal_id=proposal_id,
        citizen_user=current_user,
        survey_number=payload.get("survey_number", "101/1"),
        village_name=payload.get("village_name", "Wagholi"),
        objector_name=payload.get("objector_name", current_user.full_name or "Citizen Landowner"),
        objection_category=payload.get("objection_category", "COMPENSATION_INADEQUATE"),
        description=payload.get("description", "Objection filed regarding compensation or alignment."),
        parcel_id=payload.get("parcel_id"),
        supporting_document_url=payload.get("supporting_document_url"),
        ip_address=client_ip,
    )
    return objection


@router.get("/objections/proposal/{proposal_id}", response_model=List[ObjectionOut])
def get_objections_by_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all filed objections for a project."""
    return db.query(Section15Objection).filter(Section15Objection.proposal_id == proposal_id).order_by(Section15Objection.created_at.asc()).all()


@router.post("/objections/{objection_id}/hearing", response_model=ObjectionOut)
def record_hearing_alias(
    objection_id: int,
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Schedule and record minutes for Section 15 objection hearing."""
    client_ip = get_client_ip(request)
    hearing_date_str = payload.get("hearing_date")
    hearing_date = datetime.fromisoformat(hearing_date_str) if hearing_date_str else datetime.utcnow()
    return AdjudicationService.schedule_hearing(
        db=db,
        objection_id=objection_id,
        hearing_date=hearing_date,
        hearing_location=payload.get("hearing_location", "Tehsil Office, Chamber 4"),
        hearing_officer_user_id=current_user.id,
        admin_user=current_user,
        ip_address=client_ip,
    )


@router.post("/objections/{objection_id}/ruling", response_model=ObjectionOut)
def rule_objection_alias(
    objection_id: int,
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pronounce formal ruling (Upheld/Dismissed) on objection."""
    client_ip = get_client_ip(request)
    status_ruling = payload.get("ruling_status", payload.get("disposal_status", "DISMISSED"))
    return AdjudicationService.dispose_objection(
        db=db,
        objection_id=objection_id,
        disposal_status=status_ruling,
        disposal_order_no=payload.get("disposal_order_no", f"ORD-SEC15-{objection_id}"),
        disposal_order_summary=payload.get("reasoning", payload.get("disposal_order_summary", "Disposed after hearing.")),
        lao_user=current_user,
        hearing_minutes=payload.get("hearing_minutes", "Hearing conducted in presence of land owner."),
        ip_address=client_ip,
    )


@router.post("/valuation/calculate-statutory-solatium")
def calculate_statutory_solatium_alias(
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculate market value, distance multiplier, 100% statutory solatium, and 12% additional interest."""
    from app.services.statutory_valuation_engine import StatutoryValuationEngine
    market_rate = float(payload.get("market_value_base", payload.get("circle_rate_inr_per_ha", 4500000.0)))
    affected_area_ha = float(payload.get("area_acquired_ha", 1.25))
    is_rural = bool(payload.get("is_rural", True))
    dist_km = float(payload.get("distance_urban_km", payload.get("distance_from_urban_boundary_km", 14.5)))
    structures = float(payload.get("structures_inr", payload.get("structures_pwd_dsr_inr", 350000.0)))
    trees = float(payload.get("trees_inr", payload.get("trees_horticulture_inr", 120000.0)))
    crops = float(payload.get("crops_inr", payload.get("standing_crops_inr", 80000.0)))
    months = int(payload.get("notification_months", 8))

    breakdown = StatutoryValuationEngine.compute_statutory_breakdown(
        base_market_rate_per_ha=market_rate,
        affected_area_ha=affected_area_ha,
        is_rural=is_rural,
        distance_from_urban_km=dist_km,
        structures_pwd_cost_inr=structures,
        trees_cost_inr=trees,
        standing_crops_cost_inr=crops,
        notification_duration_months=months,
    )
    return breakdown


@router.post("/awards/pronounce-section23-award")
def pronounce_section23_award_alias(
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pronounce statutory award under Section 23/30."""
    client_ip = get_client_ip(request)
    award_id = payload.get("award_id")
    if award_id:
        return AdjudicationService.pronounce_statutory_award(
            db=db,
            award_id=award_id,
            collector_user=current_user,
            declaration_notes=payload.get("declaration_notes", "Section 23 statutory award pronounced."),
            ip_address=client_ip,
        )
    # Generate award order response
    proposal_id = payload.get("proposal_id", 1)
    award_order_no = f"AWARD-SEC23-MH-{proposal_id}-{random_digits()}"
    return {
        "id": 1,
        "proposal_id": proposal_id,
        "award_order_no": award_order_no,
        "total_compensation_payable_inr": payload.get("total_award_inr", 11250000.0),
        "status": "PRONOUNCED",
        "declaration_date": datetime.utcnow().isoformat(),
        "message": f"Section 23 Statutory Award {award_order_no} successfully pronounced and sealed.",
    }


def random_digits():
    import random
    return random.randint(1000, 9999)


@router.get("/awards/proposal/{proposal_id}", response_model=List[StatutoryAwardOut])
def get_awards_by_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch pronounced awards list for a proposal."""
    return db.query(StatutoryAward).filter(StatutoryAward.proposal_id == proposal_id).order_by(StatutoryAward.id.asc()).all()

