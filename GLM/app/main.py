"""FastAPI application entry point."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routers import auth, tasks
from app.core.exceptions import AppError, app_error_handler, unhandled_exception_handler
from app.db.base import Base
from app.db.session import engine

STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(
    title="Task Management API",
    description="A REST API for managing tasks with JWT authentication.",
    version="1.0.0",
)


@app.on_event("startup")
def create_tables() -> None:
    """Create database tables on startup (dev convenience)."""
    Base.metadata.create_all(bind=engine)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


# Register exception handlers
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")

# Serve the frontend (must be mounted last so it doesn't shadow /api and /health)
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")