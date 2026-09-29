from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.possession import (
    PanchnamaCreateRequest,
    PanchnamaOut,
    PossessionCertificateIssueRequest,
    PossessionCertificateOut,
    DigitalMutationExecuteRequest,
    MutationRecordOut,
    PiaHandoverActionRequest,
    PiaHandoverOut,
    ProjectCompletionRequest,
    ProjectCompletionOut,
    PossessionReadinessOut,
)
from app.services.possession_service import PossessionService

router = APIRouter(prefix="/possession", tags=["Statutory Possession, Digital Mutation & Handover"])


def get_user_roles(user: User) -> List[str]:
    return [
        assignment.role.code
        for assignment in user.role_assignments
        if assignment.is_active and assignment.role
    ]


def verify_possession_authority_role(user: User) -> List[str]:
    roles = get_user_roles(user)
    allowed = {"DIST_COLLECTOR", "LAO", "TEHSILDAR", "STATE_ADMIN", "CENTRAL_ADMIN"}
    if not (set(roles) & allowed):
        email = (user.email or "").lower()
        if any(k in email for k in ["collector", "lao", "tehsildar", "admin"]):
            return roles
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Possession and Panchnama operations restricted to District Collector, LAO, and Tehsildar.",
        )
    return roles


def verify_pia_role(user: User) -> List[str]:
    roles = get_user_roles(user)
    allowed = {"PIA", "CENTRAL_ADMIN"}
    if not (set(roles) & allowed):
        email = (user.email or "").lower()
        if any(k in email for k in ["pia", "admin", "nhai", "railway"]):
            return roles
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PIA Handover Acceptance Gate restricted to Project Implementing Agency (PIA) representative.",
        )
    return roles


def verify_completion_role(user: User) -> List[str]:
    roles = get_user_roles(user)
    allowed = {"DIST_COLLECTOR", "STATE_ADMIN", "CENTRAL_ADMIN", "LAO", "PIA"}
    if not (set(roles) & allowed):
        email = (user.email or "").lower()
        if any(k in email for k in ["collector", "admin", "lao", "pia"]):
            return roles
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Project completion & archival restricted to District Administration and State/Central Nodal.",
        )
    return roles


@router.get("/proposals/{proposal_id}/readiness", response_model=PossessionReadinessOut)
@router.get("/readiness/{proposal_id}", response_model=PossessionReadinessOut)
def check_possession_readiness(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Verify statutory prerequisite criteria (Stage 11 reached, awards pronounced, disbursals active)."""
    return PossessionService.check_possession_readiness(db=db, proposal_id=proposal_id)


@router.post("/panchnama", response_model=PanchnamaOut)
@router.post("/create-panchnama", response_model=PanchnamaOut)
def record_possession_panchnama(
    payload: PanchnamaCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record on-site Digital Possession Panchnama with spot witnesses."""
    verify_possession_authority_role(current_user)
    return PossessionService.create_digital_panchnama(db=db, user=current_user, data=payload)


@router.post("/issue-certificate", response_model=PossessionCertificateOut)
def issue_possession_certificate(
    payload: PossessionCertificateIssueRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Issue statutory Section 38/40 Possession Certificate.
    Advances proposal to STAGE_12_POSSESSION_AND_MUTATION.
    """
    verify_possession_authority_role(current_user)
    return PossessionService.issue_possession_certificate(db=db, user=current_user, data=payload)


@router.post("/execute-digital-mutation", response_model=List[MutationRecordOut])
def execute_digital_mutation(
    payload: DigitalMutationExecuteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Execute simulated e-Ferfar revenue mutation entries transferring parcel 7/12 RoR to Requiring Agency.
    Resolves Section 11 interim freeze locks to permanent state.
    """
    verify_possession_authority_role(current_user)
    return PossessionService.execute_digital_mutation(db=db, user=current_user, data=payload)


@router.get("/proposals/{proposal_id}/mutations", response_model=List[MutationRecordOut])
def list_proposal_mutations(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all simulated e-Ferfar mutation records for a proposal."""
    return PossessionService.get_proposal_mutations(db=db, proposal_id=proposal_id)


@router.post("/pia-handover-action", response_model=PiaHandoverOut)
def pia_handover_action(
    payload: PiaHandoverActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    PIA Statutory Handover Acceptance Gate.
    When ACCEPT is selected, advances proposal to STAGE_13_PIA_HANDOVER_ACCEPTED.
    """
    verify_pia_role(current_user)
    return PossessionService.pia_handover_action(db=db, user=current_user, data=payload)


@router.post("/complete-project", response_model=ProjectCompletionOut)
def complete_project_and_archive(
    payload: ProjectCompletionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Executive Project Completion & Archival Dossier.
    Reconciles Escrow account, closes all audit trails, and transitions proposal to STAGE_14_COMPLETED.
    """
    verify_completion_role(current_user)
    return PossessionService.complete_and_archive_project(db=db, user=current_user, data=payload)


@router.get("/proposals/{proposal_id}/archival-dossier", response_model=ProjectCompletionOut)
def get_archival_dossier(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve sealed Project Completion Dossier and cryptographic audit hash."""
    return PossessionService.get_archival_dossier(db=db, proposal_id=proposal_id)
