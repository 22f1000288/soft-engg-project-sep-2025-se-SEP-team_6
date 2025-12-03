const handleCreateEvent = async () => {
  try {
    const tokenData = localStorage.getItem('tf_tokens');
    if (!tokenData) {
      alert('Not authenticated. Please log in.');
      return;
    }

    const tokens = JSON.parse(tokenData);
    const token = tokens.accessToken;

    if (!token) {
      alert('No access token found. Please log in again.');
      return;
    }

    const res = await fetch('http://localhost:8000/create-calendar-event', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error('Create event error:', errData);
      alert('Failed to create calendar event: ' + (errData.detail || res.statusText));
      return;
    }

    const data = await res.json();
    console.log('Calendar event created:', data);
    alert('Calendar event created successfully!');
  } catch (err) {
    console.error('Create event exception:', err);
    alert('Failed to create calendar event: ' + err.message);
  }
};