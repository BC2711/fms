from datetime import datetime, timezone

from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, Enum, Float, Integer, JSON, LargeBinary, Numeric, String, Text, func, select
from sqlalchemy.orm import Session

from app.configuration.resources import RESOURCES
from app.core.security import hash_password
from app.database.base import Base
from app.models.resources import Account, Bank, GenericRecord, Menu, Permission, Role, Station, StationType, TestItem, User, UserType


DEMO_RESOURCES = (
    ("fuel-operations/fuel-products", "Fuel Product"),
    ("fuel-operations/fuel-stock-levels", "Stock Position"),
    ("requests-orders/all-fuel-requests", "Fuel Request"),
    ("requests-orders/all-orders", "Customer Order"),
    ("logistics/deliveries", "Delivery"),
    ("logistics/dispatch-management", "Dispatch"),
    ("fleet/all-vehicles", "Fleet Vehicle"),
    ("fleet/vehicle-maintenance", "Maintenance Job"),
    ("stations/station-performance", "Station Review"),
    ("cards-pos-fuel-cards/all-cards", "Fuel Card"),
    ("cards-pos-fuel-cards/card-transactions", "Card Transaction"),
    ("cards-pos-devices/pos-devices", "POS Device"),
    ("cards-pos-devices/pos-transactions", "POS Transaction"),
    ("finance-transactions/all-transactions", "Financial Transaction"),
    ("finance-funding/funding-requests", "Funding Request"),
    ("finance-reconciliation/reconciliation-records", "Reconciliation"),
    ("compliance/compliance-reviews", "Compliance Review"),
    ("compliance/incidents", "Compliance Incident"),
    ("reports/generated-reports", "Generated Report"),
    ("my-account/activity-history", "Account Activity"),
)


def permission_codes() -> list[str]:
    codes = {config.permission_for(operation) for config in RESOURCES for operation in config.allowed_operations}
    for resource in ("all-users", "roles", "permissions", "permission-groups", "menu-permissions", "page-permissions", "route-permissions", "data-scope-permissions", "user-sessions", "login-history", "countries", "provinces", "districts", "cities-and-towns", "station-regions"):
        codes.update(f"administration.{resource}.{operation}" for operation in ("view", "create", "update", "delete"))
    codes.update(f"settings.{operation}" for operation in ("view", "create", "update", "delete"))
    return sorted(codes)


def seed_access_catalog(db: Session) -> tuple[list[Menu], list[Permission]]:
    tree = json.loads(Path(__file__).with_name("menu_seed.json").read_text(encoding="utf-8"))
    menus: list[Menu] = []
    permissions: dict[str, Permission] = {item.code: item for item in db.scalars(select(Permission)).all()}

    def visit(nodes: list[dict], parent: Menu | None = None) -> None:
        for order, node in enumerate(nodes):
            code = node["id"]
            menu = db.scalar(select(Menu).where(Menu.code == code)) or Menu(code=code, name=node["label"])
            menu.name = node["label"]; menu.icon = node.get("icon", ""); menu.route = node.get("path", "")
            menu.parent = parent; menu.sort_order = order; menu.is_active = True; menu.status = "active"
            if menu.route:
                module = menu.route.strip("/").replace("/", ".")
                for action in ("view", "create", "edit", "delete"):
                    permission_code = f"{module}.{action}"
                    permission = permissions.get(permission_code)
                    if permission is None:
                        permission = Permission(code=permission_code, name=f"{menu.name} {action.title()}", module=module, action=action)
                        permissions[permission_code] = permission; db.add(permission)
                    if action == "view": menu.permission = permission
            db.add(menu); db.flush(); menus.append(menu)
            visit(node.get("children", []), menu)
    visit(tree)
    return menus, list(permissions.values())


def seed_database(db: Session) -> None:
    permissions = []
    for code in permission_codes():
        module, _, action = code.rpartition(".")
        permission = db.scalar(select(Permission).where(Permission.code == code)) or Permission(code=code, name=code.replace(".", " ").title(), module=module or code, action=action or "view")
        db.add(permission)
        permissions.append(permission)
    db.flush()
    menus, permissions = seed_access_catalog(db)
    role = db.scalar(select(Role).where(Role.code == "admin")) or Role(name="Admin", code="admin", description="System administrator")
    role.permissions = permissions
    role.menus = menus
    db.add(role)
    manager = db.scalar(select(Role).where(Role.code == "manager")) or Role(name="Manager", code="manager", description="Operational manager")
    attendant = db.scalar(select(Role).where(Role.code == "attendant")) or Role(name="Attendant", code="attendant", description="Station attendant")
    manager_modules = ("dashboard", "accounts", "stations", "reports", "my-account")
    attendant_modules = ("dashboard", "stations", "my-account")
    manager.menus = [item for item in menus if item.code.split("-")[0] in manager_modules]
    manager.permissions = [item for item in permissions if item.action in ("view", "create", "edit") and item.module.split(".")[0] in manager_modules]
    attendant.menus = [item for item in menus if item.code.split("-")[0] in attendant_modules]
    attendant.permissions = [item for item in permissions if item.action == "view" and item.module.split(".")[0] in attendant_modules]
    db.add_all([manager, attendant])
    for name, code, assigned_role in (("Administrator", "admin", role), ("Manager", "manager", manager), ("Attendant", "attendant", attendant)):
        user_type = db.scalar(select(UserType).where(UserType.code == code)) or UserType(name=name, code=code, description=f"Default {name.lower()} access")
        user_type.menus = assigned_role.menus; user_type.permissions = assigned_role.permissions; db.add(user_type)
    db.flush()
    admin = db.scalar(select(User).where(User.email == "admin@fms.example.com"))
    if not admin:
        admin = User(email="admin@fms.example.com", full_name="System Administrator", password_hash=hash_password("ChangeMe123!"), is_super_user=True, roles=[role], status="active")
        db.add(admin)
    db.flush()
    if not db.scalar(select(func.count()).select_from(Bank)):
        db.add_all([Bank(name="Zanaco", code="BNK01", country="Zambia"), Bank(name="Stanbic Bank Zambia", code="BNK02", country="Zambia")])
    if not db.scalar(select(func.count()).select_from(TestItem)):
        db.add_all([TestItem(name=f"Test Item {index}", details={"description": f"Description {index}"}, status="draft") for index in range(1, 6)])
    if not db.scalar(select(func.count()).select_from(Account)):
        types = ("corporate", "omc", "government", "ngo", "individual", "aggregator")
        db.add_all([Account(user_id=admin.id, account_number=f"FMS-{index:06}", name=f"Seed Account {index}", account_type=types[index - 1], email=f"account{index}@example.com") for index in range(1, 7)])
    if not db.scalar(select(func.count()).select_from(StationType)):
        station_type = StationType(name="Service Station", code="SERVICE")
        db.add(station_type)
        db.flush()
        db.add(Station(name="Lusaka Central Station", code="LSK001", station_type_id=station_type.id))
    db.commit()


def seed_demo_data(db: Session) -> int:
    """Add deterministic operational records used by development dashboards."""
    admin = db.scalar(select(User).where(User.email == "admin@fms.example.com"))
    if admin is None:
        seed_database(db)
        admin = db.scalar(select(User).where(User.email == "admin@fms.example.com"))
    now = datetime.now(timezone.utc)
    statuses = ("active", "completed", "pending", "draft", "inactive")
    created = 0
    for resource_index, (resource_path, label) in enumerate(DEMO_RESOURCES):
        for month_offset in range(6):
            for item_index in range(1 + (resource_index + month_offset) % 3):
                code = f"DEMO-{resource_index + 1:02}-{month_offset + 1:02}-{item_index + 1:02}"
                exists = db.scalar(select(GenericRecord.id).where(GenericRecord.resource_path == resource_path, GenericRecord.code == code))
                if exists:
                    continue
                month_index = now.year * 12 + now.month - 1 - month_offset
                year, month_zero = divmod(month_index, 12)
                day = min(4 + item_index * 7 + resource_index % 5, 27)
                created_at = datetime(year, month_zero + 1, day, 9 + item_index, tzinfo=timezone.utc)
                amount = 750 + resource_index * 425 + month_offset * 180 + item_index * 95
                db.add(GenericRecord(
                    resource_path=resource_path,
                    name=f"{label} {month_offset + 1}-{item_index + 1}",
                    code=code,
                    description="Dashboard demonstration record",
                    status=statuses[(resource_index + month_offset + item_index) % len(statuses)],
                    data={"amount": amount, "quantity": 100 + resource_index * 12 + item_index * 25, "source": "demo-seed"},
                    created_by=admin.id,
                    updated_by=admin.id,
                    created_at=created_at,
                    updated_at=created_at,
                ))
                created += 1
    db.commit()
    return created


def _dummy_column_value(table_name: str, column, row_index: int) -> object:
    key = column.name.lower()
    token = f"demo-{table_name.replace('_', '-')}-{key}-{row_index + 1:03}"
    if isinstance(column.type, Boolean):
        return True
    if isinstance(column.type, DateTime):
        return datetime.now(timezone.utc)
    if isinstance(column.type, Date):
        return datetime.now(timezone.utc).date()
    if isinstance(column.type, (Numeric, Float)):
        return Decimal(100 + row_index * 25)
    if isinstance(column.type, Integer):
        return row_index + 1
    if isinstance(column.type, JSON):
        return {"source": "demo-seed", "sequence": row_index + 1}
    if isinstance(column.type, LargeBinary):
        return b"demo"
    if isinstance(column.type, Enum):
        return column.type.enums[0]
    if isinstance(column.type, (String, Text)):
        length = max(1, getattr(column.type, "length", None) or 200)
        suffix = f"-{row_index + 1:03}"
        unique_token = f"{token[:max(0, length - len(suffix))]}{suffix}"[-length:]
        if "email" in key:
            return f"{table_name}.{key}.{row_index + 1}@demo.example.com"
        if key in {"url", "endpoint", "callback_url", "webhook_url"}:
            return "https://demo.example.com/callback"
        if "phone" in key:
            return f"+260970{row_index + 1:06}"
        if "status" in key:
            return "active"
        if key.endswith("type") or key in {"action", "method", "severity", "priority"}:
            return f"demo-{row_index + 1}"[:length]
        if "code" in key or "number" in key or key.endswith("key"):
            return unique_token.upper()
        return unique_token
    return token


def seed_all_tables(db: Session, target_rows: int = 20) -> tuple[int, list[str]]:
    """Populate every mapped table to a minimum row count."""
    tables = list(Base.metadata.tables.values())
    created = 0
    pending = {table.name: table for table in tables if db.scalar(select(func.count()).select_from(table)) < target_rows}
    for _ in range(len(pending) * 2 + 1):
        progressed = False
        for table_name, table in list(pending.items()):
            current = int(db.scalar(select(func.count()).select_from(table)) or 0)
            while current < target_rows:
                values = {}
                blocked = False
                for column in table.columns:
                    if column.primary_key and len(table.primary_key.columns) == 1 and isinstance(column.type, Integer):
                        continue
                    if column.default is not None or column.server_default is not None or column.nullable:
                        continue
                    if column.foreign_keys:
                        foreign_key = next(iter(column.foreign_keys))
                        target_count = int(db.scalar(select(func.count()).select_from(foreign_key.column.table)) or 0)
                        if target_count == 0:
                            blocked = True
                            break
                        values[column.name] = db.scalar(select(foreign_key.column).order_by(foreign_key.column).offset(current % target_count).limit(1))
                    else:
                        values[column.name] = _dummy_column_value(table_name, column, current)
                if blocked:
                    break
                try:
                    with db.begin_nested():
                        db.execute(table.insert().values(**values))
                    current += 1
                    created += 1
                    progressed = True
                except Exception:
                    break
            if current >= target_rows:
                pending.pop(table_name)
        if not pending or not progressed:
            break
    db.commit()
    return created, sorted(pending)
import json
from pathlib import Path
