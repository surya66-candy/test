from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.models.club import ClubCreate, ClubUpdate, HistoryEntryCreate, HistoryEntryUpdate
from app.utils.supabase_client import get_admin_client
from app.middleware.auth import get_current_user, require_org_admin

router = APIRouter(prefix="/clubs", tags=["Clubs"])


@router.get("")
async def list_clubs(
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user),
):
    """List all clubs."""
    try:
        supabase = get_admin_client()
        query = supabase.table("clubs").select("*").order("name")

        if search:
            query = query.ilike("name", f"%{search}%")

        result = query.range(offset, offset + limit - 1).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{club_id}")
async def get_club(club_id: str, user: dict = Depends(get_current_user)):
    """Get club details by ID."""
    try:
        supabase = get_admin_client()
        result = supabase.table("clubs").select("*").eq("id", club_id).single().execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Club not found")


@router.get("/slug/{slug}")
async def get_club_by_slug(slug: str, user: dict = Depends(get_current_user)):
    """Get club details by slug."""
    try:
        supabase = get_admin_client()
        result = supabase.table("clubs").select("*").eq("slug", slug).single().execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Club not found")


@router.post("")
async def create_club(club: ClubCreate, user: dict = Depends(require_org_admin)):
    """Create a new club. Requires org admin."""
    try:
        supabase = get_admin_client()
        data = club.model_dump(exclude_none=True)
        if "establishment_date" in data and data["establishment_date"]:
            data["establishment_date"] = str(data["establishment_date"])
        result = supabase.table("clubs").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{club_id}")
async def update_club(
    club_id: str,
    club: ClubUpdate,
    user: dict = Depends(get_current_user),
):
    """Update club details. Requires club admin or org admin."""
    try:
        supabase = get_admin_client()
        data = club.model_dump(exclude_none=True)
        if "establishment_date" in data and data["establishment_date"]:
            data["establishment_date"] = str(data["establishment_date"])
        result = supabase.table("clubs").update(data).eq("id", club_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Club not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{club_id}")
async def delete_club(club_id: str, user: dict = Depends(require_org_admin)):
    """Delete a club. Requires org admin."""
    try:
        supabase = get_admin_client()
        supabase.table("clubs").delete().eq("id", club_id).execute()
        return {"message": "Club deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ========================
# Club History
# ========================

@router.get("/{club_id}/history")
async def get_club_history(club_id: str, user: dict = Depends(get_current_user)):
    """Get club history entries."""
    try:
        supabase = get_admin_client()
        result = supabase.table("club_history").select("*").eq(
            "club_id", club_id
        ).order("event_date", desc=True).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{club_id}/history")
async def add_history_entry(
    club_id: str,
    entry: HistoryEntryCreate,
    user: dict = Depends(get_current_user),
):
    """Add a history entry. Requires club admin."""
    try:
        supabase = get_admin_client()
        data = entry.model_dump(exclude_none=True)
        data["club_id"] = club_id
        if "event_date" in data and data["event_date"]:
            data["event_date"] = str(data["event_date"])
        result = supabase.table("club_history").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{club_id}/history/{history_id}")
async def update_history_entry(
    club_id: str,
    history_id: str,
    entry: HistoryEntryUpdate,
    user: dict = Depends(get_current_user),
):
    """Update a history entry. Requires club admin."""
    try:
        supabase = get_admin_client()
        data = entry.model_dump(exclude_none=True)
        if "event_date" in data and data["event_date"]:
            data["event_date"] = str(data["event_date"])
        result = supabase.table("club_history").update(data).eq(
            "id", history_id
        ).eq("club_id", club_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="History entry not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{club_id}/history/{history_id}")
async def delete_history_entry(
    club_id: str,
    history_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a history entry. Requires club admin."""
    try:
        supabase = get_admin_client()
        supabase.table("club_history").delete().eq(
            "id", history_id
        ).eq("club_id", club_id).execute()
        return {"message": "History entry deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
