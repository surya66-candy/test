from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

# Admin client using service role key (bypasses RLS)
_admin_client: Client | None = None

# Regular client using anon key (respects RLS)
_anon_client: Client | None = None


def get_admin_client() -> Client:
    """Get Supabase client with service role (admin) permissions."""
    global _admin_client
    if _admin_client is None:
        _admin_client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    return _admin_client


def get_anon_client() -> Client:
    """Get Supabase client with anon key (respects RLS)."""
    global _anon_client
    if _anon_client is None:
        _anon_client = create_client(
            settings.supabase_url,
            settings.supabase_anon_key
        )
    return _anon_client


def get_user_client(access_token: str) -> Client:
    """
    Create a Supabase client authenticated as a specific user.
    This client will respect RLS policies based on the user's JWT.
    """
    client = create_client(
        settings.supabase_url,
        settings.supabase_anon_key
    )
    client.auth.set_session(access_token, "")
    return client
