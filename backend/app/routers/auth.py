from fastapi import APIRouter, HTTPException, Depends
from app.models.auth import LoginRequest, RegisterClubRequest, ResetPasswordRequest
from app.utils.supabase_client import get_admin_client
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
async def login(request: LoginRequest):
    """Authenticate user with email and password."""
    try:
        supabase = get_admin_client()
        result = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        return {
            "message": "Login successful",
            "user": {
                "id": result.user.id,
                "email": result.user.email,
                "metadata": result.user.user_metadata,
            },
            "session": {
                "access_token": result.session.access_token,
                "refresh_token": result.session.refresh_token,
                "expires_at": result.session.expires_at,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register-club")
async def register_club(request: RegisterClubRequest):
    """Register a new user and create their club."""
    try:
        supabase = get_admin_client()

        # 1. Create user in Supabase Auth
        auth_result = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "full_name": request.full_name,
                    "club_name": request.club_name,
                }
            },
        })

        user_id = auth_result.user.id

        # 2. Create the club
        slug = request.club_name.lower().replace(" ", "-")
        slug = "".join(c for c in slug if c.isalnum() or c == "-")

        club_result = supabase.table("clubs").insert({
            "name": request.club_name,
            "slug": slug,
            "description": request.club_description,
            "contact_email": request.contact_email or request.email,
        }).execute()

        club_id = club_result.data[0]["id"]

        # 3. Assign club_admin role
        supabase.table("user_roles").insert({
            "user_id": user_id,
            "club_id": club_id,
            "role": "club_admin",
        }).execute()

        # 4. Add user as a member
        supabase.table("members").insert({
            "club_id": club_id,
            "user_id": user_id,
            "full_name": request.full_name,
            "email": request.email,
            "role": "Admin",
            "position": "Club Admin",
            "status": "active",
        }).execute()

        return {
            "message": "Registration successful. Please verify your email.",
            "user": {"id": user_id, "email": request.email},
            "club": club_result.data[0],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    """Sign out the current user."""
    try:
        supabase = get_admin_client()
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Send password reset email."""
    try:
        supabase = get_admin_client()
        supabase.auth.reset_password_for_email(request.email)
        return {"message": "Password reset email sent"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    """Get the current user's profile and roles."""
    try:
        supabase = get_admin_client()
        roles = supabase.table("user_roles").select(
            "*, clubs(name, slug)"
        ).eq("user_id", user["id"]).execute()

        return {
            "user": user,
            "roles": roles.data or [],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
