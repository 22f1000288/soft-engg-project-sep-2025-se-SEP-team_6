def test_active_jobs(client):
    response = client.get("/active-jobs")
    assert response.status_code == 200
    assert "active_jobs_count" in response.json()

def test_candidate_count(client):
    response = client.get("/candidate-count")
    assert response.status_code == 200
    assert "candidate_count" in response.json()

def test_hired_count(client):
    response = client.get("/hired-count")
    assert response.status_code == 200
    assert "hired_count" in response.json()

def test_application_count(client):
    response = client.get("/application-count")
    assert response.status_code == 200
    assert "application_count" in response.json()

def test_interview_count(client):
    response = client.get("/interview-count")
    assert response.status_code == 200
    assert "interview_count" in response.json()

def test_job_offered_count(client):
    response = client.get("/job-offered-count")
    assert response.status_code == 200
    assert "offer_count" in response.json()