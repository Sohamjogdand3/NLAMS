from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.rnr_census import AffectedFamilyCensus
from app.models.rnr_entitlement import RnREntitlementPackage
from app.models.community_asset_loss import CommunityAssetLoss
from app.models.payment_disbursal import LandCompensationDisbursal, RnRBenefitDisbursal
from app.schemas.rnr import (
    CensusCreateRequest,
    CensusOut,
    EntitlementEvaluateRequest,
    EntitlementApproveRequest,
    EntitlementOut,
    CommunityAssetCreateRequest,
    CommunityAssetOut,
    LandDisbursalRequest,
    LandDisbursalOut,
    RnRDisbursalRequest,
    RnRDisbursalOut,
)
from app.services.rnr_service import RnRService
from app.services.pfms_disbursal_service import PfmsDisbursalService

router = APIRouter(prefix="/rnr", tags=["R&R Social Welfare & Settlement Console"])


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


def get_user_roles(user: User) -> List[str]:
    return [
        assignment.role.code
        for assignment in (user.role_assignments or [])
        if assignment.is_active and assignment.role
    ]


def require_roles(user: User, allowed_roles: List[str]):
    user_roles = get_user_roles(user)
    if not any(r in allowed_roles for r in user_roles):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. User role(s) {user_roles} not authorized for this operation. Required: {allowed_roles}",
        )


# -----------------------------------------------------------------------------
# 1. Affected Family Census Endpoints
# -----------------------------------------------------------------------------
@router.post("/proposals/{proposal_id}/census", response_model=CensusOut, status_code=status.HTTP_201_CREATED)
def record_family_census(
    proposal_id: int,
    payload: CensusCreateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Registers non-owner affected family (laborer, tenant, artisan) in the census index."""
    require_roles(current_user, ["SURVEYOR", "TALATHI", "TEHSILDAR", "LAO", "DIST_COLLECTOR", "RNR_ADMIN", "STATE_ADMIN", "CENTRAL_ADMIN"])
    client_ip = get_client_ip(request)
    try:
        return RnRService.record_family_census(
            db=db,
            proposal_id=proposal_id,
            family_head_name=payload.family_head_name,
            village_name=payload.village_name,
            category=payload.category,
            primary_livelihood_source=payload.primary_livelihood_source,
            caste_category=payload.caste_category,
            is_scheduled_area_displacement=payload.is_scheduled_area_displacement,
            is_bpl=payload.is_bpl,
            family_members_count=payload.family_members_count,
            dependency_years=payload.dependency_years,
            ration_card_no=payload.ration_card_no,
            associated_survey_number=payload.associated_survey_number,
            surveyor_user=current_user,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/proposals/{proposal_id}/census", response_model=List[CensusOut])
def list_proposal_census(
    proposal_id: int,
    category_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all registered affected families for an acquisition corridor."""
    q = db.query(AffectedFamilyCensus).filter(AffectedFamilyCensus.proposal_id == proposal_id)
    if category_filter:
        q = q.filter(AffectedFamilyCensus.category == category_filter.upper())
    return q.order_by(AffectedFamilyCensus.created_at.asc()).all()


# -----------------------------------------------------------------------------
# 2. R&R Entitlement Package Matching Endpoints
# -----------------------------------------------------------------------------
@router.post("/proposals/{proposal_id}/entitlements/evaluate", response_model=EntitlementOut)
def evaluate_entitlement_package(
    proposal_id: int,
    payload: EntitlementEvaluateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluates Second Schedule entitlement package using versioned rule engine
    (PMAY matching eligibility, subsistence grant, livelihood annuity, SC/ST provisions).
    """
    require_roles(current_user, ["RNR_ADMIN", "LAO", "DIST_COLLECTOR", "STATE_ADMIN", "CENTRAL_ADMIN"])
    client_ip = get_client_ip(request)
    try:
        return RnRService.evaluate_and_create_entitlement_package(
            db=db,
            proposal_id=proposal_id,
            family_id=payload.family_id,
            rnr_user=current_user,
            is_rural=payload.is_rural,
            monthly_subsistence_override=payload.monthly_subsistence_override,
            livelihood_annuity_override=payload.livelihood_annuity_override,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/proposals/{proposal_id}/entitlements", response_model=List[EntitlementOut])
def list_proposal_entitlements(
    proposal_id: int,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists evaluated Second Schedule entitlement packages."""
    q = db.query(RnREntitlementPackage).filter(RnREntitlementPackage.proposal_id == proposal_id)
    if status_filter:
        q = q.filter(RnREntitlementPackage.status == status_filter.upper())
    return q.order_by(RnREntitlementPackage.id.asc()).all()


@router.post("/entitlements/{entitlement_id}/approve", response_model=EntitlementOut)
def approve_entitlement_package(
    entitlement_id: int,
    payload: EntitlementApproveRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """R&R Administrator formally approves Second Schedule welfare entitlement package."""
    require_roles(current_user, ["RNR_ADMIN", "DIST_COLLECTOR", "STATE_ADMIN", "CENTRAL_ADMIN"])
    client_ip = get_client_ip(request)
    try:
        return RnRService.approve_entitlement_package(
            db=db,
            entitlement_id=entitlement_id,
            rnr_admin_user=current_user,
            approval_notes=payload.approval_notes,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# -----------------------------------------------------------------------------
# 3. Community Asset & CPR Loss Endpoints
# -----------------------------------------------------------------------------
@router.post("/proposals/{proposal_id}/community-assets", response_model=CommunityAssetOut, status_code=status.HTTP_201_CREATED)
def record_community_asset_loss(
    proposal_id: int,
    payload: CommunityAssetCreateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Records loss of Common Property Resources (grazing land, wells, halls) under Third Schedule."""
    require_roles(current_user, ["TALATHI", "TEHSILDAR", "LAO", "DIST_COLLECTOR", "RNR_ADMIN", "STATE_ADMIN", "CENTRAL_ADMIN"])
    client_ip = get_client_ip(request)
    try:
        return RnRService.record_community_asset_loss(
            db=db,
            proposal_id=proposal_id,
            village_name=payload.village_name,
            asset_name=payload.asset_name,
            asset_category=payload.asset_category,
            survey_number=payload.survey_number,
            affected_extent=payload.affected_extent,
            estimated_restoration_cost_inr=payload.estimated_restoration_cost_inr,
            pwd_valuation_ref=payload.pwd_valuation_ref,
            statutory_amenity_code=payload.statutory_amenity_code,
            reconstruction_site_details=payload.reconstruction_site_details,
            user=current_user,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/proposals/{proposal_id}/community-assets", response_model=List[CommunityAssetOut])
def list_proposal_community_assets(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all Third Schedule community asset reconstruction items."""
    return db.query(CommunityAssetLoss).filter(CommunityAssetLoss.proposal_id == proposal_id).order_by(CommunityAssetLoss.id.asc()).all()


# -----------------------------------------------------------------------------
# 4. Separate Disbursal Endpoints (Stage 11: Simulated PFMS DBT Execution)
# -----------------------------------------------------------------------------
@router.post("/proposals/{proposal_id}/disburse-award/{award_id}", response_model=LandDisbursalOut)
def disburse_land_award(
    proposal_id: int,
    award_id: int,
    payload: LandDisbursalRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 11 (Land Payment): Executes simulated PFMS DBT payout for a Section 23/30 Statutory Land Award.
    Debits Escrow Account and sets award to SETTLED.
    """
    require_roles(current_user, ["DIST_COLLECTOR", "LAO", "CALA", "STATE_ADMIN", "CENTRAL_ADMIN"])
    client_ip = get_client_ip(request)
    try:
        return PfmsDisbursalService.disburse_land_statutory_award(
            db=db,
            proposal_id=proposal_id,
            award_id=award_id,
            authorized_by_user=current_user,
            bank_account_no=payload.bank_account_no,
            bank_ifsc_code=payload.bank_ifsc_code,
            bank_name=payload.bank_name,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/proposals/{proposal_id}/disburse-rnr/{entitlement_id}", response_model=RnRDisbursalOut)
def disburse_rnr_entitlement(
    proposal_id: int,
    entitlement_id: int,
    payload: RnRDisbursalRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 11 (R&R Payment): Executes simulated PFMS DBT payout for an approved R&R Entitlement Package.
    Distinct social welfare payout debited from Escrow Account.
    """
    require_roles(current_user, ["DIST_COLLECTOR", "RNR_ADMIN", "LAO", "CALA", "STATE_ADMIN", "CENTRAL_ADMIN"])
    client_ip = get_client_ip(request)
    try:
        return PfmsDisbursalService.disburse_rnr_entitlement(
            db=db,
            proposal_id=proposal_id,
            entitlement_id=entitlement_id,
            authorized_by_user=current_user,
            bank_account_no=payload.bank_account_no,
            bank_ifsc_code=payload.bank_ifsc_code,
            bank_name=payload.bank_name,
            ip_address=client_ip,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/proposals/{proposal_id}/disbursals/land", response_model=List[LandDisbursalOut])
def list_land_disbursals(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all simulated PFMS land compensation payouts."""
    return db.query(LandCompensationDisbursal).filter(
        LandCompensationDisbursal.proposal_id == proposal_id
    ).order_by(LandCompensationDisbursal.id.desc()).all()


@router.get("/proposals/{proposal_id}/disbursals/rnr", response_model=List[RnRDisbursalOut])
def list_rnr_disbursals(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists all simulated PFMS R&R social welfare payouts."""
    return db.query(RnRBenefitDisbursal).filter(
        RnRBenefitDisbursal.proposal_id == proposal_id
    ).order_by(RnRBenefitDisbursal.id.desc()).all()
