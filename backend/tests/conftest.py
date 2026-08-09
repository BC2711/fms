import os

os.environ["FMS_DATABASE_URL"] = "sqlite:///./fms_test.sqlite3"
os.environ["FMS_AUTO_CREATE_TABLES"] = "false"
os.environ["FMS_SEED_ON_STARTUP"] = "false"

import pytest
from fastapi.testclient import TestClient

from app.database.base import Base
from app.database.session import SessionLocal, engine
from app.main import app
from app.utilities.seed import seed_database


@pytest.fixture(autouse=True)
def database():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        seed_database(session)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer development-token"}
