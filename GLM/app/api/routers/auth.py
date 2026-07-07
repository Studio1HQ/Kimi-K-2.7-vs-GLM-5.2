"""Authentication routes: register and login."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(
    payload: UserCreate,
    auth_service: AuthService = Depends(),
) -> UserOut:
    """Register a new user."""
    return auth_service.register(payload)


@router.post("/login", response_model=Token)
def login(
    payload: UserLogin,
    auth_service: AuthService = Depends(),
) -> Token:
    """Authenticate a user and return a JWT access token.

    This endpoint is OAuth2PasswordBearer-compatible: FastAPI's Swagger UI
    will send `username` and `password` as form fields. We also accept a
    JSON body for convenience.
    """
    return auth_service.login(payload)