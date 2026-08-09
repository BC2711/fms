from datetime import datetime, timezone
from typing import Any

from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.configuration.resource import ResourceConfig


class BaseRepository:
    def __init__(self, session: Session, config: ResourceConfig):
        self.session = session
        self.config = config
        self.model = config.model

    def _conditions(self, search: str | None, filters: dict[str, Any]):
        conditions = [self.model.deleted_at.is_(None)]
        conditions.extend(getattr(self.model, key) == value for key, value in self.config.fixed_values.items())
        if search and self.config.searchable_fields:
            conditions.append(or_(*(getattr(self.model, field).ilike(f"%{search}%") for field in self.config.searchable_fields)))
        for field, value in filters.items():
            if field in self.config.filterable_fields and value not in (None, ""):
                conditions.append(getattr(self.model, field) == value)
        return conditions

    def list(self, *, page: int, page_size: int, search: str | None, filters: dict[str, Any], sort_by: str, sort_direction: str):
        conditions = self._conditions(search, filters)
        total = self.session.scalar(select(func.count()).select_from(self.model).where(*conditions)) or 0
        sort_field = sort_by if sort_by in self.config.sortable_fields else self.config.sortable_fields[0]
        ordering = desc if sort_direction.lower() == "desc" else asc
        statement = select(self.model).where(*conditions).order_by(ordering(getattr(self.model, sort_field))).offset((page - 1) * page_size).limit(page_size)
        return list(self.session.scalars(statement).all()), total

    def get(self, item_id: int):
        return self.session.scalar(select(self.model).where(self.model.id == item_id, *self._conditions(None, {})))

    def status_counts(self, search: str | None, filters: dict[str, Any]) -> dict[str, int]:
        rows = self.session.execute(select(self.model.status, func.count()).where(*self._conditions(search, filters)).group_by(self.model.status)).all()
        counts = {str(status): count for status, count in rows}
        return {state: counts.get(state, 0) for state in ("active", "inactive", "pending", "suspended", "draft", "verified", "rejected")}

    def create(self, values: dict[str, Any], actor_id: int | None):
        values.update(self.config.fixed_values)
        obj = self.model(**values, created_by=actor_id, updated_by=actor_id)
        self.session.add(obj)
        self.session.flush()
        return obj

    def update(self, obj, values: dict[str, Any], actor_id: int | None):
        for key, value in values.items():
            setattr(obj, key, value)
        obj.updated_by = actor_id
        self.session.flush()
        return obj

    def soft_delete(self, obj, actor_id: int | None):
        obj.deleted_at = datetime.now(timezone.utc)
        obj.updated_by = actor_id
        self.session.flush()
