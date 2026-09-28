import json
import logging
import time
from datetime import datetime, timedelta
from typing import Optional, Tuple
import redis
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import generate_secure_otp, hash_otp
from app.models.otp_session import OTPSession
from app.services.email.service import EmailService

logger = logging.getLogger("nlams.otp.service")


class OTPService:
    """Production Redis-backed OTP management system with database audit fallback."""

    _redis_client: Optional[redis.Redis] = None
    _redis_connected: Optional[bool] = None

    @classmethod
    def get_redis(cls) -> Optional[redis.Redis]:
        if cls._redis_client is None:
            try:
                cls._redis_client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2,
                )
                cls._redis_client.ping()
                cls._redis_connected = True
                logger.info(f"Connected to Redis OTP backend at {settings.REDIS_URL}")
            except Exception as e:
                cls._redis_connected = False
                logger.warning(f"Redis unavailable ({str(e)}). Using database OTP fallback.")
        return cls._redis_client if cls._redis_connected else None

    @classmethod
    def generate_and_send_otp(
        cls,
        email: str,
        purpose: str,
        db: Session,
        full_name: Optional[str] = None,
    ) -> Tuple[bool, str, int]:
        """Generates secure 6-digit OTP, stores hashed token in Redis & DB, and dispatches via EmailService.
        
        Returns: (success: bool, message: str, cooldown_seconds: int)
        """
        clean_email = email.lower().strip()
        r = cls.get_redis()

        # 1. Rate Limit & Cooldown Check (60 seconds)
        cooldown_key = f"otp:cooldown:{clean_email}:{purpose}"
        if r:
            try:
                remaining_cooldown = r.ttl(cooldown_key)
                if remaining_cooldown and remaining_cooldown > 0:
                    return (
                        False,
                        f"Please wait {remaining_cooldown} seconds before requesting another OTP.",
                        remaining_cooldown,
                    )
            except Exception as e:
                logger.error(f"Redis cooldown read error: {e}")
        else:
            # DB cooldown fallback
            recent = (
                db.query(OTPSession)
                .filter(
                    OTPSession.email == clean_email,
                    OTPSession.purpose == purpose,
                    OTPSession.created_at >= datetime.utcnow() - timedelta(seconds=settings.OTP_COOLDOWN_SECONDS),
                )
                .first()
            )
            if recent:
                elapsed = (datetime.utcnow() - recent.created_at).total_seconds()
                wait_sec = max(1, int(settings.OTP_COOLDOWN_SECONDS - elapsed))
                return (
                    False,
                    f"Please wait {wait_sec} seconds before requesting another OTP.",
                    wait_sec,
                )

        # 2. Generate secure numeric OTP & Hash
        raw_otp = generate_secure_otp(length=settings.OTP_LENGTH)
        otp_hashed = hash_otp(raw_otp, salt=clean_email)
        ttl = settings.OTP_TTL_SECONDS
        expires_at = datetime.utcnow() + timedelta(seconds=ttl)

        # 3. Store in Redis
        if r:
            try:
                otp_key = f"otp:{clean_email}:{purpose}"
                otp_data = {
                    "otp_hash": otp_hashed,
                    "attempts": 0,
                    "created_at": time.time(),
                    "expires_at": expires_at.timestamp(),
                }
                r.setex(otp_key, ttl, json.dumps(otp_data))
                r.setex(cooldown_key, settings.OTP_COOLDOWN_SECONDS, "1")
            except Exception as e:
                logger.error(f"Redis store error: {e}")

        # 4. Store in Database for audit and fallback
        db_session = OTPSession(
            email=clean_email,
            otp_hash=otp_hashed,
            purpose=purpose,
            expires_at=expires_at,
            attempts=0,
            created_at=datetime.utcnow(),
        )
        db.add(db_session)
        db.commit()

        # 5. Dispatch via Email Service
        EmailService.send_otp(
            to_email=clean_email,
            otp=raw_otp,
            purpose=purpose,
            full_name=full_name,
        )

        return (
            True,
            f"OTP sent successfully to {clean_email}. Valid for 3 minutes.",
            settings.OTP_COOLDOWN_SECONDS,
        )

    @classmethod
    def verify_otp(
        cls,
        email: str,
        entered_otp: str,
        purpose: str,
        db: Session,
    ) -> Tuple[bool, str]:
        """Verifies the supplied OTP against hashed storage in Redis (or DB fallback).
        
        Enforces 3-attempt limit and single-use deletion.
        """
        clean_email = email.lower().strip()
        entered_hash = hash_otp(entered_otp.strip(), salt=clean_email)
        r = cls.get_redis()

        # 1. Check Redis first if available
        if r:
            try:
                otp_key = f"otp:{clean_email}:{purpose}"
                raw_data = r.get(otp_key)
                if raw_data:
                    data = json.loads(raw_data)
                    attempts = data.get("attempts", 0) + 1
                    data["attempts"] = attempts

                    if attempts > settings.OTP_MAX_ATTEMPTS:
                        r.delete(otp_key)
                        return False, "Maximum verification attempts exceeded. Please request a new OTP."

                    if data.get("otp_hash") == entered_hash:
                        # Success - single use deletion
                        r.delete(otp_key)
                        cls._mark_db_verified(clean_email, purpose, db)
                        return True, "OTP verified successfully."
                    else:
                        ttl_left = r.ttl(otp_key)
                        if ttl_left and ttl_left > 0:
                            r.setex(otp_key, ttl_left, json.dumps(data))
                        attempts_left = settings.OTP_MAX_ATTEMPTS - attempts
                        return (
                            False,
                            f"Invalid OTP code. {attempts_left} attempt(s) remaining.",
                        )
            except Exception as e:
                logger.error(f"Redis verify error: {e}; attempting DB fallback.")

        # 2. Database Fallback verification
        db_record = (
            db.query(OTPSession)
            .filter(
                OTPSession.email == clean_email,
                OTPSession.purpose == purpose,
                OTPSession.verified_at.is_(None),
            )
            .order_by(OTPSession.created_at.desc())
            .first()
        )

        if not db_record:
            return False, "No active OTP found. Please request a new OTP."

        if db_record.expires_at < datetime.utcnow():
            return False, "OTP has expired. Please request a new OTP."

        db_record.attempts += 1

        if db_record.attempts > settings.OTP_MAX_ATTEMPTS:
            db.commit()
            return False, "Maximum verification attempts exceeded. Please request a new OTP."

        if db_record.otp_hash == entered_hash:
            db_record.verified_at = datetime.utcnow()
            db.commit()
            return True, "OTP verified successfully."
        else:
            db.commit()
            attempts_left = settings.OTP_MAX_ATTEMPTS - db_record.attempts
            return (
                False,
                f"Invalid OTP code. {attempts_left} attempt(s) remaining.",
            )

    @classmethod
    def _mark_db_verified(cls, email: str, purpose: str, db: Session):
        try:
            record = (
                db.query(OTPSession)
                .filter(
                    OTPSession.email == email,
                    OTPSession.purpose == purpose,
                    OTPSession.verified_at.is_(None),
                )
                .order_by(OTPSession.created_at.desc())
                .first()
            )
            if record:
                record.verified_at = datetime.utcnow()
                db.commit()
        except Exception as e:
            logger.error(f"Failed to mark DB OTP session verified: {e}")
