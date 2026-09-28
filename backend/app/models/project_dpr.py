from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class ProjectDpr(Base):
    """
    Detailed Project Report (DPR) and statutory feasibility documents uploaded by Requiring Agencies.
    """
    __tablename__ = "project_dpr_documents"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    document_name = Column(String(200), nullable=False)
    document_type = Column(String(50), nullable=False)  # DPR, FEASIBILITY_REPORT, ADMIN_COST_VOUCHER, ALIGNMENT_KML
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False, default=0)
    file_hash = Column(String(64), nullable=True)  # SHA-256 Checksum for document integrity

    uploaded_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal", back_populates="dpr_documents")
    uploaded_by_user = relationship("User")

    def __repr__(self) -> str:
        return f"<ProjectDpr(id={self.id}, name='{self.document_name}', type='{self.document_type}')>"
