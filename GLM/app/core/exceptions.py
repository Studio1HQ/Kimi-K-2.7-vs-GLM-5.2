"""Custom application exceptions and FastAPI exception handlers."""

from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error carrying an HTTP status code."""

    status_code: int = 400
    detail: str = "Bad request"

    def __init__(self, detail: str | None = None, status_code: int | None = None):
        self.detail = detail or self.detail
        self.status_code = status_code or self.status_code
        super().__init__(self.detail)


class NotFoundError(AppError):
    status_code = 404
    detail = "Resource not found"


class ConflictError(AppError):
    status_code = 409
    detail = "Conflict"


class UnauthorizedError(AppError):
    status_code = 401
    detail = "Not authenticated"


class ForbiddenError(AppError):
    status_code = 403
    detail = "Forbidden"


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Handler for all AppError subclasses."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Catch-all handler for unexpected errors."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )