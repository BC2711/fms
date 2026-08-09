from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.errors import AppError, NotFoundError
from app.core.security import hash_password
from app.database.session import get_db
from app.models.audit import AuditLog
from app.models.identity import Permission, Role, User
from app.permissions.dependencies import require_permission
from app.schemas.common import response

router = APIRouter(prefix="/administration", tags=["administration"])
Db = Annotated[Session, Depends(get_db)]


def admin_user(operation: str):
    return Annotated[User, Depends(require_permission(f"administration.all-users.{operation}"))]


def admin_role(operation: str):
    return Annotated[User, Depends(require_permission(f"administration.roles.{operation}"))]


def admin_permission(operation: str):
    return Annotated[User, Depends(require_permission(f"administration.permissions.{operation}"))]


class UserPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str | None = None
    role_id: int | None = None
    is_superuser: bool = False
    status: str = "active"


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    full_name: str | None = Field(default=None, min_length=2, max_length=160)
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)
    role_id: int | None = None
    is_superuser: bool | None = None
    status: str | None = None


class RolePayload(BaseModel):
    name: str = Field(min_length=2, max_length=64)
    permission_ids: list[int] | str = Field(default_factory=list)
    status: str = "active"


class PermissionPayload(BaseModel):
    code: str = Field(min_length=3, max_length=100, pattern=r"^[a-z0-9_.-]+$")
    description: str = ""
    status: str = "active"


def permission_ids(value: list[int] | str) -> list[int]:
    if isinstance(value, list):
        return value
    return [int(item.strip()) for item in value.split(",") if item.strip()]


def serialize_user(user: User) -> dict[str, Any]:
    return {
        "id": user.id, "full_name": user.full_name, "name": user.full_name,
        "email": user.email, "is_superuser": user.is_superuser, "status": user.status,
        "roles": [{"id": role.id, "name": role.name} for role in user.roles],
        "role_id": user.roles[0].id if user.roles else None,
        "created_at": user.created_at.isoformat(), "updated_at": user.updated_at.isoformat(),
    }


def serialize_role(role: Role) -> dict[str, Any]:
    return {"id": role.id, "name": role.name, "code": role.name, "status": "active", "permission_ids": [item.id for item in role.permissions], "permissions": [{"id": item.id, "code": item.code} for item in role.permissions]}


def serialize_permission(item: Permission) -> dict[str, Any]:
    return {"id": item.id, "name": item.code, "code": item.code, "description": "", "status": "active"}


def page_data(items: list[Any], total: int, page: int, page_size: int, serializer) -> dict[str, Any]:
    return {"items": [serializer(item) for item in items], "total": total, "page": page, "pageSize": page_size, "active": total, "statistics": {"total": total, "active": total}}


def audit(db: Session, actor: User, action: str, resource: str, item_id: int, changes: dict[str, Any] | None = None) -> None:
    db.add(AuditLog(actor_id=actor.id, action=action, resource=resource, resource_id=str(item_id), changes=changes or {}))


def user_by_id(db: Session, item_id: int) -> User:
    item = db.scalar(select(User).where(User.id == item_id, User.deleted_at.is_(None)))
    if not item: raise NotFoundError("User not found")
    return item


@router.get("/all-users")
def list_users(_: admin_user("view"), db: Db, page: int = Query(1, ge=1), page_size: int = Query(10, alias="pageSize", ge=1, le=100), search: str = "", status: str = "", sort_by: str = Query("created_at", alias="sortBy"), sort_direction: str = Query("desc", alias="sortDirection")):
    conditions = [User.deleted_at.is_(None)]
    if search: conditions.append(or_(User.full_name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
    if status: conditions.append(User.status == status)
    columns = {"full_name": User.full_name, "email": User.email, "status": User.status, "created_at": User.created_at}
    order = columns.get(sort_by, User.created_at)
    if sort_direction.lower() == "desc": order = order.desc()
    total = int(db.scalar(select(func.count()).select_from(User).where(*conditions)) or 0)
    items = list(db.scalars(select(User).where(*conditions).order_by(order).offset((page - 1) * page_size).limit(page_size)).all())
    return response("Users retrieved successfully", page_data(items, total, page, page_size, serialize_user))


@router.get("/all-users/{item_id}")
def view_user(item_id: int, _: admin_user("view"), db: Db): return response("User retrieved successfully", serialize_user(user_by_id(db, item_id)))


@router.post("/all-users", status_code=201)
def create_user(payload: UserPayload, actor: admin_user("create"), db: Db):
    if db.scalar(select(User).where(User.email == payload.email)): raise AppError("Email is already registered", 409)
    if not payload.password: raise AppError("Password is required", 422)
    roles = [db.get(Role, payload.role_id)] if payload.role_id else []
    if roles and roles[0] is None: raise AppError("Role not found", 422)
    item = User(email=str(payload.email), full_name=payload.full_name, password_hash=hash_password(payload.password), is_superuser=payload.is_superuser, status=payload.status, roles=roles, created_by=actor.id, updated_by=actor.id)
    db.add(item); db.flush(); audit(db, actor, "create", "administration/all-users", item.id); db.commit(); db.refresh(item)
    return response("User created successfully", serialize_user(item))


@router.put("/all-users/{item_id}")
def update_user(item_id: int, payload: UserUpdate, actor: admin_user("update"), db: Db):
    item = user_by_id(db, item_id); values = payload.model_dump(exclude_unset=True)
    if "email" in values and db.scalar(select(User).where(User.email == values["email"], User.id != item_id)): raise AppError("Email is already registered", 409)
    if values.get("password"):
        if len(values["password"]) < 8: raise AppError("Password must contain at least 8 characters", 422)
        item.password_hash = hash_password(values.pop("password"))
    else:
        values.pop("password", None)
    if "role_id" in values:
        role_id = values.pop("role_id"); role = db.get(Role, role_id) if role_id else None
        if role_id and not role: raise AppError("Role not found", 422)
        item.roles = [role] if role else []
    for key, value in values.items(): setattr(item, key, value)
    item.updated_by = actor.id; audit(db, actor, "update", "administration/all-users", item.id, values); db.commit(); db.refresh(item)
    return response("User updated successfully", serialize_user(item))


@router.delete("/all-users/{item_id}")
def delete_user(item_id: int, actor: admin_user("delete"), db: Db):
    if item_id == actor.id: raise AppError("You cannot delete your own account", 409)
    item = user_by_id(db, item_id); item.deleted_at = datetime.now(timezone.utc); item.updated_by = actor.id; audit(db, actor, "delete", "administration/all-users", item.id); db.commit()
    return response("User deleted successfully")


def role_by_id(db: Session, item_id: int) -> Role:
    item = db.get(Role, item_id)
    if not item: raise NotFoundError("Role not found")
    return item


@router.get("/roles")
def list_roles(_: admin_role("view"), db: Db, page: int = Query(1, ge=1), page_size: int = Query(10, alias="pageSize", ge=1, le=100), search: str = ""):
    conditions = [Role.name.ilike(f"%{search}%")] if search else []
    total = int(db.scalar(select(func.count()).select_from(Role).where(*conditions)) or 0)
    items = list(db.scalars(select(Role).where(*conditions).order_by(Role.name).offset((page - 1) * page_size).limit(page_size)).all())
    return response("Roles retrieved successfully", page_data(items, total, page, page_size, serialize_role))


@router.get("/roles/{item_id}")
def view_role(item_id: int, _: admin_role("view"), db: Db): return response("Role retrieved successfully", serialize_role(role_by_id(db, item_id)))


def set_role_permissions(db: Session, item: Role, ids: list[int]) -> None:
    permissions = list(db.scalars(select(Permission).where(Permission.id.in_(ids))).all()) if ids else []
    if len(permissions) != len(set(ids)): raise AppError("One or more permissions were not found", 422)
    item.permissions = permissions


@router.post("/roles", status_code=201)
def create_role(payload: RolePayload, actor: admin_role("create"), db: Db):
    if db.scalar(select(Role).where(Role.name == payload.name)): raise AppError("Role name already exists", 409)
    item = Role(name=payload.name); set_role_permissions(db, item, permission_ids(payload.permission_ids)); db.add(item); db.flush(); audit(db, actor, "create", "administration/roles", item.id); db.commit(); db.refresh(item)
    return response("Role created successfully", serialize_role(item))


@router.put("/roles/{item_id}")
def update_role(item_id: int, payload: RolePayload, actor: admin_role("update"), db: Db):
    item = role_by_id(db, item_id); item.name = payload.name; set_role_permissions(db, item, permission_ids(payload.permission_ids)); audit(db, actor, "update", "administration/roles", item.id); db.commit(); db.refresh(item)
    return response("Role updated successfully", serialize_role(item))


@router.delete("/roles/{item_id}")
def delete_role(item_id: int, actor: admin_role("delete"), db: Db):
    item = role_by_id(db, item_id)
    if db.scalar(select(func.count()).select_from(User).where(User.deleted_at.is_(None), User.roles.any(Role.id == item_id))): raise AppError("Role is assigned to users", 409)
    audit(db, actor, "delete", "administration/roles", item.id); db.delete(item); db.commit(); return response("Role deleted successfully")


@router.get("/permissions")
def list_permissions(_: admin_permission("view"), db: Db, page: int = Query(1, ge=1), page_size: int = Query(10, alias="pageSize", ge=1, le=100), search: str = ""):
    conditions = [Permission.code.ilike(f"%{search}%")] if search else []
    total = int(db.scalar(select(func.count()).select_from(Permission).where(*conditions)) or 0)
    items = list(db.scalars(select(Permission).where(*conditions).order_by(Permission.code).offset((page - 1) * page_size).limit(page_size)).all())
    return response("Permissions retrieved successfully", page_data(items, total, page, page_size, serialize_permission))


@router.get("/permissions/{item_id}")
def view_permission(item_id: int, _: admin_permission("view"), db: Db):
    item = db.get(Permission, item_id)
    if not item: raise NotFoundError("Permission not found")
    return response("Permission retrieved successfully", serialize_permission(item))


@router.post("/permissions", status_code=201)
def create_permission(payload: PermissionPayload, actor: admin_permission("create"), db: Db):
    if db.scalar(select(Permission).where(Permission.code == payload.code)): raise AppError("Permission code already exists", 409)
    item = Permission(code=payload.code); db.add(item); db.flush(); audit(db, actor, "create", "administration/permissions", item.id); db.commit(); return response("Permission created successfully", serialize_permission(item))


@router.put("/permissions/{item_id}")
def update_permission(item_id: int, payload: PermissionPayload, actor: admin_permission("update"), db: Db):
    item = db.get(Permission, item_id)
    if not item: raise NotFoundError("Permission not found")
    item.code = payload.code; audit(db, actor, "update", "administration/permissions", item.id); db.commit(); return response("Permission updated successfully", serialize_permission(item))


@router.delete("/permissions/{item_id}")
def delete_permission(item_id: int, actor: admin_permission("delete"), db: Db):
    item = db.get(Permission, item_id)
    if not item: raise NotFoundError("Permission not found")
    if db.scalar(select(func.count()).select_from(Role).where(Role.permissions.any(Permission.id == item_id))): raise AppError("Permission is assigned to roles", 409)
    audit(db, actor, "delete", "administration/permissions", item.id); db.delete(item); db.commit(); return response("Permission deleted successfully")
