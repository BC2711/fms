from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.permissions.dependencies import CurrentUser
from app.schemas.common import response
from app.services.rbac import all_permission_codes, menu_tree, overrides, permission_codes

router = APIRouter(tags=["access control"])
Db = Annotated[Session, Depends(get_db)]


@router.get("/menus")
def my_menus(user: CurrentUser, db: Db):
    return response("Menus retrieved successfully", menu_tree(db, user))


@router.get("/permissions")
def my_permissions(user: CurrentUser, db: Db):
    permissions = all_permission_codes(db) if user.is_super_user else sorted(permission_codes(user))
    return response("Permissions retrieved successfully", {"permissions": permissions, "implicit_all": user.is_super_user, "overrides": overrides(user)["permissions"]})
