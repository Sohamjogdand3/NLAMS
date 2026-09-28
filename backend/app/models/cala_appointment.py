from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class CalaAppointment(Base):
    """
    Statutory CALA Delegation Record.
    Records the formal portal appointment of a District Collector as the Competent Authority
    for Land Acquisition (CALA) by the State Revenue Nodal Authority.
    """
    __tablename__ = "cala_appointments"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    district_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="RESTRICT"), nullable=False, index=True)
    collector_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    appointed_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    appointment_order_no = Column(String(100), unique=True, nullable=False, index=True)
    appointment_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    gazette_notification_ref = Column(String(150), nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, SUPERSEDED, RELIEVED

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal", back_populates="cala_appointment")
    district = relationship("Jurisdiction", foreign_keys=[district_id])
    collector_user = relationship("User", foreign_keys=[collector_user_id])
    appointed_by_user = relationship("User", foreign_keys=[appointed_by_user_id])

    def __repr__(self) -> str:
        return f"<CalaAppointment(id={self.id}, order_no='{self.appointment_order_no}', collector_id={self.collector_user_id})>"
