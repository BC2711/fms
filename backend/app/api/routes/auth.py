from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.security import create_access_token, verify_password
from app.database.session import get_db
from app.models.identity import User
from app.permissions.dependencies import CurrentUser
from app.schemas.auth import LoginRequest
from app.schemas.common import response

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/login")
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    user = db.scalar(select(User).where(User.email == payload.email, User.deleted_at.is_(None)))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise AppError("Invalid email or password", 401)
    permissions = sorted(user.permission_codes)
    token = create_access_token(str(user.id), permissions)
    return response("Login successful", {"access_token": token, "token_type": "bearer", "expires_in": get_settings().access_token_minutes * 60, "permissions": permissions, "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "roles": [role.name for role in user.roles], "is_superuser": user.is_superuser}})


@router.get("/me")
def me(user: CurrentUser):
    return response("Current user retrieved successfully", {"id": user.id, "email": user.email, "full_name": user.full_name, "permissions": sorted(user.permission_codes), "roles": [role.name for role in user.roles], "is_superuser": user.is_superuser})
