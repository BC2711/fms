def test_dashboard_returns_chart_series(client, auth_headers):
    client.post("/api/fuel-operations/fuel-products", headers=auth_headers, json={"name": "Diesel", "code": "AGO", "status": "active"})
    response = client.get("/api/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data["charts"]["monthly_activity"]) == 6
    assert data["charts"]["monthly_activity"][-1]["value"] >= 1
    assert {point["label"] for point in data["charts"]["module_activity"]} >= {"Fuel Operations"}
    assert {point["label"] for point in data["charts"]["status_distribution"]} >= {"Active"}
