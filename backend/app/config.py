from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    supabase_url: str = "https://placeholder.supabase.co"
    supabase_anon_key: str = "placeholder-anon-key"
    supabase_service_role_key: str = "placeholder-service-role-key"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    rate_limit: str = "100/minute"
    debug: bool = True

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
