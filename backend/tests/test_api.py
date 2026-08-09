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


def test_generic_menu_resource_end_to_end(client, auth_headers):
    created = client.post("/api/fuel-operations/fuel-products", headers=auth_headers, json={"name": "Unleaded Petrol", "code": "ULP", "status": "active", "octane": 95})
    assert created.status_code == 201
    item = created.json()["data"]
    assert item["octane"] == 95
    listing = client.get("/api/fuel-operations/fuel-products?search=petrol&status=active&page=1&pageSize=10&sortBy=name&sortDirection=asc", headers=auth_headers)
    assert listing.status_code == 200
    assert listing.json()["data"].keys() >= {"items", "total", "page", "pageSize", "active"}
    assert listing.json()["data"]["total"] == 1
    viewed = client.get(f"/api/fuel-operations/fuel-products/{item['id']}", headers=auth_headers)
    assert viewed.json()["data"]["code"] == "ULP"
    updated = client.put(f"/api/fuel-operations/fuel-products/{item['id']}", headers=auth_headers, json={"name": "Premium Petrol", "octane": 97})
    assert updated.json()["data"] == {**updated.json()["data"], "name": "Premium Petrol", "octane": 97}
    assert client.delete(f"/api/fuel-operations/fuel-products/{item['id']}", headers=auth_headers).status_code == 200
    assert client.get(f"/api/fuel-operations/fuel-products/{item['id']}", headers=auth_headers).status_code == 404


def test_station_payload_extensions_relationships_statistics_and_document_file(client, auth_headers):
    station_type = client.post("/api/stations/station-types", headers=auth_headers, json={"name": "Retail Station", "code": "RETAIL", "is_public": True}).json()["data"]
    station = client.post("/api/stations", headers=auth_headers, json={"name": "Airport Station", "code": "AIR01", "station_type_id": station_type["id"], "license_number": "ERB-123", "manager_email": "manager@example.com"})
    assert station.status_code == 201
    station_data = station.json()["data"]
    assert station_data["station_type"]["name"] == "Retail Station"
    assert station_data["license_number"] == "ERB-123"
    assert station_data["manager_email"] == "manager@example.com"
    listing = client.get("/api/stations?status=active&pageSize=100", headers=auth_headers).json()["data"]
    assert listing["active"] >= 1
    document = client.post("/api/stations/station-documents", headers=auth_headers, json={"station_id": station_data["id"], "document_type": "erb_license", "document_name": "ERB Licence", "file": "data:application/pdf;base64,JVBERi0xLjQ=", "verification_status": "pending", "notes": "Uploaded from the configured file field"})
    assert document.status_code == 201
    assert document.json()["data"]["station"]["name"] == "Airport Station"
    assert document.json()["data"]["file"].startswith("data:application/pdf;base64,")


def test_administration_users_roles_and_permissions_end_to_end(client, auth_headers):
    permissions = client.get("/api/administration/permissions?pageSize=100", headers=auth_headers)
    assert permissions.status_code == 200
    permission_id = permissions.json()["data"]["items"][0]["id"]

    role = client.post("/api/administration/roles", headers=auth_headers, json={"name": "station-operator", "permission_ids": [permission_id]})
    assert role.status_code == 201
    role_id = role.json()["data"]["id"]
    assert role.json()["data"]["permission_ids"] == [permission_id]

    user = client.post("/api/administration/all-users", headers=auth_headers, json={"full_name": "Station Operator", "email": "operator@example.com", "password": "SecurePass123!", "role_id": role_id, "status": "active"})
    assert user.status_code == 201
    user_id = user.json()["data"]["id"]
    assert user.json()["data"]["roles"][0]["name"] == "station-operator"
    assert client.post("/api/auth/login", json={"email": "operator@example.com", "password": "SecurePass123!"}).status_code == 200

    listing = client.get("/api/administration/all-users?search=operator&status=active", headers=auth_headers)
    assert listing.status_code == 200
    assert listing.json()["data"]["total"] == 1
    assert client.delete(f"/api/administration/roles/{role_id}", headers=auth_headers).status_code == 409
    assert client.put(f"/api/administration/all-users/{user_id}", headers=auth_headers, json={"full_name": "Updated Operator", "status": "suspended"}).status_code == 200
    assert client.delete(f"/api/administration/all-users/{user_id}", headers=auth_headers).status_code == 200
    assert client.delete(f"/api/administration/roles/{role_id}", headers=auth_headers).status_code == 200
