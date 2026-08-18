from app import models as _models  # noqa: F401
from app.database.base import Base
from app.database.session import SessionLocal, engine
from app.utilities.seed import seed_all_tables, seed_database, seed_demo_data


if __name__ == "__main__":
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        seed_database(session)
        created = seed_demo_data(session)
        print(f"Seeded {created} dashboard demo records.")
        table_rows, skipped = seed_all_tables(session)
        print(f"Seeded {table_rows} rows to ensure at least 20 records per table.")
        if skipped:
            raise RuntimeError(f"Unable to seed tables: {', '.join(skipped)}")
