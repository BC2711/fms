def test_dashboard_returns_chart_series(client, auth_headers):
    client.post("/api/fuel-operations/fuel-products", headers=auth_headers, json={"name": "Diesel", "code": "AGO", "status": "active"})
    response = client.get("/api/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data["charts"]["monthly_activity"]) == 6
    assert data["charts"]["monthly_activity"][-1]["value"] >= 1
    assert {point["label"] for point in data["charts"]["module_activity"]} >= {"Fuel Operations"}
    assert {point["label"] for point in data["charts"]["status_distribution"]} >= {"Active"}


def test_scoped_dashboards_only_aggregate_their_domain_records(client, auth_headers):
    client.post("/api/fleet/all-vehicles", headers=auth_headers, json={"name": "Tanker 01", "code": "TK-01", "status": "active"})
    client.post("/api/finance-transactions/all-transactions", headers=auth_headers, json={"name": "Sale 01", "code": "TX-01", "status": "completed"})

    fleet = client.get("/api/dashboard/dashboard-fleet-dashboard", headers=auth_headers).json()["data"]
    finance = client.get("/api/dashboard/dashboard-finance-dashboard", headers=auth_headers).json()["data"]

    assert fleet["summary"]["generated_records"] == 1
    assert finance["summary"]["generated_records"] == 1
    assert fleet["charts"]["category_mix"] == [{"label": "All Vehicles", "value": 1}]
    assert finance["charts"]["category_mix"] == [{"label": "All Transactions", "value": 1}]
