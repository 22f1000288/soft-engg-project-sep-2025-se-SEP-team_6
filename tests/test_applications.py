def test_get_applications(client):
    response = client.get("/applications")
    assert response.status_code == 200
    assert type(response.json()) is list   