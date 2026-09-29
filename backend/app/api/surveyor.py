from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.surveyor import (
    BoundaryWalkSubmitRequest,
    AssetEvidenceCreateRequest,
    BatchSyncRequest,
    SurveyVerifyRequest,
    FieldSurveyOut,
    GeotaggedEvidenceOut,
    ProposalSurveySummaryOut,
)
from app.services.surveyor_service import SurveyorService

router = APIRouter(prefix="/surveyor", tags=["Field Surveyor Mobile Toolkit & Audits"])


def get_user_roles(user: User) -> List[str]:
    return [
        assignment.role.code
        for assignment in user.role_assignments
        if assignment.is_active and assignment.role
    ]


def verify_surveyor_or_revenue_role(user: User) -> List[str]:
    roles = get_user_roles(user)
    allowed = {
        "SURVEYOR",
        "TALATHI",
        "TEHSILDAR",
        "LAO",
        "DIST_COLLECTOR",
        "STATE_ADMIN",
        "CENTRAL_ADMIN",
    }
    if not (set(roles) & allowed):
        # Email fallback for seeded accounts
        email = (user.email or "").lower()
        if any(k in email for k in ["surveyor", "talathi", "tehsildar", "lao", "collector", "admin"]):
            return roles
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to Field Surveyor and Revenue Administration roles.",
        )
    return roles


def verify_revenue_verifier_role(user: User) -> List[str]:
    roles = get_user_roles(user)
    allowed = {"TALATHI", "TEHSILDAR", "LAO", "DIST_COLLECTOR", "STATE_ADMIN", "CENTRAL_ADMIN"}
    if not (set(roles) & allowed):
        email = (user.email or "").lower()
        if any(k in email for k in ["talathi", "tehsildar", "lao", "collector", "admin"]):
            return roles
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Survey verification restricted to Talathi, Tehsildar, LAO, and District Collector.",
        )
    return roles


@router.get("/tasks", response_model=List[FieldSurveyOut])
def list_survey_tasks(
    proposal_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List assigned field survey tasks, filterable by proposal or survey status."""
    verify_surveyor_or_revenue_role(current_user)
    return SurveyorService.get_surveyor_tasks(
        db=db,
        user=current_user,
        proposal_id=proposal_id,
        status_filter=status_filter,
    )


@router.get("/tasks/{task_id}", response_model=FieldSurveyOut)
def get_survey_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve detailed parcel survey task with GPS data, asset inventories, and evidence."""
    verify_surveyor_or_revenue_role(current_user)
    return SurveyorService.get_survey_detail(db=db, task_id=task_id)


@router.post("/boundary-walk", response_model=FieldSurveyOut)
def submit_boundary_walk(
    payload: BoundaryWalkSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit GPS boundary walk points, perimeter, measured area, and variance calculation."""
    verify_surveyor_or_revenue_role(current_user)
    return SurveyorService.record_boundary_walk(db=db, user=current_user, data=payload)


@router.post("/evidence", response_model=GeotaggedEvidenceOut)
@router.post("/asset-evidence", response_model=GeotaggedEvidenceOut)
def upload_geotagged_evidence(
    payload: AssetEvidenceCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload geotagged photo evidence with coordinates and timestamp."""
    verify_surveyor_or_revenue_role(current_user)
    return SurveyorService.add_asset_evidence(db=db, user=current_user, data=payload)


@router.post("/batch-sync")
def offline_batch_sync(
    payload: BatchSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Offline batch synchronization queue for multiple surveys & photos."""
    verify_surveyor_or_revenue_role(current_user)
    return SurveyorService.process_batch_sync(db=db, user=current_user, data=payload)


@router.post("/verify", response_model=FieldSurveyOut)
def verify_survey(
    payload: SurveyVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Talathi / Tehsildar survey verification, approval, or dispute flagging."""
    verify_revenue_verifier_role(current_user)
    return SurveyorService.verify_survey_task(db=db, user=current_user, data=payload)


@router.get("/proposals/{proposal_id}/summary", response_model=ProposalSurveySummaryOut)
@router.get("/proposal/{proposal_id}/summary", response_model=ProposalSurveySummaryOut)
def get_proposal_survey_summary(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get aggregated field survey progress statistics for a proposal."""
    verify_surveyor_or_revenue_role(current_user)
    return SurveyorService.get_proposal_survey_summary(db=db, proposal_id=proposal_id)

