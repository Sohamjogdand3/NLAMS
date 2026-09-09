from typing import Optional, List
from pydantic import BaseModel, Field


class CitizenLoginRequest(BaseModel):
    mobile_number: str = Field(..., description="10-digit mobile number", example="9876543210")
    otp: str = Field(default="123456", description="OTP received on mobile (mock: '123456')", example="123456")


class OfficialLoginRequest(BaseModel):
    emp_id: str = Field(..., description="Employee / Official ID", example="LAO-101")
    password: str = Field(..., description="Official account password", example="Password@123")
    otp: str = Field(default="123456", description="2FA OTP (mock: '123456')", example="123456")


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
