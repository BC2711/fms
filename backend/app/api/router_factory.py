from typing import Annotated, Any

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.configuration.resource import Operation, ResourceConfig
from app.database.session import get_db
from app.models.resources import User
from app.models.resources import Account, GenericRecord, Station, StationDocument, StationGroup, StationInspection, StationPerformance, StationPriceBoard, StationType
from app.permissions.dependencies import require_permission
from app.schemas.common import response
from app.services.crud import CRUDService


def _lookup(db: Session, model, item_id: int | None):
    if not item_id: return None
    item = db.get(model, item_id)
    return {"id": item.id, "name": getattr(item, "name", getattr(item, "document_name", str(item.id))), "code": getattr(item, "code", "")} if item else None


def _generic_lookup(db: Session, resource: str, item_id: int | None):
    if not item_id: return None
    item = db.scalar(select(GenericRecord).where(GenericRecord.resource_path == resource, GenericRecord.id == item_id, GenericRecord.deleted_at.is_(None)))
    return {"id": item.id, "name": item.name, "code": item.code} if item else None


def _serialized(config: ResourceConfig, obj, db: Session) -> dict[str, Any]:
    data = config.response_schema.model_validate(obj).model_dump(mode="json")
    if isinstance(data.get("details"), dict):
        data.update(data["details"])
    if isinstance(obj, Account):
        balance = data.get("balance", 0) or 0; credit_limit = data.get("credit_limit", 0) or 0
        data.setdefault("account_balance", balance); data["available_credit"] = max(float(credit_limit) - float(balance), 0)
        data.setdefault("total_vehicles", 0); data.setdefault("total_cards", 0); data.setdefault("total_stations", 0); data.setdefault("total_managed_accounts", 0)
        data.setdefault("vehicle_count", data["total_vehicles"]); data.setdefault("cards_count", data["total_cards"]); data.setdefault("driver_count", 0)
    if isinstance(obj, Station):
        data["station_type"] = _lookup(db, StationType, obj.station_type_id)
        data["station_group"] = _lookup(db, StationGroup, obj.station_group_id); data["oil_marketing_company"] = _lookup(db, Account, obj.oil_marketing_company_id)
        data["province"] = _generic_lookup(db, "administration/provinces", obj.province_id); data["district"] = _generic_lookup(db, "administration/districts", obj.district_id)
        data.setdefault("total_tanks", 0); data.setdefault("total_pumps", 0); data.setdefault("total_attendants", 0)
    if isinstance(obj, StationGroup):
        data["oil_marketing_company"] = _lookup(db, Account, obj.oil_marketing_company_id); data.setdefault("total_stations", 0)
    if isinstance(obj, (StationPriceBoard, StationInspection, StationDocument)):
        data["station"] = _lookup(db, Station, obj.station_id)
    if isinstance(obj, StationPriceBoard):
        data["product"] = _generic_lookup(db, "fuel-operations/fuel-products", obj.product_id); data.setdefault("effective_at", data.get("effective_date"))
    if isinstance(obj, StationPerformance):
        station = _lookup(db, Station, obj.station_id); data.setdefault("station_name", station["name"] if station else ""); data.setdefault("total_sales", data.get("revenue", 0)); data.setdefault("total_volume", data.get("sales_volume", 0)); data.setdefault("total_transactions", data.get("transactions", 0)); data.setdefault("stock_variance", 0); data.setdefault("uptime_percentage", 0); data.setdefault("station-performance_score", 0); data.setdefault("rating", "unrated")
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
            statistics = CRUDService(db, config).repository.statistics(search or q, filters)
            data = {"items": [_serialized(config, row, db) for row in rows], "total": total, "page": page, "pageSize": page_size, **statistics, "statistics": statistics}
            return response(f"{config.name.replace('-', ' ').title()} retrieved successfully", data)

    if "view" in config.allowed_operations:
        @router.get("/{item_id}")
        def view_resource(item_id: int, user: secured("view"), db: Annotated[Session, Depends(get_db)]):
            del user
            obj = CRUDService(db, config).get(item_id)
            return response(f"{config.name.replace('-', ' ').title()} retrieved successfully", _serialized(config, obj, db))

    if "create" in config.allowed_operations:
        @router.post("", status_code=status.HTTP_201_CREATED)
        def create_resource(payload: config.create_schema, user: secured("create"), db: Annotated[Session, Depends(get_db)]):  # type: ignore[valid-type]
            obj = CRUDService(db, config).create(payload, user.id)
            return response(f"{config.name.replace('-', ' ').title()} created successfully", _serialized(config, obj, db))

    if "update" in config.allowed_operations:
        @router.put("/{item_id}")
        def update_resource(item_id: int, payload: config.update_schema, user: secured("update"), db: Annotated[Session, Depends(get_db)]):  # type: ignore[valid-type]
            obj = CRUDService(db, config).update(item_id, payload, user.id)
            return response(f"{config.name.replace('-', ' ').title()} updated successfully", _serialized(config, obj, db))

    if "delete" in config.allowed_operations:
        @router.delete("/{item_id}")
        def delete_resource(item_id: int, user: secured("delete"), db: Annotated[Session, Depends(get_db)]):
            CRUDService(db, config).delete(item_id, user.id)
            return response(f"{config.name.replace('-', ' ').title()} deleted successfully")

    return router
