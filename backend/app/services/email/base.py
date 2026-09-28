from abc import ABC, abstractmethod
from typing import Optional


class BaseEmailProvider(ABC):
    """Abstract Base Class for NLAMS Email Providers (Mailtrap, Ethereal, SMTP, NIC Mail)."""

    @abstractmethod
    def send_otp_email(
        self,
        to_email: str,
        otp: str,
        purpose: str = "Government Portal Login",
        full_name: Optional[str] = None,
    ) -> bool:
        """Send a one-time password email to the recipient.
        
        Returns True if successfully sent/queued, False otherwise.
        """
        pass
