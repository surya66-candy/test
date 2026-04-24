from pydantic import BaseModel
from typing import Optional


class ThreadCreate(BaseModel):
    title: str
    content: str
    club_id: Optional[str] = None
    category: Optional[str] = "General"
    tags: Optional[list[str]] = []
    is_organization_wide: Optional[bool] = False


class ThreadUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[list[str]] = None


class ReplyCreate(BaseModel):
    content: str
    parent_reply_id: Optional[str] = None


class ReplyUpdate(BaseModel):
    content: str


class VoteRequest(BaseModel):
    vote_type: str  # 'up' or 'down'
