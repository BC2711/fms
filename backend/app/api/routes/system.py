from fastapi import APIRouter

from app.schemas.common import response

router = APIRouter(tags=["system"])


@router.get("/health")
def health():
    return response("Service is healthy", {"status": "ok"})
