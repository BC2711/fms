from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.errors import install_error_handlers
from app.database.base import Base
from app.database.session import SessionLocal, engine
from app.utilities.seed import seed_database

# Importing models registers all SQLAlchemy metadata before migrations/test setup.
from app import models as _models  # noqa: F401

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.auto_create_tables:
        Base.metadata.create_all(engine)
    if settings.seed_on_startup:
        with SessionLocal() as db:
            seed_database(db)
    yield


def create_app() -> FastAPI:
    application = FastAPI(title=settings.app_name, version="2.0.0", description="Configuration-driven API for accounts, stations, security, and fuel operations.", lifespan=lifespan, docs_url=f"{settings.api_prefix}/docs", redoc_url=f"{settings.api_prefix}/redoc", openapi_url=f"{settings.api_prefix}/openapi.json")
    application.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    install_error_handlers(application)
    application.include_router(api_router, prefix=settings.api_prefix)
    return application


app = create_app()
