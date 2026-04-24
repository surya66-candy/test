from pydantic import BaseModel
from typing import Optional
from datetime import date


class MemberCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    role: Optional[str] = None
    position: Optional[str] = None
    biography: Optional[str] = None
    join_date: Optional[date] = None
    status: Optional[str] = "active"
    user_id: Optional[str] = None


class MemberUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    role: Optional[str] = None
    position: Optional[str] = None
    biography: Optional[str] = None
    status: Optional[str] = None
