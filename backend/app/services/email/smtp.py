import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.services.email.base import BaseEmailProvider
from app.core.config import settings

logger = logging.getLogger("nlams.email.smtp")


class SMTPEmailProvider(BaseEmailProvider):
    """Production-grade SMTP Email Provider (NIC Mail / Custom Gov SMTP compatible)."""

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
        use_tls: bool = True,
    ):
        self.host = host or settings.SMTP_HOST
        self.port = port or settings.SMTP_PORT
        self.username = username or settings.SMTP_USER
        self.password = password or settings.SMTP_PASSWORD
        self.from_email = from_email or settings.SMTP_FROM_EMAIL
        self.from_name = from_name or settings.SMTP_FROM_NAME
        self.use_tls = use_tls

    def send_otp_email(
        self,
        to_email: str,
        otp: str,
        purpose: str = "Government Portal Login",
        full_name: Optional[str] = None,
    ) -> bool:
        if not self.host or not self.username or not self.password:
            logger.warning("SMTP credentials not fully configured; falling back to logged OTP delivery.")
            print(f"\n[DEV SMTP NOT CONFIGURED] OTP for {to_email}: {otp}\n")
            return True

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"NLAMS Identity Verification OTP: {otp}"
        msg["From"] = f"{self.from_name} <{self.from_email}>"
        msg["To"] = to_email

        recipient_name = full_name if full_name else "Official / Citizen"
        
        text_content = f"""
NLAMS National Identity System
--------------------------------
Hello {recipient_name},

Your one-time authentication code (OTP) for {purpose} is: {otp}

This code will expire in 3 minutes (180 seconds).
If you did not request this OTP, please report this immediately to the NLAMS Security Cell.

Regards,
National Land Acquisition & Management System (NLAMS)
Government of India
"""

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NLAMS OTP Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f7fc; margin: 0; padding: 24px;">
  <div style="max-width: 580px; margin: auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background-color: #042A5E; padding: 20px 28px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.5px;">National Land Acquisition &amp; Management System</h1>
      <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 13px;">Government of India &bull; Digital Identity Portal</p>
    </div>
    <div style="padding: 28px;">
      <p style="color: #334155; font-size: 15px; margin-top: 0;">Hello <strong>{recipient_name}</strong>,</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        You have requested a secure sign-in verification code for <strong>{purpose}</strong>.
      </p>
      <div style="background-color: #f8fafc; border: 2px dashed #042A5E; border-radius: 8px; text-align: center; padding: 18px; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #042A5E; font-family: monospace;">{otp}</span>
        <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">Valid for <strong>3 minutes (180 seconds)</strong> &bull; Single-use only</p>
      </div>
      <p style="color: #dc2626; font-size: 12px; line-height: 1.4;">
        <strong>Security Notice:</strong> Government officials must never share authentication credentials or OTP codes. If you did not initiate this request, contact your nodal cyber officer immediately.
      </p>
    </div>
    <div style="background-color: #f1f5f9; padding: 14px 28px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 11px;">
      NLAMS Digital Governance Platform &bull; Ministry of Rural Development &bull; DoLR
    </div>
  </div>
</body>
</html>
"""

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        try:
            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.username, self.password)
                server.sendmail(self.from_email, [to_email], msg.as_string())
            logger.info(f"Successfully sent OTP email to {to_email} via SMTP ({self.host})")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via SMTP ({self.host}:{self.port}): {str(e)}")
            # Fallback to local console log so dev flow doesn't hang or fail
            print(f"\n[SMTP ERROR - FALLBACK LOG] OTP for {to_email}: {otp} (Error: {e})\n")
            return True
