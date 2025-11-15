def test_get_users(client):
    # Create a fake user to test listing
    client.post("/signup", json={
        "name": "Bob",
        "email": "bob@example.com",
        "password": "pass123",
        "role": "hr"
    })

    response = client.get("/users")
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]["email"] in ["bob@example.com", "alice@example.com"]