import logging
from typing import Optional
from app.services.email.base import BaseEmailProvider

logger = logging.getLogger("nlams.email.console")


class ConsoleEmailProvider(BaseEmailProvider):
    """Console / Logger Email Provider for zero-dependency local testing."""

    def send_otp_email(
        self,
        to_email: str,
        otp: str,
        purpose: str = "Government Portal Login",
        full_name: Optional[str] = None,
    ) -> bool:
        greeting = f"Dear {full_name}," if full_name else "Greetings,"
        message = (
            f"\n==================== [NLAMS SECURE EMAIL NOTIFICATION] ====================\n"
            f"TO: {to_email}\n"
            f"SUBJECT: Your NLAMS Verification One-Time Password (OTP)\n"
            f"PURPOSE: {purpose}\n"
            f"---------------------------------------------------------------------------\n"
            f"{greeting}\n\n"
            f"Your one-time security authentication code for NLAMS is:\n\n"
            f"                       >>>  {otp}  <<<\n\n"
            f"This code is valid for 3 minutes (180 seconds). Do NOT share this code with anyone.\n"
            f"National Land Acquisition & Management System (NLAMS)\n"
            f"Government of India / Government of Maharashtra\n"
            f"===========================================================================\n"
        )
        print(message)
        logger.info(f"Sent OTP email to {to_email} via ConsoleEmailProvider [OTP: {otp}]")
        return True
