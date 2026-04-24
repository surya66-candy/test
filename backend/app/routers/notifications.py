from fastapi import APIRouter, HTTPException, Depends, Query
from app.utils.supabase_client import get_admin_client
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def list_notifications(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user),
):
    """List notifications for the current user."""
    try:
        supabase = get_admin_client()
        result = supabase.table("notifications").select("*").eq(
            "user_id", user["id"]
        ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/unread-count")
async def get_unread_count(user: dict = Depends(get_current_user)):
    """Get the count of unread notifications."""
    try:
        supabase = get_admin_client()
        result = supabase.table("notifications").select(
            "id", count="exact"
        ).eq("user_id", user["id"]).eq("is_read", False).execute()
        return {"count": result.count or 0}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, user: dict = Depends(get_current_user)):
    """Mark a notification as read."""
    try:
        supabase = get_admin_client()
        result = supabase.table("notifications").update({
            "is_read": True
        }).eq("id", notification_id).eq("user_id", user["id"]).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/read-all")
async def mark_all_as_read(user: dict = Depends(get_current_user)):
    """Mark all notifications as read."""
    try:
        supabase = get_admin_client()
        supabase.table("notifications").update({
            "is_read": True
        }).eq("user_id", user["id"]).eq("is_read", False).execute()
        return {"message": "All notifications marked as read"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
