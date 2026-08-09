def test_health_and_authentication(client, auth_headers):
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["success"] is True
    assert client.get("/api/stations").status_code == 401
    assert client.get("/api/stations", headers=auth_headers).status_code == 200


def test_jwt_login_and_current_user(client):
    login = client.post("/api/auth/login", json={"email": "admin@fms.example.com", "password": "ChangeMe123!"})
    assert login.status_code == 200
    token = login.json()["data"]["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["data"]["email"] == "admin@fms.example.com"


def test_generated_crud_search_filter_sort_and_soft_delete(client, auth_headers):
    created = client.post("/api/stations/station-types", headers=auth_headers, json={"name": "Depot", "code": "DEPOT", "description": "Bulk storage"})
    assert created.status_code == 201
    item_id = created.json()["data"]["id"]
    listing = client.get("/api/stations/station-types?search=Depot&status=active&sortBy=name&sortDirection=asc", headers=auth_headers)
    assert listing.status_code == 200
    assert listing.json()["data"]["total"] == 1
    updated = client.put(f"/api/stations/station-types/{item_id}", headers=auth_headers, json={"description": "Updated"})
    assert updated.status_code == 200
    deleted = client.delete(f"/api/stations/station-types/{item_id}", headers=auth_headers)
    assert deleted.status_code == 200
    assert client.get(f"/api/stations/station-types/{item_id}", headers=auth_headers).status_code == 404

    from sqlalchemy import select
    from app.database.session import SessionLocal
    from app.models.audit import AuditLog
    with SessionLocal() as session:
        actions = session.scalars(select(AuditLog.action).where(AuditLog.resource == "station-types", AuditLog.resource_id == str(item_id))).all()
    assert actions == ["create", "update", "delete"]


def test_account_submodule_is_scoped_by_type(client, auth_headers):
    response = client.get("/api/accounts/corporate-companies", headers=auth_headers)
    assert response.status_code == 200
    assert all(item["account_type"] == "corporate" for item in response.json()["data"]["items"])

    individual = client.post("/api/accounts/individuals", headers=auth_headers, json={"account_number": "FMS-I-001", "first_name": "Mwamba", "last_name": "Phiri", "email": "mwamba@example.com", "monthly_fuel_limit": 5000})
    assert individual.status_code == 201
    assert individual.json()["data"]["name"] == "Mwamba Phiri"
    assert individual.json()["data"]["monthly_fuel_limit"] == 5000


def test_all_frontend_module_routes_are_exposed(client):
    paths = client.get("/api/openapi.json").json()["paths"]
    expected = ["/api/accounts/oil-marketing-companies", "/api/accounts/corporate-companies", "/api/accounts/ngos", "/api/accounts/individuals", "/api/accounts/aggregators", "/api/accounts/government-institutions", "/api/stations", "/api/stations/station-types", "/api/stations/station-groups", "/api/stations/station-price-boards", "/api/stations/station-inspections", "/api/stations/station-performance", "/api/stations/station-documents"]
    assert set(expected).issubset(paths)


def test_permissions_are_enforced_for_non_superusers(client):
    from app.core.security import create_access_token, hash_password
    from app.database.session import SessionLocal
    from app.models.identity import User
    with SessionLocal() as session:
        user = User(email="viewer@example.com", full_name="No Permissions", password_hash=hash_password("Password123!"), status="active")
        session.add(user)
        session.commit()
        user_id = user.id
    token = create_access_token(str(user_id), [])
    response = client.get("/api/stations", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert response.json()["message"] == "Missing permission: stations.view"
