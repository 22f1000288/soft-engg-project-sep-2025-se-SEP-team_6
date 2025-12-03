from unittest.mock import patch

def test_refresh_token_valid(client):
    with patch("main.decode_refresh_token") as mock_decode:
        with patch("main.build_auth_response") as mock_build:
            mock_decode.return_value = {"sub": "1"}   # fake user id
            mock_build.return_value = {"access": "abc", "refresh": "xyz"}

            response = client.post("/refresh", json={"refresh_token": "validtoken"})

            assert response.status_code == 200
            assert response.json()["access"] == "abc"

def test_refresh_token_invalid(client):
    with patch("main.decode_refresh_token", side_effect=Exception("Invalid")):
        response = client.post("/refresh", json={"refresh_token": "bad"})
        assert response.status_code == 401
