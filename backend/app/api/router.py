from fastapi import APIRouter

from app.api.router_factory import generate_crud_router
from app.api.routes.auth import router as auth_router
from app.api.routes.administration import router as administration_router
from app.api.routes.accounts import router as accounts_router
from app.api.routes.system import router as system_router
from app.configuration.resources import RESOURCES
from app.api.routes.generic_resources import router as generic_resources_router
from app.api.routes.rbac import router as rbac_router
from app.api.routes.admin_rbac import router as admin_rbac_router

api_router = APIRouter()
api_router.include_router(system_router)
api_router.include_router(auth_router)
api_router.include_router(rbac_router)
api_router.include_router(admin_rbac_router)
api_router.include_router(administration_router)
api_router.include_router(accounts_router)
for resource in RESOURCES:
    api_router.include_router(generate_crud_router(resource))
api_router.include_router(generic_resources_router)
