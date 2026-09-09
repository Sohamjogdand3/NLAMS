from datetime import datetime
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class UserRoleJurisdiction(Base):
    __tablename__ = "user_role_jurisdictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True)
    jurisdiction_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="SET NULL"), nullable=True, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="role_assignments")
    role = relationship("Role", back_populates="role_assignments")
    jurisdiction = relationship("Jurisdiction", back_populates="role_assignments")
    assigner = relationship("User", foreign_keys=[assigned_by])

    __table_args__ = (
        UniqueConstraint("user_id", "role_id", "jurisdiction_id", name="uq_user_role_jurisdiction"),
    )

    def __repr__(self) -> str:
        return f"<UserRoleJurisdiction(id={self.id}, user_id={self.user_id}, role_id={self.role_id}, jurisdiction_id={self.jurisdiction_id})>"
