import logging
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.services.identity.base import BaseIdentityProvider
from app.models.user import User

logger = logging.getLogger("nlams.identity.digilocker")


class DigiLockerProvider(BaseIdentityProvider):
    """Stub Identity Provider for MeriPehchaan / DigiLocker OAuth2 / OpenID Connect."""

    provider_name: str = "digilocker_oauth"

    def initiate_auth(
        self,
        identifier: str,
        db: Session,
        **kwargs,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        logger.info("Initiated DigiLocker SSO OAuth2 redirect URL")
        return True, "DigiLocker SSO authentication initialized.", {
            "redirect_url": "https://api.digitallocker.gov.in/public/oauth2/1/authorize",
            "state": "STUB_DIGILOCKER_STATE",
        }

    def verify_auth(
        self,
        identifier: str,
        credential: str,
        db: Session,
        **kwargs,
    ) -> Tuple[bool, str, User]:
        logger.info("DigiLocker OAuth token exchange requested (future stub)")
        return False, "DigiLocker OAuth direct verification is reserved for Phase 2 integration.", None
