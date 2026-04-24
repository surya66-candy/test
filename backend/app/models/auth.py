from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterClubRequest(BaseModel):
    email: str
    password: str
    full_name: str
    club_name: str
    club_description: Optional[str] = None
    contact_email: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    email: str


class AuthResponse(BaseModel):
    message: str
    user: Optional[dict] = None
    session: Optional[dict] = None
