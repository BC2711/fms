"""add location parent foreign keys

Revision ID: 7a42c108d6f1
Revises: e0c1ac7c24af
Create Date: 2026-08-14
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7a42c108d6f1"
down_revision: Union[str, Sequence[str], None] = "e0c1ac7c24af"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("generic_records") as batch_op:
        batch_op.add_column(sa.Column("country_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("province_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("district_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key("fk_generic_records_country_id", "generic_records", ["country_id"], ["id"])
        batch_op.create_foreign_key("fk_generic_records_province_id", "generic_records", ["province_id"], ["id"])
        batch_op.create_foreign_key("fk_generic_records_district_id", "generic_records", ["district_id"], ["id"])
        batch_op.create_index("ix_generic_records_country_id", ["country_id"])
        batch_op.create_index("ix_generic_records_province_id", ["province_id"])
        batch_op.create_index("ix_generic_records_district_id", ["district_id"])


def downgrade() -> None:
    with op.batch_alter_table("generic_records") as batch_op:
        batch_op.drop_index("ix_generic_records_district_id")
        batch_op.drop_index("ix_generic_records_province_id")
        batch_op.drop_index("ix_generic_records_country_id")
        batch_op.drop_constraint("fk_generic_records_district_id", type_="foreignkey")
        batch_op.drop_constraint("fk_generic_records_province_id", type_="foreignkey")
        batch_op.drop_constraint("fk_generic_records_country_id", type_="foreignkey")
        batch_op.drop_column("district_id")
        batch_op.drop_column("province_id")
        batch_op.drop_column("country_id")
