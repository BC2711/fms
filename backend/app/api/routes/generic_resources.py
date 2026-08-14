from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError, NotFoundError
from app.database.session import get_db
from app.models.audit import AuditLog
from app.models.identity import User
from app.models.resources import GenericRecord
from app.permissions.dependencies import get_current_user
from app.schemas.common import response

router = APIRouter(tags=["generated resources"])
Db = Annotated[Session, Depends(get_db)]
AuthenticatedUser = Annotated[User, Depends(get_current_user)]

LOCATION_PARENTS = {
    "administration/provinces": ("country_id", "administration/countries"),
    "administration/districts": ("province_id", "administration/provinces"),
    "administration/cities-and-towns": ("district_id", "administration/districts"),
    "administration/station-regions": ("district_id", "administration/districts"),
}


def authorize(user: User, resource: str, operation: str) -> None:
    if user.is_superuser:
        return
    if resource.startswith("administration/"):
        code = f"administration.{resource.split('/')[-1]}.{operation}"
    elif resource.startswith("settings-"):
        code = f"settings.{operation}"
    else:
        return
    if code not in user.permission_codes:
        raise AppError(f"Missing permission: {code}", 403)


def split_path(resource_path: str) -> tuple[str, int | None]:
    parts = resource_path.strip("/").split("/")
    if parts and parts[-1].isdigit():
        return "/".join(parts[:-1]), int(parts[-1])
    return "/".join(parts), None


def serialized(record: GenericRecord, db: Session) -> dict[str, Any]:
    data = {"id": record.id, "name": record.name, "code": record.code, "description": record.description, "status": record.status, "country_id": record.country_id, "province_id": record.province_id, "district_id": record.district_id, "created_at": record.created_at.isoformat(), "updated_at": record.updated_at.isoformat(), **(record.data or {})}
    for relation, parent_id in (("country", record.country_id), ("province", record.province_id), ("district", record.district_id)):
        parent = db.get(GenericRecord, parent_id) if parent_id else None
        data[relation] = {"id": parent.id, "name": parent.name, "code": parent.code} if parent and parent.deleted_at is None else None
    return data


def get_record(db: Session, resource: str, item_id: int) -> GenericRecord:
    record = db.scalar(select(GenericRecord).where(GenericRecord.resource_path == resource, GenericRecord.id == item_id, GenericRecord.deleted_at.is_(None)))
    if record is None:
        raise NotFoundError("Record not found")
    return record


def audit(db: Session, user: User, action: str, resource: str, record: GenericRecord, changes: dict[str, Any] | None = None):
    db.add(AuditLog(actor_id=user.id, action=action, resource=resource, resource_id=str(record.id), changes=changes or {}))


def location_parent(db: Session, resource: str, payload: dict[str, Any], *, required: bool) -> dict[str, int]:
    relation = LOCATION_PARENTS.get(resource)
    if relation is None:
        return {}
    field, parent_resource = relation
    raw_id = payload.pop(field, None)
    if raw_id in (None, ""):
        if required:
            raise AppError(f"{field} is required", 422)
        return {}
    try:
        parent_id = int(raw_id)
    except (TypeError, ValueError) as exc:
        raise AppError(f"{field} must be an integer", 422) from exc
    parent = db.scalar(select(GenericRecord).where(GenericRecord.id == parent_id, GenericRecord.resource_path == parent_resource, GenericRecord.deleted_at.is_(None)))
    if parent is None:
        raise AppError(f"Invalid {field}: matching parent record was not found", 422)
    return {field: parent_id}


@router.get("/{resource_path:path}")
def list_or_view(resource_path: str, request: Request, user: AuthenticatedUser, db: Db, page: int = Query(1, ge=1), page_size: int = Query(10, alias="pageSize", ge=1, le=100), search: str = "", q: str = "", sort_by: str = Query("created_at", alias="sortBy"), sort_direction: str = Query("desc", alias="sortDirection")):
    resource, item_id = split_path(resource_path)
    authorize(user, resource, "view")
    if item_id is not None:
        return response("Record retrieved successfully", serialized(get_record(db, resource, item_id), db))
    records = list(db.scalars(select(GenericRecord).where(GenericRecord.resource_path == resource, GenericRecord.deleted_at.is_(None))).all())
    reserved = {"page", "pageSize", "search", "q", "sortBy", "sortDirection"}
    filters = {key: value for key, value in request.query_params.items() if key not in reserved and value != ""}
    term = (search or q).casefold()
    if term:
        records = [record for record in records if term in record.name.casefold() or term in record.code.casefold() or term in record.description.casefold()]
    records = [record for record in records if all(str(getattr(record, key, (record.data or {}).get(key, ""))) == value for key, value in filters.items())]
    allowed_sort = {"id", "name", "code", "status", "created_at", "updated_at"}
    key = sort_by if sort_by in allowed_sort else "created_at"
    records.sort(key=lambda record: str(getattr(record, key, "")), reverse=sort_direction.lower() == "desc")
    total = len(records)
    items = records[(page - 1) * page_size:page * page_size]
    counts = {state: sum(record.status == state for record in records) for state in ("active", "inactive", "pending", "suspended", "draft")}
    statistics = {"total": total, **counts}
    return response("Records retrieved successfully", {"items": [serialized(record, db) for record in items], "total": total, "page": page, "pageSize": page_size, **counts, "statistics": statistics})


@router.post("/{resource_path:path}", status_code=201)
async def create_record(resource_path: str, request: Request, user: AuthenticatedUser, db: Db):
    resource, item_id = split_path(resource_path)
    authorize(user, resource, "create")
    if item_id is not None:
        raise AppError("Create requests must target a collection", 405)
    payload = await request.json()
    known = {key: payload.pop(key) for key in list(payload) if key in {"name", "code", "description", "status"}}
    parent = location_parent(db, resource, payload, required=resource in LOCATION_PARENTS)
    record = GenericRecord(resource_path=resource, name=str(known.get("name") or known.get("code") or "Untitled"), code=str(known.get("code") or ""), description=str(known.get("description") or ""), status=str(known.get("status") or "active"), data=payload, created_by=user.id, updated_by=user.id, **parent)
    db.add(record); db.flush(); audit(db, user, "create", resource, record, {**known, **parent, **payload}); db.commit(); db.refresh(record)
    return response("Record created successfully", serialized(record, db))


@router.put("/{resource_path:path}")
async def update_record(resource_path: str, request: Request, user: AuthenticatedUser, db: Db):
    resource, item_id = split_path(resource_path)
    authorize(user, resource, "update")
    if item_id is None:
        raise AppError("Update requests require a record id", 405)
    record = get_record(db, resource, item_id)
    payload = await request.json()
    parent = location_parent(db, resource, payload, required=False)
    for key in ("name", "code", "description", "status"):
        if key in payload: setattr(record, key, str(payload.pop(key)))
    for key, value in parent.items():
        setattr(record, key, value)
    record.data = {**(record.data or {}), **payload}; record.updated_by = user.id
    audit(db, user, "update", resource, record, {**parent, **payload}); db.commit(); db.refresh(record)
    return response("Record updated successfully", serialized(record, db))


@router.delete("/{resource_path:path}")
def delete_record(resource_path: str, user: AuthenticatedUser, db: Db):
    resource, item_id = split_path(resource_path)
    authorize(user, resource, "delete")
    if item_id is None:
        raise AppError("Delete requests require a record id", 405)
    record = get_record(db, resource, item_id); record.deleted_at = datetime.now(timezone.utc); record.updated_by = user.id
    audit(db, user, "delete", resource, record); db.commit()
    return response("Record deleted successfully")
