import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class JurisdictionType(str, enum.Enum):
    VILLAGE = "village"
    TALUKA = "taluka"
    DISTRICT = "district"
    STATE = "state"
    NATIONAL = "national"


class Jurisdiction(Base):
    __tablename__ = "jurisdictions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    type = Column(Enum(JurisdictionType, name="jurisdiction_type_enum"), nullable=False, index=True)
    code = Column(String(50), nullable=True, index=True)
    parent_id = Column(Integer, ForeignKey("jurisdictions.id", ondelete="CASCADE"), nullable=True, index=True)

    # Self-referencing hierarchical relationships
    parent = relationship("Jurisdiction", remote_side=[id], backref="children")

    # Relationships
    role_assignments = relationship("UserRoleJurisdiction", back_populates="jurisdiction")

    def __repr__(self) -> str:
        return f"<Jurisdiction(id={self.id}, name='{self.name}', type='{self.type}')>"
