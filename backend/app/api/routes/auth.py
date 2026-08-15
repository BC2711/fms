from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.security import create_access_token, verify_password
from app.database.session import get_db
from app.models.resources import User
from app.permissions.dependencies import CurrentUser
from app.schemas.auth import LoginRequest
from app.schemas.common import response
from app.services.rbac import menu_tree, overrides, permission_codes

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/login")
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    user = db.scalar(select(User).where(User.email == payload.email, User.deleted_at.is_(None)))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise AppError("Invalid email or password", 401)
    permissions = sorted(permission_codes(user))
    token = create_access_token(str(user.id), permissions)
    return response("Login successful", {"access_token": token, "token_type": "bearer", "expires_in": get_settings().access_token_minutes * 60, "permissions": permissions, "menus": menu_tree(db, user), "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "roles": [role.name for role in user.roles], "user_type": user.user_type.code if user.user_type else None, "is_super_user": user.is_super_user, "is_superuser": user.is_super_user}})


@router.get("/me")
def me(user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    return response("Current user retrieved successfully", {"id": user.id, "email": user.email, "full_name": user.full_name, "permissions": sorted(permission_codes(user)), "menus": menu_tree(db, user), "roles": [role.name for role in user.roles], "user_type": user.user_type.code if user.user_type else None, "is_super_user": user.is_super_user, "is_superuser": user.is_super_user, "overrides": overrides(user)})
