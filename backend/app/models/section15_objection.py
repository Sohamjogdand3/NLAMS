from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class Section15Objection(Base):
    """
    Section 15 Statutory Objections & Hearing Disposal Ledger (RFCTLARR 2013).
    Citizen/Landowner objections filed within the 60-day notice window post-Section 11.
    """
    __tablename__ = "section15_objections"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    parcel_id = Column(Integer, ForeignKey("land_parcels.id", ondelete="SET NULL"), nullable=True, index=True)
    citizen_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)

    objection_case_no = Column(String(100), unique=True, nullable=False, index=True)
    objector_name = Column(String(200), nullable=False)
    survey_number = Column(String(50), nullable=False, index=True)
    village_name = Column(String(100), nullable=False)

    # Classification & Content
    objection_category = Column(String(100), nullable=False, default="AREA_DISCREPANCY")
    # Categories: AREA_DISCREPANCY, TITLE_DISPUTE, PUBLIC_PURPOSE_CHALLENGE, VALUATION_OBJECTION, ALIGNMENT_OBJECTION, ENVIRONMENTAL_CONCERN
    description = Column(Text, nullable=False)
    supporting_document_url = Column(String(255), nullable=True)

    # Statutory Hearing Details (Conducted by LAO / Sub-Divisional Magistrate)
    hearing_date = Column(DateTime, nullable=True)
    hearing_location = Column(String(255), nullable=True)
    hearing_officer_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    hearing_minutes = Column(Text, nullable=True)

    # Formal CALA Disposal Order
    disposal_status = Column(String(50), default="FILED", nullable=False, index=True)
    # Statuses: FILED, HEARING_SCHEDULED, HEARING_CONCLUDED, DISMISSED_WITH_ORDER, UPHELD_REALIGNMENT_RECOMMENDED
    disposal_order_no = Column(String(100), nullable=True)
    disposal_order_summary = Column(Text, nullable=True)
    disposal_order_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal")
    parcel = relationship("LandParcel")
    citizen_user = relationship("User", foreign_keys=[citizen_user_id])
    hearing_officer = relationship("User", foreign_keys=[hearing_officer_user_id])

    def __repr__(self) -> str:
        return f"<Section15Objection(id={self.id}, case='{self.objection_case_no}', status='{self.disposal_status}')>"
