import logging
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.escrow_account import EscrowAccount
from app.models.project_proposal import ProjectProposal

logger = logging.getLogger("nlams.escrow")


class EscrowService:
    """
    Project Escrow Management & Financial Settlement Service.
    Handles Escrow account initialization, funding deposits, balance tracking,
    and automatic replenishment alert threshold evaluations.
    """

    @classmethod
    def initialize_escrow(
        cls,
        db: Session,
        proposal_id: int,
        sanctioned_amount: float,
        initial_deposit: float = 0.0,
        bank_name: str = "State Bank of India (PFMS Dedicated Escrow)",
        ifsc_code: str = "SBIN0001234",
    ) -> EscrowAccount:
        """Initializes a dedicated project Escrow account."""
        # Check if already exists
        existing = db.query(EscrowAccount).filter(EscrowAccount.proposal_id == proposal_id).first()
        if existing:
            return existing

        account_no = f"ESC-NLAMS-{proposal_id:04d}-{int(datetime.utcnow().timestamp()) % 100000:05d}"
        balance = initial_deposit
        status = "ACTIVE"
        if initial_deposit < (sanctioned_amount * 0.20) and sanctioned_amount > 0:
            status = "REPLENISHMENT_REQUIRED"

        escrow = EscrowAccount(
            proposal_id=proposal_id,
            account_number=account_no,
            bank_name=bank_name,
            ifsc_code=ifsc_code,
            total_sanctioned_amount=sanctioned_amount,
            deposited_amount=initial_deposit,
            disbursed_amount=0.0,
            balance_amount=balance,
            replenishment_threshold_pct=20.0,
            status=status,
        )
        db.add(escrow)
        db.commit()
        db.refresh(escrow)
        logger.info(f"Initialized Escrow Account #{account_no} for Proposal #{proposal_id} (Balance: INR {balance:,.2f})")
        return escrow

    @classmethod
    def deposit_funds(
        cls,
        db: Session,
        proposal_id: int,
        amount: float,
    ) -> EscrowAccount:
        """Records a funding deposit into the project Escrow account."""
        escrow = db.query(EscrowAccount).filter(EscrowAccount.proposal_id == proposal_id).first()
        if not escrow:
            raise ValueError(f"Escrow account not found for Proposal #{proposal_id}")

        escrow.deposited_amount += amount
        escrow.balance_amount += amount
        escrow.updated_at = datetime.utcnow()

        # Update replenishment status
        threshold = (escrow.total_sanctioned_amount * escrow.replenishment_threshold_pct) / 100.0
        if escrow.balance_amount >= threshold:
            escrow.status = "ACTIVE"

        db.commit()
        db.refresh(escrow)
        logger.info(f"Deposited INR {amount:,.2f} into Escrow #{escrow.account_number}. New Balance: INR {escrow.balance_amount:,.2f}")
        return escrow

    @classmethod
    def get_escrow_summary(cls, db: Session, proposal_id: int) -> Optional[Dict[str, Any]]:
        """Returns comprehensive balance and burn rate analytics for the Escrow account."""
        escrow = db.query(EscrowAccount).filter(EscrowAccount.proposal_id == proposal_id).first()
        if not escrow:
            return None

        threshold_amount = (escrow.total_sanctioned_amount * escrow.replenishment_threshold_pct) / 100.0
        is_replenishment_needed = escrow.balance_amount < threshold_amount
        burn_rate_pct = (escrow.disbursed_amount / escrow.deposited_amount * 100.0) if escrow.deposited_amount > 0 else 0.0

        return {
            "account_number": escrow.account_number,
            "bank_name": escrow.bank_name,
            "ifsc_code": escrow.ifsc_code,
            "total_sanctioned_inr": escrow.total_sanctioned_amount,
            "deposited_inr": escrow.deposited_amount,
            "disbursed_inr": escrow.disbursed_amount,
            "balance_inr": escrow.balance_amount,
            "burn_rate_pct": round(burn_rate_pct, 2),
            "replenishment_threshold_inr": threshold_amount,
            "is_replenishment_needed": is_replenishment_needed,
            "status": escrow.status,
            "last_updated": escrow.updated_at.isoformat() if escrow.updated_at else None,
        }
