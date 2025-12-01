from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import timedelta

SCOPES = ['https://www.googleapis.com/auth/calendar']
SERVICE_ACCOUNT_FILE = 'service-account.json'  # Update with your actual path

def get_calendar_service():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('calendar', 'v3', credentials=credentials)
    return service

def create_google_calendar_event(candidate_email, hr_email, scheduled_time):
    service = get_calendar_service()
    event = {
        'summary': 'Interview',
        'description': 'Automated interview invite.',
        'start': {'dateTime': scheduled_time.isoformat(), 'timeZone': 'UTC'},
        'end': {'dateTime': (scheduled_time + timedelta(hours=1)).isoformat(), 'timeZone': 'UTC'},
        'attendees': [{'email': candidate_email}, {'email': hr_email}],
    }
    created_event = service.events().insert(calendarId='primary', body=event, sendUpdates='all').execute()
    return created_event['id']

def update_google_calendar_event(event_id, new_time):
    service = get_calendar_service()
    event = service.events().get(calendarId='primary', eventId=event_id).execute()
    event['start']['dateTime'] = new_time.isoformat()
    event['end']['dateTime'] = (new_time + timedelta(hours=1)).isoformat()
    updated_event = service.events().update(calendarId='primary', eventId=event_id, body=event, sendUpdates='all').execute()
    return updated_event['id']