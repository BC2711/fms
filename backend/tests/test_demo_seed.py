from sqlalchemy import func, select

from app.database.base import Base
from app.database.session import SessionLocal
from app.utilities.seed import seed_all_tables, seed_demo_data


def test_demo_seed_populates_every_mapped_table_and_is_idempotent():
    with SessionLocal() as session:
        assert seed_demo_data(session) > 0
        created, skipped = seed_all_tables(session)
        assert created > 0
        assert skipped == []
        assert all(session.scalar(select(func.count()).select_from(table)) >= 20 for table in Base.metadata.tables.values())
        assert seed_demo_data(session) == 0
        assert seed_all_tables(session) == (0, [])
