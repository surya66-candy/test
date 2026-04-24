from pydantic import BaseModel
from typing import Optional
from datetime import date


class ClubCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    mission_statement: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    establishment_date: Optional[date] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    social_links: Optional[dict] = {}


class ClubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    mission_statement: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    establishment_date: Optional[date] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    social_links: Optional[dict] = None


class HistoryEntryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: Optional[date] = None
    event_type: Optional[str] = "milestone"
    images: Optional[list] = []


class HistoryEntryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[date] = None
    event_type: Optional[str] = None
    images: Optional[list] = None
