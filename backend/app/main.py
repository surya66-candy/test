from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.routers import auth, clubs, members, forum, notifications

settings = get_settings()

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])

# Create FastAPI app
app = FastAPI(
    title="ClubConnect API",
    description="Backend API for the ClubConnect multi-club forum platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


# Register routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(clubs.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(forum.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "name": "ClubConnect API",
        "version": "1.0.0",
        "docs": "/api/docs",
    }
