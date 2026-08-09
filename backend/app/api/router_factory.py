from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.configuration.resource import Operation, ResourceConfig
from app.database.session import get_db
from app.models.identity import User
from app.permissions.dependencies import require_permission
from app.schemas.common import response
from app.services.crud import CRUDService


def _serialized(config: ResourceConfig, obj) -> dict[str, Any]:
    data = config.response_schema.model_validate(obj).model_dump(mode="json")
    if isinstance(data.get("details"), dict):
        data.update(data["details"])
    return data


def generate_crud_router(config: ResourceConfig) -> APIRouter:
    router = APIRouter(prefix=config.route_prefix, tags=[config.name])

    def secured(operation: Operation):
        return Annotated[User, Depends(require_permission(config.permission_for(operation)))]

    if "list" in config.allowed_operations:
        @router.get("")
        def list_resources(request: Request, user: secured("list"), db: Annotated[Session, Depends(get_db)], page: int = Query(1, ge=1), page_size: int = Query(10, alias="pageSize", ge=1, le=100), search: str | None = None, q: str | None = None, sort_by: str = Query("created_at", alias="sortBy"), sort_direction: str = Query("desc", alias="sortDirection")):
            del user
            filters = {field: request.query_params.get(field) for field in config.filterable_fields}
            rows, total = CRUDService(db, config).list(page=page, page_size=page_size, search=search or q, filters=filters, sort_by=sort_by, sort_direction=sort_direction)
            data = {"items": [_serialized(config, row) for row in rows], "total": total, "page": page, "pageSize": page_size}
            return response(f"{config.name.replace('-', ' ').title()} retrieved successfully", data)

    if "view" in config.allowed_operations:
        @router.get("/{item_id}")
        def view_resource(item_id: int, user: secured("view"), db: Annotated[Session, Depends(get_db)]):
            del user
            obj = CRUDService(db, config).get(item_id)
            return response(f"{config.name.replace('-', ' ').title()} retrieved successfully", _serialized(config, obj))

    if "create" in config.allowed_operations:
        @router.post("", status_code=status.HTTP_201_CREATED)
        def create_resource(payload: config.create_schema, user: secured("create"), db: Annotated[Session, Depends(get_db)]):  # type: ignore[valid-type]
            obj = CRUDService(db, config).create(payload, user.id)
            return response(f"{config.name.replace('-', ' ').title()} created successfully", _serialized(config, obj))

    if "update" in config.allowed_operations:
        @router.put("/{item_id}")
        def update_resource(item_id: int, payload: config.update_schema, user: secured("update"), db: Annotated[Session, Depends(get_db)]):  # type: ignore[valid-type]
            obj = CRUDService(db, config).update(item_id, payload, user.id)
            return response(f"{config.name.replace('-', ' ').title()} updated successfully", _serialized(config, obj))

    if "delete" in config.allowed_operations:
        @router.delete("/{item_id}")
        def delete_resource(item_id: int, user: secured("delete"), db: Annotated[Session, Depends(get_db)]):
            CRUDService(db, config).delete(item_id, user.id)
            return response(f"{config.name.replace('-', ' ').title()} deleted successfully")

    return router
