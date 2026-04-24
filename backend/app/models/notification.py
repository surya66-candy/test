from pydantic import BaseModel
from typing import Optional


class NotificationCreate(BaseModel):
    user_id: str
    type: str
    title: str
    message: Optional[str] = None
    link: Optional[str] = None
    related_id: Optional[str] = None
