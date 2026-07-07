"""Auth service: registration, login, and user lookup."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserOut


class AuthService:
    """Handles user registration, authentication, and lookup."""

    def __init__(self, db: Session = Depends(get_db)) -> None:
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, payload: UserCreate) -> UserOut:
        if self.user_repo.get_by_email(payload.email):
            raise ConflictError("Email already registered")
        if self.user_repo.get_by_username(payload.username):
            raise ConflictError("Username already taken")

        user = self.user_repo.create(
            email=payload.email,
            username=payload.username,
            hashed_password=hash_password(payload.password),
        )
        return UserOut.model_validate(user)

    def login(self, payload: UserLogin) -> Token:
        user = self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise UnauthorizedError("Incorrect email or password")

        access_token = create_access_token(subject=user.id)
        return Token(access_token=access_token)

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.user_repo.get(user_id)
