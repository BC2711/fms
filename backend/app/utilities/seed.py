from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.configuration.resources import RESOURCES
from app.core.security import hash_password
from app.models.resources import Account, Bank, Menu, Permission, Role, Station, StationType, TestItem, User, UserType


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
        db.add(Station(name="Lusaka Central Station", code="LSK001", station_type_id=station_type.id, province_id=1, district_id=1))
    db.commit()
import json
from pathlib import Path
