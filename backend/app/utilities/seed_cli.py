from app.database.session import SessionLocal
from app.utilities.seed import seed_database


if __name__ == "__main__":
    with SessionLocal() as session:
        seed_database(session)
