from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    mobile_number = Column(String(20), unique=True, index=True, nullable=True)
    emp_id = Column(String(50), unique=True, index=True, nullable=True)
    org_id = Column(String(50), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    role_assignments = relationship(
        "UserRoleJurisdiction",
        foreign_keys="[UserRoleJurisdiction.user_id]",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, full_name='{self.full_name}', mobile='{self.mobile_number}', emp_id='{self.emp_id}')>"
