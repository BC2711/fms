from typing import Any
from uuid import uuid4

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.configuration.resource import ResourceConfig
from app.core.errors import AppError, NotFoundError
from app.models.resources import Account
from app.repositories.base import BaseRepository
from app.services.audit import AuditService


class CRUDService:
    def __init__(self, session: Session, config: ResourceConfig):
        self.session = session
        self.config = config
        self.repository = BaseRepository(session, config)
        self.audit = AuditService(session)

    def list(self, **query):
        return self.repository.list(**query)

    def get(self, item_id: int):
        obj = self.repository.get(item_id)
        if obj is None:
            raise NotFoundError(f"{self.config.name.replace('-', ' ').title()} not found")
        return obj

    def create(self, payload: BaseModel, actor_id: int | None):
        values = payload.model_dump(exclude_unset=True)
        values = self._normalize_values(values)
        if self.config.model is Account and self.session.scalar(select(Account.id).where(Account.account_number == values.get("account_number"))):
            raise AppError("Account number already exists", 409)
        obj = self.repository.create(values, actor_id)
        self.audit.record(actor_id=actor_id, action="create", resource=self.config.name, resource_id=obj.id, changes=values)
        self.session.commit()
        self.session.refresh(obj)
        return obj

    def update(self, item_id: int, payload: BaseModel, actor_id: int | None):
        obj = self.get(item_id)
        values = payload.model_dump(exclude_unset=True, exclude_none=True)
        values = self._normalize_values(values, obj)
        if self.config.model is Account and values.get("account_number") and self.session.scalar(select(Account.id).where(Account.account_number == values["account_number"], Account.id != item_id)):
            raise AppError("Account number already exists", 409)
        self.repository.update(obj, values, actor_id)
        self.audit.record(actor_id=actor_id, action="update", resource=self.config.name, resource_id=obj.id, changes=values)
        self.session.commit()
        self.session.refresh(obj)
        return obj

    def _normalize_values(self, values: dict[str, Any], obj=None) -> dict[str, Any]:
        if "details" not in self.config.model.__table__.columns:
            return values
        columns = set(self.config.model.__table__.columns.keys())
        details = dict(getattr(obj, "details", {}) or {})
        details.update({key: value for key, value in values.items() if key not in columns})
        normalized = {key: value for key, value in values.items() if key in columns}
        normalized["details"] = details
        if obj is None and self.config.model is Account:
            normalized["account_number"] = normalized.get("account_number") or f"FMS-{str(normalized.get('account_type') or self.config.fixed_values.get('account_type') or 'ACCOUNT').upper()[:6]}-{uuid4().hex[:8].upper()}"
            normalized["name"] = normalized.get("name") or " ".join(filter(None, (details.get("first_name"), details.get("middle_name"), details.get("last_name")))) or normalized["account_number"]
            normalized["email"] = str(normalized.get("email") or "")
        return normalized

    def delete(self, item_id: int, actor_id: int | None):
        obj = self.get(item_id)
        self.repository.soft_delete(obj, actor_id)
        self.audit.record(actor_id=actor_id, action="delete", resource=self.config.name, resource_id=obj.id)
        self.session.commit()
