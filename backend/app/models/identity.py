"""Deprecated compatibility imports.

RBAC models and configuration now live in :mod:`app.models.resources` and in
database rows. New code must import from that module directly.
"""
from app.models.resources import Menu, Permission, Role, User, UserType

__all__ = ["Menu", "Permission", "Role", "User", "UserType"]
