from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.resources import User

bearer = HTTPBearer(auto_error=False)


def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)], db: Annotated[Session, Depends(get_db)]) -> User:
    if credentials is None:
        raise AppError("Authentication required", 401)
    token = credentials.credentials
    if token == get_settings().api_token:
        user = db.scalar(select(User).where(User.is_superuser.is_(True), User.deleted_at.is_(None)))
    else:
        try:
            subject = decode_access_token(token)["sub"]
            user = db.get(User, int(subject))
        except (InvalidTokenError, KeyError, TypeError, ValueError):
            user = None
    if user is None or user.deleted_at is not None or user.status != "active":
        raise AppError("Invalid or expired access token", 401)
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_permission(permission: str):
    def dependency(user: CurrentUser) -> User:
        if not user.is_superuser and permission not in user.permission_codes:
            raise AppError(f"Missing permission: {permission}", 403)
        return user
    return dependency
