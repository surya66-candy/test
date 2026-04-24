from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from typing import Optional
from app.models.member import MemberCreate, MemberUpdate
from app.utils.supabase_client import get_admin_client
from app.middleware.auth import get_current_user
import csv
import io

router = APIRouter(tags=["Members"])


@router.get("/clubs/{club_id}/members")
async def list_members(
    club_id: str,
    search: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user: dict = Depends(get_current_user),
):
    """List club members with optional search and filter."""
    try:
        supabase = get_admin_client()
        query = supabase.table("members").select("*").eq("club_id", club_id)

        if search:
            query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%")
        if status and status != "all":
            query = query.eq("status", status)

        result = query.order("full_name").range(offset, offset + limit - 1).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/clubs/{club_id}/members")
async def add_member(
    club_id: str,
    member: MemberCreate,
    user: dict = Depends(get_current_user),
):
    """Add a member to a club. Requires club admin."""
    try:
        supabase = get_admin_client()
        data = member.model_dump(exclude_none=True)
        data["club_id"] = club_id
        if "join_date" in data and data["join_date"]:
            data["join_date"] = str(data["join_date"])
        result = supabase.table("members").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/members/{member_id}")
async def get_member(member_id: str, user: dict = Depends(get_current_user)):
    """Get member details."""
    try:
        supabase = get_admin_client()
        result = supabase.table("members").select("*").eq("id", member_id).single().execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Member not found")


@router.put("/members/{member_id}")
async def update_member(
    member_id: str,
    member: MemberUpdate,
    user: dict = Depends(get_current_user),
):
    """Update member details."""
    try:
        supabase = get_admin_client()
        data = member.model_dump(exclude_none=True)
        result = supabase.table("members").update(data).eq("id", member_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Member not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/members/{member_id}")
async def remove_member(member_id: str, user: dict = Depends(get_current_user)):
    """Remove a member. Requires club admin."""
    try:
        supabase = get_admin_client()
        supabase.table("members").delete().eq("id", member_id).execute()
        return {"message": "Member removed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/clubs/{club_id}/members/export")
async def export_members(club_id: str, user: dict = Depends(get_current_user)):
    """Export club members as CSV."""
    try:
        supabase = get_admin_client()
        result = supabase.table("members").select("*").eq("club_id", club_id).order("full_name").execute()
        members = result.data or []

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Name", "Email", "Phone", "Role", "Position", "Status", "Join Date"])
        for m in members:
            writer.writerow([
                m.get("full_name", ""),
                m.get("email", ""),
                m.get("phone", ""),
                m.get("role", ""),
                m.get("position", ""),
                m.get("status", ""),
                m.get("join_date", ""),
            ])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=members_{club_id}.csv"},
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
