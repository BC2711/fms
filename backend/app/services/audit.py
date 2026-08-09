from typing import Any

from sqlalchemy.orm import Session

from app.models.audit import AuditLog


class AuditService:
    def __init__(self, session: Session):
        self.session = session

    def record(self, *, actor_id: int | None, action: str, resource: str, resource_id: int, changes: dict[str, Any] | None = None) -> None:
        self.session.add(AuditLog(actor_id=actor_id, action=action, resource=resource, resource_id=str(resource_id), changes=changes or {}))
