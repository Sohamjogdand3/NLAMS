import logging
from typing import Optional
from app.services.email.base import BaseEmailProvider
from app.services.email.smtp import SMTPEmailProvider

logger = logging.getLogger("nlams.email.ethereal")


class EtherealEmailProvider(BaseEmailProvider):
    """Ethereal Email Provider for simulated transactional testing with fallback logging."""

    def __init__(self):
        self.smtp = SMTPEmailProvider()

    def send_otp_email(
        self,
        to_email: str,
        otp: str,
        purpose: str = "Government Portal Login",
        full_name: Optional[str] = None,
    ) -> bool:
        logger.info(f"[Ethereal Email Delivery] To: {to_email} | Purpose: {purpose} | OTP: {otp}")
        print(
            f"\n------------------------------------------------------------\n"
            f"[ETHEREAL / DEV DISPATCH] OTP: {otp} sent to {to_email}\n"
            f"Recipient: {full_name or 'Authorized User'} | Subject: {purpose}\n"
            f"------------------------------------------------------------\n"
        )
        return True
