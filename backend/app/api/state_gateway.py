from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.project_proposal import ProjectProposal
from app.models.land_parcel import LandParcel
from app.models.project_dpr import ProjectDpr
from app.models.expert_committee_appraisal import ExpertCommitteeAppraisal
from app.schemas.proposal import (
    ProposalOut,
    ScrutinyRequest,
    CalaAppointmentRequest,
    CalaAppointmentOut,
    ExpertAppraisalRequest,
    ExpertAppraisalOut,
)
from app.services.proposal_service import ProposalService

router = APIRouter(prefix="/state-gateway", tags=["State Revenue Nodal Gateway"])


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.get("/proposals", response_model=List[ProposalOut])
def list_pending_proposals_for_state(
    status_filter: Optional[str] = None,
    stage_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """State Revenue Secretary lists incoming proposals across the state."""
    query = db.query(ProjectProposal)
    if stage_filter:
        query = query.filter(ProjectProposal.current_stage == stage_filter.upper())
    elif status_filter:
        query = query.filter(ProjectProposal.status == status_filter.upper())

    proposals = query.order_by(ProjectProposal.updated_at.desc()).all()
    result = []
    for prop in proposals:
        p_out = ProposalOut.from_orm(prop)
        p_out.parcels_count = db.query(LandParcel).filter(LandParcel.proposal_id == prop.id).count()
        p_out.dpr_count = db.query(ProjectDpr).filter(ProjectDpr.proposal_id == prop.id).count()
        result.append(p_out)
    return result


@router.post("/proposals/{proposal_id}/scrutinize", response_model=ProposalOut)
def scrutinize_proposal(
    proposal_id: int,
    payload: ScrutinyRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 4: State Revenue Nodal reviews proposal for structural/forest conflicts
    and verifies Section 26(2) Rural/Urban Multiplier compliance.
    """
    client_ip = get_client_ip(request)
    try:
        proposal = ProposalService.scrutinize_proposal(
            db=db,
            proposal_id=proposal_id,
            state_admin_user=current_user,
            conflict_status=payload.conflict_status,
            conflict_notes=payload.conflict_notes,
            multiplier_verified=payload.multiplier_verified,
            approved=payload.approved,
            ip_address=client_ip,
        )
        return proposal
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/proposals/{proposal_id}/appoint-cala", response_model=CalaAppointmentOut)
def appoint_collector_as_cala(
    proposal_id: int,
    payload: CalaAppointmentRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 5: State Revenue Nodal formally appoints District Collector as CALA on the portal
    and transitions proposal to STAGE_3_CALA_APPOINTED.
    """
    client_ip = get_client_ip(request)
    try:
        appointment = ProposalService.appoint_cala(
            db=db,
            proposal_id=proposal_id,
            district_id=payload.district_id,
            collector_user_id=payload.collector_user_id,
            state_admin_user=current_user,
            gazette_notification_ref=payload.gazette_notification_ref,
            ip_address=client_ip,
        )
        return appointment
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/proposals/{proposal_id}/expert-appraisal", response_model=ExpertAppraisalOut)
def record_expert_appraisal_gate(
    proposal_id: int,
    payload: ExpertAppraisalRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Statutory Expert Committee Appraisal Gate (Section 7, RFCTLARR 2013).
    Multi-disciplinary panel clearance unlocking STAGE_6_SEC11_PRELIMINARY_NOTIF.
    """
    client_ip = get_client_ip(request)
    try:
        appraisal = ProposalService.record_expert_committee_appraisal(
            db=db,
            proposal_id=proposal_id,
            committee_user=current_user,
            committee_chairperson=payload.committee_chairperson,
            recommendation_status=payload.recommendation_status,
            clearance_remarks=payload.clearance_remarks,
            public_purpose_verified=payload.public_purpose_verified,
            minimal_land_verified=payload.minimal_land_verified,
            simp_feasibility_verified=payload.simp_feasibility_verified,
            signed_by_expert_ids=payload.signed_by_expert_ids,
            ip_address=client_ip,
        )
        return appraisal
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/proposals/{proposal_id}/expert-appraisal", response_model=ExpertAppraisalOut)
def get_expert_appraisal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch Expert Committee appraisal record for a proposal."""
    appraisal = db.query(ExpertCommitteeAppraisal).filter(ExpertCommitteeAppraisal.proposal_id == proposal_id).first()
    if not appraisal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expert Committee appraisal not found for this proposal.")
    return appraisal
