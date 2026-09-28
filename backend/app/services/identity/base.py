from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.user import User


class BaseIdentityProvider(ABC):
    """Abstract Identity Provider for NLAMS authentication subsystems."""

    provider_name: str = "base"

    @abstractmethod
    def initiate_auth(self, identifier: str, db: Session, **kwargs) -> Tuple[bool, str, Dict[str, Any]]:
        """Initiates authentication (e.g. sends OTP, generates KYC redirect URL).
        
        Returns (success: bool, message: str, meta: dict)
        """
        pass

    @abstractmethod
    def verify_auth(self, identifier: str, credential: str, db: Session, **kwargs) -> Tuple[bool, str, User]:
        """Verifies authentication credentials and resolves the User record.
        
        Returns (success: bool, message: str, user: User)
        """
        pass
