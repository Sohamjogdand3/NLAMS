from app.services.email.smtp import SMTPEmailProvider
from app.core.config import settings


class MailtrapEmailProvider(SMTPEmailProvider):
    """Mailtrap Email Provider for development & staging testing."""

    def __init__(self):
        super().__init__(
            host=settings.SMTP_HOST or "sandbox.smtp.mailtrap.io",
            port=settings.SMTP_PORT or 2525,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            from_email=settings.SMTP_FROM_EMAIL,
            from_name=settings.SMTP_FROM_NAME,
            use_tls=True,
        )
