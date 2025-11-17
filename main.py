import os
import uvicorn
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, Request, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text, and_, or_
from backend.databases.models import SessionLocal, User, Application, Job, Candidate
from backend.roles import ROLE_ADMIN, ROLE_CANDIDATE, ROLE_HR, is_valid_role
from backend.security import (
    TokenValidationError,
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
)
from backend.utils import verify_password, hash_password
from backend.mailUtils.sendMail import send_email
from backend.interviewBot import GroqInterview, AUDIO_FOLDER

app = FastAPI(
    title="TalentForm HRMS API",
    description="API documentation for HRMS application",
    version="1.0.0"
)

groq_instance = GroqInterview()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Login(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    name: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ApplicationSearchRequest(BaseModel):
    search_query: str = ""
    job_filter: str = ""

class CreateApplicationRequest(BaseModel):
    candidate_name: str
    candidate_email: str
    job_id: int
    phone: str = ""
    skills: str = ""
    experience: str = ""
    education: str = ""
    profile_summary: str = ""
    resume_url: str = ""

class UpdateApplicationStatusRequest(BaseModel):
    status: str  # One of: "new-applications", "under-review", "interview-scheduled", "final-review", "hired"

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def serialize_user(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        name=user.name,
    )

def build_auth_response(user: User) -> AuthResponse:
    return AuthResponse(
        access_token=create_access_token(str(user.id), user.role),
        refresh_token=create_refresh_token(str(user.id), user.role),
        user=serialize_user(user),
    )

async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    try:
        payload = decode_access_token(token)
    except TokenValidationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

def require_roles(*allowed_roles: str):
    async def role_dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        return user

    return role_dependency

@app.get("/users", tags=["Users"])
async def read_users(
    # User = Depends(require_roles(ROLE_ADMIN)),
    db: Session = Depends(get_db),
):
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name
        }
        for user in users
    ]

@app.get("/applications", tags=["Applications"])
async def read_apps(
    User = Depends(require_roles(ROLE_ADMIN, ROLE_HR)),
    db: Session = Depends(get_db),
):
    apps = db.query(Application).all()
    return [
        {
            "id": app.id,
            "candidate_id": app.candidate_id,
            "job_id": app.job_id,
            "status_applied": app.status_applied,
            "status_under_review": app.status_under_review,
            "status_shortlisted": app.status_shortlisted,
            "status_interviewed": app.status_interviewed,
            "status_offered": app.status_offered,
            "status_rejected": app.status_rejected,
            "score": app.score,
            "submitted_at": app.submitted_at
        }
        for app in apps
    ]

@app.get("/applications/all", tags=["Applications"])
async def get_all_applications(
    User = Depends(require_roles(ROLE_ADMIN, ROLE_HR)),
    db: Session = Depends(get_db),
):
    """
    Fetch all applications with complete candidate, user, and job information using SQL queries.
    Returns comprehensive application data for HR management.
    """
    try:
        # First, let's check if there are any records in each table
        app_count = db.execute(text("SELECT COUNT(*) FROM application")).scalar()
        candidate_count = db.execute(text("SELECT COUNT(*) FROM candidate")).scalar()
        user_count = db.execute(text("SELECT COUNT(*) FROM user")).scalar()
        job_count = db.execute(text("SELECT COUNT(*) FROM job")).scalar()
        
        print(f"Database counts - Applications: {app_count}, Candidates: {candidate_count}, Users: {user_count}, Jobs: {job_count}")
        
        # SQL query to join all related tables and get comprehensive application data
        query = text("""
            SELECT 
                a.id as app_id,
                a.candidate_id,
                a.job_id,
                a.status_applied,
                a.status_under_review,
                a.status_shortlisted,
                a.status_interviewed,
                a.status_offered,
                a.status_rejected,
                a.score,
                a.submitted_at,
                u.name as candidate_name,
                u.email as candidate_email,
                c.resume_url,
                c.skills,
                c.experience,
                c.education,
                c.profile_summary,
                j.title as job_title,
                j.location as job_location,
                j.employment_type,
                j.description as job_description,
                j.qualification as job_requirements
            FROM application a
            JOIN candidate c ON a.candidate_id = c.candidate_id
            JOIN user u ON c.user_id = u.id
            JOIN job j ON a.job_id = j.id
            ORDER BY a.submitted_at DESC
        """)
        
        result = db.execute(query)
        applications = result.fetchall()

        print("result applications", applications)
        print(f"Number of applications found: {len(applications)}")
        
        # Format the response
        formatted_applications = []
        for row in applications:
            # Determine application status based on boolean flags
            status = "new-applications"
            if row.status_rejected:
                status = "rejected"
            elif row.status_offered:
                status = "hired"
            elif row.status_interviewed:
                status = "final-review"
            elif row.status_shortlisted:
                status = "interview-scheduled"
            elif row.status_under_review:
                status = "under-review"
            elif row.status_applied:
                status = "new-applications"
            
            application_data = {
                "id": row.app_id,
                "candidate_id": row.candidate_id,
                "job_id": row.job_id,
                "candidate_name": row.candidate_name or "",
                "candidate_email": row.candidate_email or "",
                "job_title": row.job_title or "",
                "job_location": row.job_location or "",
                "employment_type": row.employment_type or "",
                "job_description": row.job_description or "",
                "job_requirements": row.job_requirements or "",
                "resume_url": row.resume_url or "",
                "skills": row.skills or "",
                "experience": row.experience or "",
                "education": row.education or "",
                "profile_summary": row.profile_summary or "",
                "status": status,
                "score": row.score,
                "submitted_at": str(row.submitted_at) if row.submitted_at else None,
                "status_flags": {
                    "applied": bool(row.status_applied),
                    "under_review": bool(row.status_under_review),
                    "shortlisted": bool(row.status_shortlisted),
                    "interviewed": bool(row.status_interviewed),
                    "offered": bool(row.status_offered),
                    "rejected": bool(row.status_rejected)
                }
            }
            formatted_applications.append(application_data)
        
        return {
            "total_applications": len(formatted_applications),
            "applications": formatted_applications
        }
        
    except Exception as e:
        print(f"Get all applications error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch applications: {str(e)}")



@app.post("/applications", tags=["Applications"])
async def create_application(
    request: CreateApplicationRequest,
    User = Depends(require_roles(ROLE_ADMIN, ROLE_HR)),
    db: Session = Depends(get_db),
):
    """
    Create a new application with candidate information.
    Creates both User, Candidate, and Application records.
    """
    try:
        # Check if user with this email already exists
        existing_user = db.query(User).filter(User.email == request.candidate_email).first()
        
        if existing_user:
            # Check if this user is already a candidate
            existing_candidate = db.query(Candidate).filter(Candidate.user_id == existing_user.id).first()
            if not existing_candidate:
                raise HTTPException(status_code=400, detail="User exists but is not a candidate")
            candidate_id = existing_candidate.id
            user_id = existing_user.id
        else:
            # Create new user with candidate role
            new_user = User(
                name=request.candidate_name,
                email=request.candidate_email,
                password=hash_password("defaultpass123"),  # Default password, should be changed
                role=ROLE_CANDIDATE
            )
            db.add(new_user)
            db.flush()  # Get the ID without committing
            user_id = new_user.id
            
            # Create candidate record
            new_candidate = Candidate(
                user_id=user_id,
                candidate_id=user_id,  # Using user_id as candidate_id
                resume_url=request.resume_url or "",
                skills=request.skills or "",
                experience=request.experience or "",
                education=request.education or "",
                profile_summary=request.profile_summary or ""
            )
            db.add(new_candidate)
            db.flush()
            candidate_id = new_candidate.id
        
        # Check if job exists
        job = db.query(Job).filter(Job.id == request.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Check if application already exists for this candidate and job
        existing_application = db.query(Application).filter(
            and_(Application.candidate_id == candidate_id, Application.job_id == request.job_id)
        ).first()
        
        if existing_application:
            raise HTTPException(status_code=400, detail="Application already exists for this candidate and job")
        
        # Create application
        new_application = Application(
            candidate_id=candidate_id,
            job_id=request.job_id,
            status_applied=True,
            status_under_review=False,
            status_shortlisted=False,
            status_interviewed=False,
            status_offered=False,
            status_rejected=False,
            score=None,
            submitted_at=datetime.now()
        )
        db.add(new_application)
        db.commit()
        
        # Return the created application with full details
        return {
            "message": "Application created successfully",
            "application": {
                "id": new_application.id,
                "candidate_id": candidate_id,
                "job_id": request.job_id,
                "candidate_name": request.candidate_name,
                "candidate_email": request.candidate_email,
                "job_title": job.title,
                "status": "new-applications",
                "submitted_at": new_application.submitted_at.isoformat()
            }
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Create application error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create application: {str(e)}")

@app.put("/applications/{application_id}/status", tags=["Applications"])
async def update_application_status(
    application_id: int,
    request: UpdateApplicationStatusRequest,
    User = Depends(require_roles(ROLE_ADMIN, ROLE_HR)),
    db: Session = Depends(get_db),
):
    """
    Update the status of an application when moved in Kanban board.
    Maps Kanban column status to database boolean flags.
    """
    try:
        # Find the application
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Validate status
        valid_statuses = ["new-applications", "under-review", "interview-scheduled", "final-review", "hired", "rejected"]
        if request.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        # Reset all status flags first
        application.status_applied = False
        application.status_under_review = False
        application.status_shortlisted = False
        application.status_interviewed = False
        application.status_offered = False
        application.status_rejected = False
        
        # Set the appropriate status flag based on Kanban column
        if request.status == "new-applications":
            application.status_applied = True
        elif request.status == "under-review":
            application.status_applied = True
            application.status_under_review = True
        elif request.status == "interview-scheduled":
            application.status_applied = True
            application.status_under_review = True
            application.status_shortlisted = True
        elif request.status == "final-review":
            application.status_applied = True
            application.status_under_review = True
            application.status_shortlisted = True
            application.status_interviewed = True
        elif request.status == "hired":
            application.status_applied = True
            application.status_under_review = True
            application.status_shortlisted = True
            application.status_interviewed = True
            application.status_offered = True
        elif request.status == "rejected":
            application.status_applied = True
            application.status_rejected = True
        
        db.commit()
        
        return {
            "message": "Application status updated successfully",
            "application_id": application_id,
            "new_status": request.status
        }
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Update application status error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update application status: {str(e)}")

@app.get("/jobs", tags=["Jobs"])
async def get_jobs(
    User = Depends(require_roles(ROLE_ADMIN, ROLE_HR)),
    db: Session = Depends(get_db),
):
    """Get all available jobs for application creation."""
    try:
        jobs = db.query(Job).filter(Job.status == "active").all()
        return [
            {
                "id": job.id,
                "title": job.title,
                "location": job.location,
                "employment_type": job.employment_type,
                "description": job.description
            }
            for job in jobs
        ]
    except Exception as e:
        print(f"Get jobs error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get jobs: {str(e)}")

@app.post("/login", tags=["Authentication"])
async def login(request: Login, db: Session = Depends(get_db)) -> AuthResponse:
    try:
        user = db.query(User).filter(User.email == request.email).first()
        # verify_password should accept (plain_password, hashed_password) and return True/False
        if user and verify_password(request.password, user.password):
            return build_auth_response(user)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise
    except Exception as e:
        print("Login error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/signup", tags=["Authentication"])
async def signup(request: SignupRequest, db: Session = Depends(get_db)) -> AuthResponse:
    if not is_valid_role(request.role):
        raise HTTPException(status_code=400, detail="Invalid role")
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        name=request.name,
        email=request.email,
        password=hash_password(request.password),
        role=request.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return build_auth_response(new_user)

@app.post("/refresh", tags=["Authentication"])
async def refresh_token(
    request: RefreshTokenRequest, db: Session = Depends(get_db)
) -> AuthResponse:
    try:
        payload = decode_refresh_token(request.refresh_token)
    except TokenValidationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    return build_auth_response(user)

@app.get("/active-jobs",tags=["Jobs"])
async def get_active_jobs(
    User = Depends(require_roles(ROLE_HR)),
    db: Session = Depends(get_db),
):
    # Use named parameters in the SQL query
    result = db.execute(text('SELECT COUNT(*) FROM job WHERE status = :status'), {"status": "active"})
    count = result.scalar()
    return {"active_jobs_count": count}

@app.get('/candidate-count', tags=["Candidates"])
async def get_all_candidates(
    User = Depends(require_roles(ROLE_HR)),
    db: Session = Depends(get_db),
):
    result = db.execute(text('SELECT COUNT(*) FROM candidate'))
    count = result.scalar()
    return {"candidate_count": count}

@app.get('/hired-count', tags=["Hires"])
async def get_hired_candidates(
    User = Depends(require_roles(ROLE_HR)),
    db: Session = Depends(get_db),
):
    result = db.execute(text("SELECT COUNT(*) FROM application WHERE status_offered = :status"), {"status": 1})
    count = result.scalar()
    return {"hired_count": count}

@app.get('/application-count', tags=["Applications"])
async def get_application_count(
    User = Depends(require_roles(ROLE_CANDIDATE)),
    db: Session = Depends(get_db),
):
    result = db.execute(text('SELECT COUNT(*) FROM application'))
    count = result.scalar()
    return {"application_count": count}

@app.get('/interview-count', tags=["Interviews"])
async def get_interview_count(
    User = Depends(require_roles(ROLE_CANDIDATE)),
    db: Session = Depends(get_db),
):
    try:
        result = db.execute(text('SELECT COUNT(*) FROM interview'))
        count = result.scalar()
        return {"interview_count": count}
    except Exception:
        # interview table doesn't exist yet
        return {"interview_count": 0}

@app.get('/job-offered-count', tags=["Jobs"])
async def get_job_offered_count(
    User = Depends(require_roles(ROLE_CANDIDATE)),
    db: Session = Depends(get_db),
):
    result = db.execute(text("SELECT COUNT(*) FROM application WHERE status_offered = :status"), {"status": 1})
    count = result.scalar()
    return {"offer_count": count}

@app.get('/candidate-list', tags=["Candidates"])
async def get_candidate_list(
    User = Depends(require_roles(ROLE_HR)),
    db: Session = Depends(get_db),
):
    result = db.execute(text('SELECT c.id, u.email, u.name from candidate c JOIN user u ON c.user_id = u.id'))
    candidates = result.fetchall()
    candidate_list = [{"id": row[0], "email": row[1], "name": row[2]} for row in candidates]
    return {"candidates": candidate_list}
    

# Pydantic model for notify-candidate request
class NotifyCandidateRequest(BaseModel):
    candidate_email: str
    subject: str
    body: str

@app.post('/notify-candidate', tags=["Communications"])
async def notify_candidate(
    payload: NotifyCandidateRequest,
    User = Depends(require_roles(ROLE_HR)),
):
    try:
        send_email(
            recipient_email=payload.candidate_email,
            subject=payload.subject,
            body=payload.body
        )
        return {"message": "Notification email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {e}")

@app.get("/", tags=["Health Check"])
async def root():
    return {"message": "Hello World"}



@app.post("/talk", tags=["Interview"])
async def post_audio(file: UploadFile = File(...)):
    """Accept audio file and return transcription + response."""
    if not file or file.filename == "":
        raise HTTPException(status_code=400, detail="No file provided")
    
    global groq_instance
    try:
        # Read file into memory
        file_content = await file.read()
        
        # Create a BytesIO wrapper for groq transcription
        import io
        audio_file = io.BytesIO(file_content)
        audio_file.seek(0)  # Ensure pointer is at start
        audio_file.name = file.filename
        
        # Transcribe
        user_message = await groq_instance.transcribe_audio(audio_file)
        
        # Get chat response
        chat_response = await groq_instance.get_chat_response(user_message)
        print(chat_response['content'])
        
        # Text to speech
        audio_response = await groq_instance.text_to_speech(chat_response['content'])
        print(audio_response)
        
        # Return response
        return {
            "audio_file": f"/temp_audio/{audio_response}",
            "transcript": user_message['content'],
            "response": chat_response['content']
        }
    except Exception as e:
        print(f"Error in /talk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

TEMP_AUDIO_DIR = os.path.abspath(os.path.join(os.getcwd(), "temp_audio"))

@app.get("/temp_audio/{file_path:path}")
def serve_temp_audio(file_path: str):
    requested_path = os.path.abspath(os.path.join(TEMP_AUDIO_DIR, file_path))

    # Prevent path traversal
    if os.path.commonpath([TEMP_AUDIO_DIR, requested_path]) != TEMP_AUDIO_DIR:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Ensure file exists and is a file
    if not os.path.exists(requested_path) or not os.path.isfile(requested_path):
        raise HTTPException(status_code=404, detail="File not found")

    # Return file (browser will stream it inline)
    return FileResponse(requested_path, media_type="audio/wav")

# ensure AUDIO_FOLDER is defined somewhere; if not set it explicitly:
# AUDIO_FOLDER = os.path.abspath(os.path.join(os.getcwd(), "audio"))

@app.get("/audio/{file_path:path}")
def serve_audio(file_path: str):
    base = os.path.abspath(AUDIO_FOLDER)
    requested_path = os.path.abspath(os.path.join(base, file_path))

    # Prevent path traversal
    if os.path.commonpath([base, requested_path]) != base:
        raise HTTPException(status_code=403, detail="Forbidden")

    if not os.path.exists(requested_path) or not os.path.isfile(requested_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(requested_path, media_type="application/octet-stream")


if __name__ == "__main__":
    
    uvicorn.run(app, host="0.0.0.0", port=8000)