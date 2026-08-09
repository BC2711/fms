from fastapi import APIRouter

from app.api.router_factory import generate_crud_router
from app.api.routes.auth import router as auth_router
from app.api.routes.system import router as system_router
from app.configuration.resources import RESOURCES
from app.api.routes.generic_resources import router as generic_resources_router

api_router = APIRouter()
api_router.include_router(system_router)
api_router.include_router(auth_router)
for resource in RESOURCES:
    api_router.include_router(generate_crud_router(resource))
api_router.include_router(generic_resources_router)
