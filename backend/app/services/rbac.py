from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.resources import Menu, Permission, Role, User


def _role_chain(roles: list[Role]) -> list[Role]:
    result: dict[int, Role] = {}
    pending = list(roles)
    while pending:
        role = pending.pop()
        if role.id in result or not role.is_active or role.deleted_at is not None:
            continue
        result[role.id] = role
        if role.parent is not None:
            pending.append(role.parent)
    return list(result.values())


def permission_codes(user: User) -> set[str]:
    if user.is_super_user:
        return {"*"}
    granted = {
        permission.code
        for role in _role_chain(user.roles)
        for permission in role.permissions
        if permission.is_active and permission.deleted_at is None
    }
    if user.user_type and user.user_type.is_active and user.user_type.deleted_at is None:
        granted.update(
            permission.code
            for permission in user.user_type.permissions
            if permission.is_active and permission.deleted_at is None
        )
    for override in user.permission_overrides:
        code = override.permission.code
        if override.is_granted and override.permission.is_active and override.permission.deleted_at is None:
            granted.add(code)
        else:
            granted.discard(code)
    return granted


def accessible_menus(db: Session, user: User) -> list[Menu]:
    active = list(db.scalars(
        select(Menu)
        .where(Menu.is_active.is_(True), Menu.deleted_at.is_(None))
        .options(selectinload(Menu.permission))
        .order_by(Menu.sort_order, Menu.name)
    ).all())
    if user.is_super_user:
        return active

    menu_ids = {menu.id for role in _role_chain(user.roles) for menu in role.menus}
    if user.user_type and user.user_type.is_active:
        menu_ids.update(menu.id for menu in user.user_type.menus)
    for override in user.menu_overrides:
        if override.is_granted:
            menu_ids.add(override.menu_id)
        else:
            menu_ids.discard(override.menu_id)

    by_id = {menu.id: menu for menu in active}
    for menu_id in tuple(menu_ids):
        parent = by_id.get(menu_id).parent if menu_id in by_id else None
        while parent is not None:
            menu_ids.add(parent.id)
            parent = parent.parent
    codes = permission_codes(user)
    return [menu for menu in active if menu.id in menu_ids and (menu.permission is None or menu.permission.code in codes)]


def menu_tree(db: Session, user: User) -> list[dict[str, Any]]:
    menus = accessible_menus(db, user)
    allowed = {menu.id for menu in menus}
    children: dict[int | None, list[Menu]] = {}
    for menu in menus:
        parent_id = menu.parent_id if menu.parent_id in allowed else None
        children.setdefault(parent_id, []).append(menu)

    def serialize(menu: Menu) -> dict[str, Any]:
        item: dict[str, Any] = {
            "id": menu.code,
            "menu_id": menu.id,
            "label": menu.name,
            "icon": menu.icon or None,
            "path": menu.route or None,
            "route": menu.route or None,
            "component": menu.component or None,
            "sort_order": menu.sort_order,
            "metadata": menu.metadata_ or {},
        }
        nested = [serialize(child) for child in children.get(menu.id, [])]
        if nested:
            item["children"] = nested
        return item

    return [serialize(menu) for menu in children.get(None, [])]


def overrides(user: User) -> dict[str, list[dict[str, Any]]]:
    return {
        "menus": [{"menu_id": item.menu_id, "granted": item.is_granted} for item in user.menu_overrides],
        "permissions": [{"permission": item.permission.code, "granted": item.is_granted} for item in user.permission_overrides],
    }


def all_permission_codes(db: Session) -> list[str]:
    return list(db.scalars(select(Permission.code).where(Permission.is_active.is_(True), Permission.deleted_at.is_(None)).order_by(Permission.code)).all())
