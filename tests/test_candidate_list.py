def test_candidate_list(client):
    response = client.get("/candidate-list")
    assert response.status_code == 200
    assert "candidates" in response.json()
    assert isinstance(response.json()["candidates"], list)