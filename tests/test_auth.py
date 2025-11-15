def test_signup_and_login(client):
    # Signup
    signup_data = {
        "name": "Alice",
        "email": "alice@example.com",
        "password": "secret123",
        "role": "admin"
    }
    response = client.post("/signup", json=signup_data)
    assert response.status_code == 200
    assert response.json()["user"]["email"] == "alice@example.com"

    # Login
    login_data = {
        "email": "alice@example.com",
        "password": "secret123"
    }
    response = client.post("/login", json=login_data)
    assert response.status_code == 200
    assert response.json()["user"]["email"] == "alice@example.com"

