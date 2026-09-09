from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Relationships
    role_assignments = relationship("UserRoleJurisdiction", back_populates="role", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Role(id={self.id}, code='{self.code}', name='{self.name}')>"
