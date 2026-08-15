from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.resources import User
from app.models.resources import Account, GenericRecord, Station, TestItem
from app.permissions.dependencies import get_current_user
from app.schemas.common import response

router = APIRouter(tags=["system"])


@router.get("/health")
def health():
    return response("Service is healthy", {"status": "ok"})


@router.get("/dashboard")
def dashboard(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
):
    del user

    def count(model, *conditions) -> int:
        return int(db.scalar(select(func.count()).select_from(model).where(*conditions)) or 0)

    return response(
        "Dashboard retrieved successfully",
        {
            "summary": {
                "items": count(TestItem, TestItem.deleted_at.is_(None)),
                "accounts": count(Account, Account.deleted_at.is_(None)),
                "stations": count(Station, Station.deleted_at.is_(None)),
                "generated_records": count(GenericRecord, GenericRecord.deleted_at.is_(None)),
            }
        },
    )
