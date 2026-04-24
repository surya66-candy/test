from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from app.models.forum import ThreadCreate, ThreadUpdate, ReplyCreate, ReplyUpdate, VoteRequest
from app.utils.supabase_client import get_admin_client
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/forums", tags=["Forum"])


@router.get("/threads")
async def list_threads(
    club_id: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("newest", regex="^(newest|oldest|most_viewed)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    user: dict = Depends(get_current_user),
):
    """List forum threads with filters and pagination."""
    try:
        supabase = get_admin_client()
        query = supabase.table("forum_threads").select("*")

        if club_id:
            query = query.eq("club_id", club_id)
        if category:
            query = query.eq("category", category)
        if search:
            query = query.ilike("title", f"%{search}%")

        # Sorting
        if sort_by == "newest":
            query = query.order("is_pinned", desc=True).order("created_at", desc=True)
        elif sort_by == "oldest":
            query = query.order("created_at", desc=False)
        elif sort_by == "most_viewed":
            query = query.order("views_count", desc=True)

        offset = (page - 1) * limit
        result = query.range(offset, offset + limit - 1).execute()

        return {
            "threads": result.data or [],
            "has_more": len(result.data or []) == limit,
            "page": page,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/threads/{thread_id}")
async def get_thread(thread_id: str, user: dict = Depends(get_current_user)):
    """Get thread details and increment view count."""
    try:
        supabase = get_admin_client()
        result = supabase.table("forum_threads").select("*").eq("id", thread_id).single().execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Thread not found")

        # Increment view count
        supabase.table("forum_threads").update({
            "views_count": (result.data.get("views_count", 0) or 0) + 1
        }).eq("id", thread_id).execute()

        return result.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/threads")
async def create_thread(thread: ThreadCreate, user: dict = Depends(get_current_user)):
    """Create a new thread."""
    try:
        supabase = get_admin_client()
        data = thread.model_dump(exclude_none=True)
        data["author_id"] = user["id"]
        data["author_name"] = user.get("metadata", {}).get("full_name", user.get("email", ""))
        result = supabase.table("forum_threads").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/threads/{thread_id}")
async def update_thread(
    thread_id: str,
    thread: ThreadUpdate,
    user: dict = Depends(get_current_user),
):
    """Update a thread. Only author or admin can update."""
    try:
        supabase = get_admin_client()
        data = thread.model_dump(exclude_none=True)
        result = supabase.table("forum_threads").update(data).eq("id", thread_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Thread not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/threads/{thread_id}")
async def delete_thread(thread_id: str, user: dict = Depends(get_current_user)):
    """Delete a thread."""
    try:
        supabase = get_admin_client()
        supabase.table("forum_threads").delete().eq("id", thread_id).execute()
        return {"message": "Thread deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/threads/{thread_id}/pin")
async def pin_thread(thread_id: str, user: dict = Depends(get_current_user)):
    """Toggle pin status on a thread. Admin only."""
    try:
        supabase = get_admin_client()
        current = supabase.table("forum_threads").select("is_pinned").eq("id", thread_id).single().execute()
        if not current.data:
            raise HTTPException(status_code=404, detail="Thread not found")

        new_value = not current.data.get("is_pinned", False)
        result = supabase.table("forum_threads").update({"is_pinned": new_value}).eq("id", thread_id).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/threads/{thread_id}/lock")
async def lock_thread(thread_id: str, user: dict = Depends(get_current_user)):
    """Toggle lock status on a thread. Admin only."""
    try:
        supabase = get_admin_client()
        current = supabase.table("forum_threads").select("is_locked").eq("id", thread_id).single().execute()
        if not current.data:
            raise HTTPException(status_code=404, detail="Thread not found")

        new_value = not current.data.get("is_locked", False)
        result = supabase.table("forum_threads").update({"is_locked": new_value}).eq("id", thread_id).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ========================
# Replies
# ========================

@router.get("/threads/{thread_id}/replies")
async def get_replies(thread_id: str, user: dict = Depends(get_current_user)):
    """Get all replies for a thread."""
    try:
        supabase = get_admin_client()
        result = supabase.table("forum_replies").select("*").eq(
            "thread_id", thread_id
        ).order("created_at").execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/threads/{thread_id}/replies")
async def add_reply(
    thread_id: str,
    reply: ReplyCreate,
    user: dict = Depends(get_current_user),
):
    """Add a reply to a thread."""
    try:
        supabase = get_admin_client()

        # Check if thread is locked
        thread = supabase.table("forum_threads").select("is_locked").eq("id", thread_id).single().execute()
        if thread.data and thread.data.get("is_locked"):
            raise HTTPException(status_code=403, detail="Thread is locked")

        data = {
            "thread_id": thread_id,
            "author_id": user["id"],
            "author_name": user.get("metadata", {}).get("full_name", user.get("email", "")),
            "content": reply.content,
            "parent_reply_id": reply.parent_reply_id,
        }
        result = supabase.table("forum_replies").insert(data).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/replies/{reply_id}")
async def update_reply(
    reply_id: str,
    reply: ReplyUpdate,
    user: dict = Depends(get_current_user),
):
    """Update a reply. Only author can update."""
    try:
        supabase = get_admin_client()
        result = supabase.table("forum_replies").update({
            "content": reply.content
        }).eq("id", reply_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Reply not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/replies/{reply_id}")
async def delete_reply(reply_id: str, user: dict = Depends(get_current_user)):
    """Delete a reply."""
    try:
        supabase = get_admin_client()
        supabase.table("forum_replies").delete().eq("id", reply_id).execute()
        return {"message": "Reply deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/replies/{reply_id}/vote")
async def vote_reply(
    reply_id: str,
    vote: VoteRequest,
    user: dict = Depends(get_current_user),
):
    """Upvote or downvote a reply."""
    try:
        if vote.vote_type not in ("up", "down"):
            raise HTTPException(status_code=400, detail="Vote type must be 'up' or 'down'")

        supabase = get_admin_client()

        # Check existing vote
        existing = supabase.table("reply_votes").select("*").eq(
            "reply_id", reply_id
        ).eq("user_id", user["id"]).execute()

        if existing.data:
            old_vote = existing.data[0]
            if old_vote["vote_type"] == vote.vote_type:
                # Remove vote
                supabase.table("reply_votes").delete().eq("id", old_vote["id"]).execute()
                # Update counts
                field = "upvotes" if vote.vote_type == "up" else "downvotes"
                reply = supabase.table("forum_replies").select(field).eq("id", reply_id).single().execute()
                new_count = max(0, (reply.data.get(field, 0) or 0) - 1)
                supabase.table("forum_replies").update({field: new_count}).eq("id", reply_id).execute()
                return {"message": "Vote removed"}
            else:
                # Change vote
                supabase.table("reply_votes").update({"vote_type": vote.vote_type}).eq("id", old_vote["id"]).execute()
                # Update counts
                old_field = "upvotes" if old_vote["vote_type"] == "up" else "downvotes"
                new_field = "upvotes" if vote.vote_type == "up" else "downvotes"
                reply = supabase.table("forum_replies").select("upvotes, downvotes").eq("id", reply_id).single().execute()
                supabase.table("forum_replies").update({
                    old_field: max(0, (reply.data.get(old_field, 0) or 0) - 1),
                    new_field: (reply.data.get(new_field, 0) or 0) + 1,
                }).eq("id", reply_id).execute()
                return {"message": "Vote changed"}
        else:
            # New vote
            supabase.table("reply_votes").insert({
                "reply_id": reply_id,
                "user_id": user["id"],
                "vote_type": vote.vote_type,
            }).execute()
            field = "upvotes" if vote.vote_type == "up" else "downvotes"
            reply = supabase.table("forum_replies").select(field).eq("id", reply_id).single().execute()
            new_count = (reply.data.get(field, 0) or 0) + 1
            supabase.table("forum_replies").update({field: new_count}).eq("id", reply_id).execute()
            return {"message": "Vote recorded"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
