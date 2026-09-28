from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr


class OfficialRequestOTPRequest(BaseModel):
    email: EmailStr = Field(..., description="Official government email (e.g. collector.pune@nlams.gov.demo)", example="collector.pune@nlams.gov.demo")
    device_id: Optional[str] = Field(None, description="Optional unique device identifier")


class OfficialVerifyOTPRequest(BaseModel):
    email: EmailStr = Field(..., description="Official government email", example="collector.pune@nlams.gov.demo")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit secure OTP", example="123456")
    device_id: Optional[str] = Field(None, description="Optional unique device identifier")


class CitizenRequestOTPRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, description="Citizen email address", example="citizen@example.com")
    mobile_number: Optional[str] = Field(None, description="10-digit mobile number", example="9876543210")
    provider: Optional[str] = Field("email_otp", description="Identity provider (email_otp, aadhaar_stub, digilocker_stub)")


class CitizenVerifyOTPRequest(BaseModel):
    identifier: str = Field(..., description="Email or mobile number", example="citizen@example.com")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit secure OTP", example="123456")
    provider: Optional[str] = Field("email_otp", description="Identity provider")
    device_id: Optional[str] = Field(None, description="Optional unique device identifier")


class OTPRequestResponse(BaseModel):
    message: str
    identifier_masked: str
    expires_in_seconds: int = 180
    cooldown_seconds: int = 60
    provider: str = "email_otp"


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = Field(None, description="JWT Refresh Token to revoke")


class LogoutResponse(BaseModel):
    message: str = "Successfully logged out and session revoked"
    success: bool = True


# Legacy request schemas kept for backward-compatibility
class CitizenLoginRequest(BaseModel):
    mobile_number: Optional[str] = Field(None, description="10-digit mobile number", example="9876543210")
    email: Optional[EmailStr] = Field(None, description="Citizen email", example="citizen@example.com")
    otp: str = Field(default="123456", description="OTP received", example="123456")


class OfficialLoginRequest(BaseModel):
    emp_id: Optional[str] = Field(None, description="Employee / Official ID", example="LAO-101")
    email: Optional[EmailStr] = Field(None, description="Official government email", example="lao.pune@nlams.gov.demo")
    password: Optional[str] = Field(None, description="Official account password", example="Password@123")
    otp: Optional[str] = Field(default="123456", description="2FA OTP", example="123456")


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid JWT refresh token")


class JurisdictionOut(BaseModel):
    id: int
    name: str
    type: str
    code: Optional[str] = None
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True


class RoleOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    full_name: str
    mobile_number: Optional[str] = None
    emp_id: Optional[str] = None
    org_id: Optional[str] = None
    email: Optional[str] = None
    designation: Optional[str] = None
    department_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
    role: RoleOut
    jurisdiction: Optional[JurisdictionOut] = None


class UserMeResponse(BaseModel):
    user: UserOut
    active_role: RoleOut
    active_jurisdiction: Optional[JurisdictionOut] = None
    assignments: List[dict] = []
