from dataclasses import dataclass, field
from typing import Literal

from pydantic import BaseModel
from sqlalchemy.orm import DeclarativeBase

Operation = Literal["list", "view", "create", "update", "delete"]


@dataclass(frozen=True, slots=True)
class ResourceConfig:
    name: str
    model: type[DeclarativeBase]
    create_schema: type[BaseModel]
    update_schema: type[BaseModel]
    response_schema: type[BaseModel]
    route_prefix: str
    permissions: dict[Operation, str] = field(default_factory=dict)
    searchable_fields: tuple[str, ...] = ()
    filterable_fields: tuple[str, ...] = ()
    sortable_fields: tuple[str, ...] = ("created_at",)
    allowed_operations: frozenset[Operation] = frozenset({"list", "view", "create", "update", "delete"})
    fixed_values: dict[str, object] = field(default_factory=dict)

    def permission_for(self, operation: Operation) -> str:
        return self.permissions.get(operation, f"{self.name}.{'view' if operation == 'list' else operation}")
