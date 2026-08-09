from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ResourceResponse(ORMModel):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    created_by: int | None = None
    updated_by: int | None = None
    details: dict[str, Any] = {}


class PageData(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    pageSize: int


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: T | None = None


def response(message: str, data: Any = None, *, success: bool = True) -> dict[str, Any]:
    return {"success": success, "