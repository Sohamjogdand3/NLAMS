from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class EscrowAccount(Base):
    """
    Project Escrow Account for dedicated RFCTLARR compensation funding.
    Monitored for minimum threshold compliance and replenishment alerts for Requiring Agencies.
    """
    __tablename__ = "escrow_accounts"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    account_number = Column(String(50), unique=True, nullable=False, index=True)
    bank_name = Column(String(100), nullable=False, default="State Bank of India (PFMS Dedicated Escrow)")
    ifsc_code = Column(String(20), nullable=False, default="SBIN0001234")
    
    # Balance & Funding Ledgers (in INR)
    total_sanctioned_amount = Column(Float, nullable=False, default=0.0)
    deposited_amount = Column(Float, nullable=False, default=0.0)
    disbursed_amount = Column(Float, nullable=False, default=0.0)
    balance_amount = Column(Float, nullable=False, default=0.0)

    # Replenishment Policy Threshold (e.g., alert if balance drops below 20% of sanctioned)
    replenishment_threshold_pct = Column(Float, nullable=False, default=20.0)
    status = Column(String(50), nullable=False, default="ACTIVE")  # ACTIVE, REPLENISHMENT_REQUIRED, LOCKED, SETTLED

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal", back_populates="escrow_account")

    def __repr__(self) -> str:
        return f"<EscrowAccount(id={self.id}, acc='{self.account_number}', balance={self.balance_amount}, status='{self.status}')>"
