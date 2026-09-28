from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.proposal import EscrowDepositRequest, EscrowSummaryOut
from app.services.escrow_service import EscrowService

router = APIRouter(prefix="/escrow", tags=["Financial Settlement - Escrow"])


@router.get("/{proposal_id}", response_model=EscrowSummaryOut)
def get_escrow_summary(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """View Escrow balance, deposited funds, burn rate, and replenishment status."""
    summary = EscrowService.get_escrow_summary(db=db, proposal_id=proposal_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Escrow account not initialized for Proposal #{proposal_id}",
        )
    return summary


@router.post("/{proposal_id}/deposit", response_model=EscrowSummaryOut)
def deposit_escrow_funds(
    proposal_id: int,
    payload: EscrowDepositRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Requiring Agency deposits additional compensation funds into project Escrow."""
    try:
        EscrowService.deposit_funds(
            db=db,
            proposal_id=proposal_id,
            amount=payload.amount,
        )
        return EscrowService.get_escrow_summary(db=db, proposal_id=proposal_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
