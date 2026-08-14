from typing import Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.models.audit import AuditLog


class AuditService:
    def __init__(self, session: Session):
        self.session = session

    def record(self, *, actor_id: int | None, action: str, resource: str, resource_id: int, changes: dict[str, Any] | None = None) -> None:
        # Pydantic's Python-mode dumps retain values such as Decimal, date, and
        # UUID. PostgreSQL's JSON adapter cannot serialize those objects
        # directly, so convert audit payloads to JSON-compatible primitives at
        # the boundary where they enter the JSON column.
        encoded_changes = jsonable_encoder(changes or {})
        self.session.add(AuditLog(actor_id=actor_id, action=action, resource=resource, resource_id=str(resource_id), changes=encoded_changes))
