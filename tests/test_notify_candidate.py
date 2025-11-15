from unittest.mock import patch

def test_notify_candidate(client):
    with patch("main.send_email") as mock_mail:
        mock_mail.return_value = True

        payload = {
            "candidate_email": "x@y.com",
            "subject": "Hello",
            "body": "Test"
        }

        response = client.post("/notify-candidate", json=payload)

        assert response.status_code == 200
        assert response.json()["message"] == "Notification email sent successfully"
        