import json
from pathlib import Path

from sqlalchemy import select

from app.core.security import create_access_token, hash_password
from app.database.session import SessionLocal
from app.models.identity import Permission, Role, User


def menu_leaf_paths() -> list[str]:
    tree = json.loads((Path(__file__).parents[1] / "app" / "utilities" / "menu_seed.json").read_text(encoding="utf-8"))
    paths: list[str] = []

    def visit(nodes: list[dict]) -> None:
        for node in nodes:
            children = node.get("children", [])
            if children:
                visit(children)
            elif node.get("path"):
                paths.append(node["path"])

    visit(tree)
    return paths


def test_every_menu_leaf_has_an_authenticated_backend_list_operation(client, auth_headers):
    paths = menu_leaf_paths()
    assert len(paths) == 331
    failures = []
    for path in paths:
        response = client.get(f"/api{path}", headers=auth_headers)
        if response.status_code != 200:
            failures.append((path, response.status_code, response.json().get("message")))
    assert failures == []


def test_generic_resources_enforce_route_permissions(client):
    with SessionLocal() as session:
        permission = session.scalar(select(Permission).where(Permission.code == "fuel-operations.fuel-products.view"))
        role = Role(name="fuel-products-viewer", code="fuel-products-viewer", permissions=[permission])
        allowed = User(email="fuel.viewer@example.com", full_name="Fuel Viewer", password_hash=hash_password("Password123!"), roles=[role], status="active")
        denied = User(email="no.access@example.com", full_name="No Access", password_hash=hash_password("Password123!"), status="active")
        session.add_all([role, allowed, denied]); session.commit()
        allowed_id, denied_id = allowed.id, denied.id

    allowed_headers = {"Authorization": f"Bearer {create_access_token(str(allowed_id), [])}"}
    denied_headers = {"Authorization": f"Bearer {create_access_token(str(denied_id), [])}"}
    assert client.get("/api/fuel-operations/fuel-products", headers=allowed_headers).status_code == 200
    assert client.post(
        "/api/fuel-operations/fuel-products",
        headers=allowed_headers,
        json={"name": "Denied product", "code": "DENIED"},
    ).status_code == 403
    response = client.get("/api/fuel-operations/fuel-products", headers=denied_headers)
    assert response.status_code == 403
    assert response.json()["message"] == "Missing permission: fuel-operations.fuel-products.view"
