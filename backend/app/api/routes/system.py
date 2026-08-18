from collections import Counter
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.resources import User
from app.models.resources import Account, GenericRecord, Station, TestItem
from app.permissions.dependencies import get_current_user
from app.schemas.common import response

router = APIRouter(tags=["system"])

DASHBOARD_SCOPES: dict[str, tuple[str, ...] | None] = {
    "overview": None,
    "dashboard-executive-dashboard": None,
    "dashboard-operations-dashboard": ("fuel-operations", "requests-orders", "logistics"),
    "dashboard-sales-dashboard": ("cards-pos", "finance-transactions", "requests-orders"),
    "dashboard-inventory-dashboard": ("fuel-operations", "logistics-depots"),
    "dashboard-finance-dashboard": ("finance",),
    "dashboard-fleet-dashboard": ("fleet",),
    "dashboard-station-performance": ("stations",),
    "logistics-logistics-dashboard": ("logistics",),
    "cards-pos-fuel-cards-card-dashboard": ("cards-pos-fuel-cards",),
    "cards-pos-devices-pos-dashboard": ("cards-pos-devices",),
    "finance-transactions-transaction-dashboard": ("finance-transactions",),
    "finance-funding-funding-dashboard": ("finance-funding",),
    "compliance-compliance-dashboard": ("compliance",),
    "reports-reports-dashboard": ("reports",),
    "reports-kpi-dashboard": None,
    "my-account-my-dashboard": ("my-account",),
}
DASHBOARD_ALIASES = {
    "executive-dashboard": "dashboard-executive-dashboard",
    "operations-dashboard": "dashboard-operations-dashboard",
    "sales-dashboard": "dashboard-sales-dashboard",
    "inventory-dashboard": "dashboard-inventory-dashboard",
    "finance-dashboard": "dashboard-finance-dashboard",
    "fleet-dashboard": "dashboard-fleet-dashboard",
    "station-performance": "dashboard-station-performance",
    "compliance-dashboard": "compliance-compliance-dashboard",
}


@router.get("/health")
def health():
    return response("Service is healthy", {"status": "ok"})


def dashboard_data(db: Session, user: User, dashboard_key: str) -> dict:
    def count(model, *conditions) -> int:
        return int(db.scalar(select(func.count()).select_from(model).where(*conditions)) or 0)

    scope = DASHBOARD_SCOPES[dashboard_key]
    query = select(GenericRecord.resource_path, GenericRecord.status, GenericRecord.created_at).where(GenericRecord.deleted_at.is_(None))
    if scope:
        query = query.where(or_(*(GenericRecord.resource_path.startswith(prefix) for prefix in scope)))
    if dashboard_key == "my-account-my-dashboard":
        query = query.where(GenericRecord.created_by == user.id)
    records = db.execute(query).all()
    account_types = db.scalars(
        select(Account.account_type).where(Account.deleted_at.is_(None))
    ).all()
    module_counts = Counter(path.split("/", 1)[0] for path, _, _ in records)
    category_counts = Counter(path.split("/", 1)[-1] for path, _, _ in records)
    status_counts = Counter(status or "unknown" for _, status, _ in records)
    account_counts = Counter(account_types)
    now = datetime.now(timezone.utc)
    months = []
    for offset in range(5, -1, -1):
        month_index = now.year * 12 + now.month - 1 - offset
        year, month_zero = divmod(month_index, 12)
        months.append((year, month_zero + 1))
    monthly_counts = Counter((created_at.year, created_at.month) for _, _, created_at in records)

    scoped_total = len(records)
    return {
            "summary": {
                "items": count(TestItem, TestItem.deleted_at.is_(None)),
                "accounts": count(Account, Account.deleted_at.is_(None)),
                "stations": count(Station, Station.deleted_at.is_(None)),
                "generated_records": scoped_total,
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
                "category_mix": [
                    {"label": name.replace("-", " ").title(), "value": value}
                    for name, value in category_counts.most_common(7)
                ],
            },
        }


@router.get("/dashboard")
def dashboard(db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(get_current_user)]):
    return response("Dashboard retrieved successfully", dashboard_data(db, user, "overview"))


@router.get("/dashboard/{dashboard_key}")
def scoped_dashboard(dashboard_key: str, db: Annotated[Session, Depends(get_db)], user: Annotated[User, Depends(get_current_user)]):
    dashboard_key = DASHBOARD_ALIASES.get(dashboard_key, dashboard_key)
    if dashboard_key not in DASHBOARD_SCOPES:
        from app.core.errors import NotFoundError
        raise NotFoundError("Dashboard not found")
    return response("Dashboard retrieved successfully", dashboard_data(db, user, dashboard_key))
