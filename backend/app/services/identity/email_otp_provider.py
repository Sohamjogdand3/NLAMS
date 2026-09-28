import logging
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.services.identity.base import BaseIdentityProvider
from app.services.otp_service import OTPService
from app.models.user import User
from app.models.role import Role
from app.models.user_role_jurisdiction import UserRoleJurisdiction

logger = logging.getLogger("nlams.identity.email_otp")


class EmailOTPProvider(BaseIdentityProvider):
    """Citizen and Official Email OTP Authentication Provider."""

    provider_name: str = "email_otp"

    def initiate_auth(
        self,
        identifier: str,
        db: Session,
        purpose: str = "CITIZEN_LOGIN",
        full_name: str = None,
        **kwargs,
    ) -> Tuple[bool, str, Dict[str, Any]]:
        clean_email = identifier.lower().strip()
        success, message, cooldown = OTPService.generate_and_send_otp(
            email=clean_email,
            purpose=purpose,
            db=db,
            full_name=full_name,
        )
        return success, message, {"cooldown_seconds": cooldown, "expires_in_seconds": 180}

    def verify_auth(
        self,
        identifier: str,
        credential: str,
        db: Session,
        purpose: str = "CITIZEN_LOGIN",
        **kwargs,
    ) -> Tuple[bool, str, User]:
        clean_email = identifier.lower().strip()
        verified, message = OTPService.verify_otp(
            email=clean_email,
            entered_otp=credential,
            purpose=purpose,
            db=db,
        )
        if not verified:
            return False, message, None

        # Resolve or auto-register citizen user if citizen login
        user = db.query(User).filter(User.email == clean_email).first()
        if not user and purpose == "CITIZEN_LOGIN":
            citizen_role = db.query(Role).filter(Role.code == "CITIZEN").first()
            user = User(
                full_name=f"Citizen ({clean_email.split('@')[0]})",
                email=clean_email,
                is_active=True,
            )
            db.add(user)
            db.flush()

            if citizen_role:
                urj = UserRoleJurisdiction(
                    user_id=user.id,
                    role_id=citizen_role.id,
                    jurisdiction_id=None,
                    is_active=True,
                )
                db.add(urj)
            db.commit()
            db.refresh(user)

        return True, "Authentication successful", user
