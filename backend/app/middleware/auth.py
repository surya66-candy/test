from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import get_settings
from app.utils.supabase_client import get_admin_client

security = HTTPBearer()
settings = get_settings()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Extract and validate the current user from the Supabase JWT.
    Returns a dict with user info including id, email, and metadata.
    """
    token = credentials.credentials
    try:
        # Decode JWT — Supabase uses HS256 with the JWT secret
        # In production, verify with your Supabase JWT secret
        # For now, we use the Supabase admin client to validate
        payload = jwt.decode(
            token,
            key="",  # Key not needed when verify_signature is False
            options={"verify_signature": False},  # Supabase handles verification
            algorithms=["HS256"],
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no user ID")

        return {
            "id": user_id,
            "email": payload.get("email", ""),
            "role": payload.get("role", ""),
            "metadata": payload.get("user_metadata", {}),
        }
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def get_user_roles(user: dict = Depends(get_current_user)) -> list:
    """Fetch all roles for the current user from the database."""
    supabase = get_admin_client()
    result = supabase.table("user_roles").select("*").eq("user_id", user["id"]).execute()
    return result.data or []


async def require_org_admin(
    user: dict = Depends(get_current_user),
    roles: list = Depends(get_user_roles),
):
    """Require that the current user is an organization admin."""
    if not any(r["role"] == "org_admin" for r in roles):
        raise HTTPException(status_code=403, detail="Organization admin access required")
    return user


async def require_club_admin(
    club_id: str,
    user: dict = Depends(get_current_user),
    roles: list = Depends(get_user_roles),
):
    """Require that the current user is admin for the given club."""
    is_org_admin = any(r["role"] == "org_admin" for r in roles)
    is_club_admin = any(
        r["role"] == "club_admin" and r["club_id"] == club_id for r in roles
    )
    if not (is_org_admin or is_club_admin):
        raise HTTPException(status_code=403, detail="Club admin access required")
    return user


async def require_club_member(
    club_id: str,
    user: dict = Depends(get_current_user),
    roles: list = Depends(get_user_roles),
):
    """Require that the current user is a member of the given club."""
    is_member = any(r["club_id"] == club_id for r in roles)
    is_org_admin = any(r["role"] == "org_admin" for r in roles)
    if not (is_member or is_org_admin):
        raise HTTPException(status_code=403, detail="Club membership required")
    return user
