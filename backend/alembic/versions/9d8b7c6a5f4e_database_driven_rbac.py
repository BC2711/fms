"""database driven RBAC

Revision ID: 9d8b7c6a5f4e
Revises: 7a42c108d6f1
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "9d8b7c6a5f4e"
down_revision: Union[str, Sequence[str], None] = "7a42c108d6f1"
branch_labels = None
depends_on = None


def audit_columns() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("created_by", sa.Integer(), nullable=True), sa.Column("updated_by", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="active"),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def upgrade() -> None:
    with op.batch_alter_table("permissions") as batch:
        batch.add_column(sa.Column("name", sa.String(100), nullable=False, server_default="Permission"))
        batch.add_column(sa.Column("description", sa.Text(), nullable=False, server_default=""))
        batch.add_column(sa.Column("module", sa.String(50), nullable=False, server_default="system"))
        batch.add_column(sa.Column("action", sa.String(32), nullable=False, server_default="view"))
        batch.add_column(sa.Column("metadata", sa.JSON(), nullable=False, server_default="{}"))
        batch.add_column(sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
        for column in audit_columns(): batch.add_column(column)
    with op.batch_alter_table("roles") as batch:
        batch.add_column(sa.Column("code", sa.String(64), nullable=True))
        batch.add_column(sa.Column("description", sa.Text(), nullable=False, server_default=""))
        batch.add_column(sa.Column("parent_id", sa.Integer(), nullable=True))
        batch.add_column(sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
        for column in audit_columns(): batch.add_column(column)
    op.execute("UPDATE roles SET code = lower(replace(name, ' ', '-'))")
    with op.batch_alter_table("roles") as batch:
        batch.alter_column("code", existing_type=sa.String(64), nullable=False)
        batch.create_foreign_key("fk_roles_parent", "roles", ["parent_id"], ["id"])
        batch.create_unique_constraint("uq_roles_code", ["code"])

    op.create_table("user_types", sa.Column("name", sa.String(50), nullable=False), sa.Column("code", sa.String(30), nullable=False), sa.Column("description", sa.Text(), nullable=False, server_default=""), sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()), sa.Column("id", sa.Integer(), primary_key=True), *audit_columns(), sa.UniqueConstraint("name"), sa.UniqueConstraint("code"))
    with op.batch_alter_table("users") as batch:
        batch.alter_column("is_superuser", new_column_name="is_super_user")
        batch.add_column(sa.Column("user_type_id", sa.Integer(), nullable=True))
        batch.create_foreign_key("fk_users_user_type", "user_types", ["user_type_id"], ["id"])

    op.create_table("menus", sa.Column("name", sa.String(100), nullable=False), sa.Column("code", sa.String(50), nullable=False), sa.Column("icon", sa.String(50), nullable=False, server_default=""), sa.Column("route", sa.String(200), nullable=False, server_default=""), sa.Column("component", sa.String(160), nullable=False, server_default=""), sa.Column("metadata", sa.JSON(), nullable=False, server_default="{}"), sa.Column("permission_id", sa.Integer(), sa.ForeignKey("permissions.id")), sa.Column("parent_id", sa.Integer(), sa.ForeignKey("menus.id")), sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"), sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()), sa.Column("description", sa.Text(), nullable=False, server_default=""), sa.Column("id", sa.Integer(), primary_key=True), *audit_columns(), sa.UniqueConstraint("code"))
    op.create_table("role_menus", sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True), sa.Column("menu_id", sa.Integer(), sa.ForeignKey("menus.id", ondelete="CASCADE"), primary_key=True))
    op.create_table("user_type_menus", sa.Column("user_type_id", sa.Integer(), sa.ForeignKey("user_types.id", ondelete="CASCADE"), primary_key=True), sa.Column("menu_id", sa.Integer(), sa.ForeignKey("menus.id", ondelete="CASCADE"), primary_key=True))
    op.create_table("user_type_permissions", sa.Column("user_type_id", sa.Integer(), sa.ForeignKey("user_types.id", ondelete="CASCADE"), primary_key=True), sa.Column("permission_id", sa.Integer(), sa.ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True))
    for table, target in (("user_menu_overrides", "menus"), ("user_permission_overrides", "permissions")):
        target_col = "menu_id" if target == "menus" else "permission_id"
        op.create_table(table, sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column(target_col, sa.Integer(), sa.ForeignKey(f"{target}.id", ondelete="CASCADE"), nullable=False), sa.Column("is_granted", sa.Boolean(), nullable=False, server_default=sa.true()), sa.Column("id", sa.Integer(), primary_key=True), *audit_columns(), sa.UniqueConstraint("user_id", target_col))


def downgrade() -> None:
    for table in ("user_permission_overrides", "user_menu_overrides", "user_type_permissions", "user_type_menus", "role_menus", "menus"):
        op.drop_table(table)
    with op.batch_alter_table("users") as batch:
        batch.drop_constraint("fk_users_user_type", type_="foreignkey"); batch.drop_column("user_type_id"); batch.alter_column("is_super_user", new_column_name="is_superuser")
    op.drop_table("user_types")
    # Role/permission metadata is intentionally retained on downgrade to avoid data loss.
