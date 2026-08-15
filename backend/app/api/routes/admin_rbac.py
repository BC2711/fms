from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError, NotFoundError
from app.database.session import get_db
from app.models.resources import Menu, Permission, Role, User, UserType
from app.permissions.dependencies import require_permission
from app.schemas.common import response
from app.services.audit import AuditService

router = APIRouter(prefix="/administration", tags=["access control administration"])
Db = Annotated[Session, Depends(get_db)]
def access_admin(operation: str):
    return Annotated[User, Depends(require_permission(f"administration.menu-permissions.{operation}"))]


def audit(db: Session, actor: User, action: str, resource: str, item_id: int, changes: dict[str, Any] | None = None) -> None:
    AuditService(db).record(actor_id=actor.id, action=action, resource=resource, resource_id=item_id, changes=changes)


class MenuPayload(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    code: str = Field(min_length=1, max_length=50, pattern=r"^[a-z0-9-]+$")
    icon: str = ""
    route: str = ""
    component: str = ""
    parent_id: int | None = None
    permission_id: int | None = None
    sort_order: int = 0
    is_active: bool = True
    description: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)


class AssignmentPayload(BaseModel):
    menu_ids: list[int] = Field(default_factory=list)
    permission_ids: list[int] = Field(default_factory=list)


def menu_data(item: Menu) -> dict[str, Any]:
    return {"id": item.id, "name": item.name, "code": item.code, "icon": item.icon, "route": item.route, "component": item.component, "parent_id": item.parent_id, "permission_id": item.permission_id, "sort_order": item.sort_order, "is_active": item.is_active, "status": item.status, "description": item.description, "metadata": item.metadata_}


def get_menu(db: Session, item_id: int) -> Menu:
    item = db.scalar(select(Menu).where(Menu.id == item_id, Menu.deleted_at.is_(None)))
    if item is None:
        raise NotFoundError("Menu not found")
    return item


def validate_refs(db: Session, payload: MenuPayload, item_id: int | None = None) -> None:
    if payload.parent_id == item_id:
        raise AppError("A menu cannot be its own parent", 422)
    if payload.parent_id and db.get(Menu, payload.parent_id) is None:
        raise AppError("Parent menu not found", 422)
    if payload.permission_id and db.get(Permission, payload.permission_id) is None:
        raise AppError("Permission not found", 422)


@router.get("/menus")
def list_menus(_: access_admin("view"), db: Db):
    items = db.scalars(select(Menu).where(Menu.deleted_at.is_(None)).order_by(Menu.sort_order, Menu.name)).all()
    return response("Menus retrieved successfully", [menu_data(item) for item in items])


@router.post("/menus", status_code=201)
def create_menu(payload: MenuPayload, actor: access_admin("create"), db: Db):
    validate_refs(db, payload)
    if db.scalar(select(Menu).where(Menu.code == payload.code)):
        raise AppError("Menu code already exists", 409)
    values = payload.model_dump(); values["metadata_"] = values.pop("metadata")
    item = Menu(**values, created_by=actor.id, updated_by=actor.id)
    db.add(item); db.flush(); audit(db, actor, "create", "administration/menus", item.id); db.commit()
    return response("Menu created successfully", menu_data(item))


@router.put("/menus/{item_id}")
def update_menu(item_id: int, payload: MenuPayload, actor: access_admin("update"), db: Db):
    item = get_menu(db, item_id); validate_refs(db, payload, item_id)
    values = payload.model_dump(); values["metadata_"] = values.pop("metadata")
    for key, value in values.items(): setattr(item, key, value)
    item.updated_by = actor.id; audit(db, actor, "update", "administration/menus", item.id, values); db.commit()
    return response("Menu updated successfully", menu_data(item))


@router.delete("/menus/{item_id}")
def delete_menu(item_id: int, actor: access_admin("delete"), db: Db):
    item = get_menu(db, item_id)
    if item.children:
        raise AppError("Move or remove child menus first", 409)
    item.deleted_at = datetime.now(timezone.utc); item.is_active = False; item.updated_by = actor.id
    audit(db, actor, "delete", "administration/menus", item.id); db.commit()
    return response("Menu deleted successfully")


def assignments(db: Session, model: type[Role] | type[UserType], item_id: int, payload: AssignmentPayload):
    item = db.get(model, item_id)
    if item is None:
        raise NotFoundError(f"{model.__name__} not found")
    menus = list(db.scalars(select(Menu).where(Menu.id.in_(payload.menu_ids), Menu.deleted_at.is_(None))).all()) if payload.menu_ids else []
    permissions = list(db.scalars(select(Permission).where(Permission.id.in_(payload.permission_ids), Permission.deleted_at.is_(None))).all()) if payload.permission_ids else []
    if len(menus) != len(set(payload.menu_ids)) or len(permissions) != len(set(payload.permission_ids)):
        raise AppError("One or more assignment targets were not found", 422)
    item.menus = menus; item.permissions = permissions
    return item


@router.put("/roles/{item_id}/access")
def assign_role_access(item_id: int, payload: AssignmentPayload, actor: access_admin("update"), db: Db):
    item = assignments(db, Role, item_id, payload); audit(db, actor, "assign", "administration/roles/access", item.id, payload.model_dump()); db.commit()
    return response("Role access updated successfully", payload.model_dump())


@router.put("/user-types/{item_id}/access")
def assign_user_type_access(item_id: int, payload: AssignmentPayload, actor: access_admin("update"), db: Db):
    item = assignments(db, UserType, item_id, payload); audit(db, actor, "assign", "administration/user-types/access", item.id, payload.model_dump()); db.commit()
    return response("User type access updated successfully", payload.model_dump())
