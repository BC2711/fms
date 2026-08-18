from collections import Counter
from datetime import datetime, timezone
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

    records = db.execute(
        select(GenericRecord.resource_path, GenericRecord.status, GenericRecord.created_at)
        .where(GenericRecord.deleted_at.is_(None))
    ).all()
    account_types = db.scalars(
        select(Account.account_type).where(Account.deleted_at.is_(None))
    ).all()
    module_counts = Counter(path.split("/", 1)[0] for path, _, _ in records)
    status_counts = Counter(status or "unknown" for _, status, _ in records)
    account_counts = Counter(account_types)
    now = datetime.now(timezone.utc)
    months = []
    for offset in range(5, -1, -1):
        month_index = now.year * 12 + now.month - 1 - offset
        year, month_zero = divmod(month_index, 12)
        months.append((year, month_zero + 1))
    monthly_counts = Counter((created_at.year, created_at.month) for _, _, created_at in records)

    return response(
        "Dashboard retrieved successfully",
        {
            "summary": {
                "items": count(TestItem, TestItem.deleted_at.is_(None)),
                "accounts": count(Account, Account.deleted_at.is_(None)),
                "stations": count(Station, Station.deleted_at.is_(None)),
                "generated_records": count(GenericRecord, GenericRecord.deleted_at.is_(None)),
            },
            "charts": {
                "monthly_activity": [
                    {"label": datetime(year, month, 1).strftime("%b"), "value": monthly_counts[(year, month)]}
                    for year, month in months
                ],
                "module_activity": [
                    {"label": name.replace("-", " ").title(), "value": value}
                    for name, value in module_counts.most_common(7)
                ],
                "status_distribution": [
                    {"label": name.replace("_", " ").title(), "value": value}
                    for name, value in status_counts.most_common()
                ],
                "account_mix": [
                    {"label": name.replace("_", " ").title(), "value": value}
                    for name, value in account_counts.most_common()
                ],
            },
        },
    )
