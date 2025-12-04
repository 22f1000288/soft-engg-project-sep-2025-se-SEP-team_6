from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events"
]

flow = InstalledAppFlow.from_client_secrets_file(
    "credentials.json",
    SCOPES,
    redirect_uri="http://localhost:8080/oauth2callback"
)
creds = flow.run_local_server(port=8080)
with open("token.json", "w") as token:
    token.write(creds.to_json())
print("token.json generated!")