from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.configuration.resources import RESOURCES
from app.core.security import hash_password
from app.models.identity import Permission, Role, User
from app.models.resources import Account, Bank, Station, StationType, TestItem


def permission_codes() -> list[str]:
    codes = {config.permission_for(operation) for config in RESOURCES for operation in config.allowed_operations}
    for resource in ("all-users", "roles", "permissions", "permission-groups", "menu-permissions", "page-permissions", "route-permissions", "data-scope-permissions", "user-sessions", "login-history", "countries", "provinces", "districts", "cities-and-towns", "station-regions"):
        codes.update(f"administration.{resource}.{operation}" for operation in ("view", "create", "update", "delete"))
    return sorted(codes)


def seed_database(db: Session) -> None:
    permissions = []
    for code in permission_codes():
        permission = db.scalar(select(Permission).where(Permission.code == code)) or Permission(code=code)
        db.add(permission)
        permissions.append(permission)
    db.flush()
    role = db.scalar(select(Role).where(Role.name == "administrator")) or Role(name="administrator")
    role.permissions = permissions
    db.add(role)
    db.flush()
    if not db.scalar(select(User).where(User.email == "admin@fms.example.com")):
        db.add(User(email="admin@fms.example.com", full_name="System Administrator", password_hash=hash_password("ChangeMe123!"), is_superuser=True, roles=[role], status="active"))
    if not db.scalar(select(func.count()).select_from(Bank)):
        db.add_all([Bank(name="Zanaco", code="BNK01", country="Zambia"), Bank(name="Stanbic Bank Zambia", code="BNK02", country="Zambia")])
    if not db.scalar(select(func.count()).select_from(TestItem)):
        db.add_all([TestItem(name=f"Test Item {index}", description=f"Description {index}", status="draft") for index in range(1, 6)])
    if not db.scalar(select(func.count()).select_from(Account)):
        types = ("corporate", "omc", "government", "ngo", "individual", "aggregator")
        db.add_all([Account(account_number=f"FMS-{index:06}", name=f"Seed Account {index}", account_type=types[index - 1], email=f"account{index}@example.com") for index in range(1, 7)])
    if not db.scalar(select(func.count()).select_from(StationType)):
        station_type = StationType(name="Service Station", code="SERVICE")
        db.add(station_type)
        db.flush()
        db.add(Station(name="Lusaka Central Station", code="LSK001", station_type_id=station_type.id, province_id=1, district_id=1))
    db.commit()
