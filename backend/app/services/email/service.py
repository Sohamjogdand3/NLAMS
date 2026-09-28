import logging
from app.core.config import settings
from app.services.email.base import BaseEmailProvider
from app.services.email.console import ConsoleEmailProvider
from app.services.email.ethereal import EtherealEmailProvider
from app.services.email.mailtrap import MailtrapEmailProvider
from app.services.email.smtp import SMTPEmailProvider

logger = logging.getLogger("nlams.email.service")


class EmailService:
    """Factory and facade for sending emails through configured providers."""

    _instance: BaseEmailProvider = None

    @classmethod
    def get_provider(cls) -> BaseEmailProvider:
        if cls._instance is None:
            provider_type = (settings.EMAIL_PROVIDER or "ethereal").lower().strip()
            if provider_type == "mailtrap":
                cls._instance = MailtrapEmailProvider()
            elif provider_type == "smtp":
                cls._instance = SMTPEmailProvider()
            elif provider_type == "console":
                cls._instance = ConsoleEmailProvider()
            else:
                cls._instance = EtherealEmailProvider()
            logger.info(f"Initialized EmailService with provider: {cls._instance.__class__.__name__}")
        return cls._instance

    @classmethod
    def send_otp(
        cls,
        to_email: str,
        otp: str,
        purpose: str = "Government Portal Login",
        full_name: str = None,
    ) -> bool:
        provider = cls.get_provider()
        return provider.send_otp_email(
            to_email=to_email,
            otp=otp,
            purpose=purpose,
            full_name=full_name,
        )
