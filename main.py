import os
import uvicorn
from datetime import datetime
import webbrowser
from fastapi import FastAPI, HTTPException, Depends, Request, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError
import traceback
from sqlalchemy import text
from resume_extractor.job_descriptor import create_job_summary
from backend.databases.models import SessionLocal, User, Application, Job, Scores, Candidate, Communication, Interview
from backend.databases.controller import (
    create_job,
    create_application,
    list_users,
    list_applications_for_admin,
    get_job_applications_with_candidate,
    get_candidate_applications,
    withdraw_application_by_candidate,
    get_job,
    list_jobs,
    update_job,
    delete_job,
    search_jobs,
    find_jobs_by_poster,
    create_or_update_score,
    get_scores_for_job,
    get_scores_for_candidate,
    get_candidate_score_for_job,
)
from backend.databases.controller import create_application as create_application_db
from typing import Optional, List
from pydantic import Field
from datetime import datetime
from typing import Any
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
from backend.eventCreator import main as create_calendar_event
from backend.databases.seed_users import seed_all
import tempfile
import asyncio
from pathlib import Path
from resume_extractor.resume_extractor import ResumeParser
import json
from resume_extractor.resume_job_json_comparator import compare_resume_job
from groq import Groq
from sqlalchemy import and_



load_dotenv()

app = FastAPI(
    title="TalentForm HRMS API",
    description="API documentation for HRMS application",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    seed_all()

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


# Job Pydantic models for request/response validation
class JobCreate(BaseModel):
    posted_by: int
    title: str
    description: str
    skills_required: str
    qualification: str
    location: str
    employment_type: str
    status: str = Field(default="open")
    created_at: Optional[datetime] = None


class JobResponse(JobCreate):
    id: int

class RefreshTokenRequest(BaseModel):
    refresh_token: str


class NotifyCandidateRequest(BaseModel):
    candidate_email: str
    subject: str
    body: str

class ScoreUpdate(BaseModel):
    candidate_id: int
    job_id: int
    score: float = Field(..., ge=0, le=100)

class InterviewRequest(BaseModel):
    candidate_id: int
    scheduled_time: Optional[datetime] = None  # If not provided, default to 5 days from now

class InterviewRescheduleRequest(BaseModel):
    interview_id: int
    new_time: datetime

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
    return await list_users()

@app.get("/applications", tags=["Applications"])
async def read_apps(
    User = Depends(require_roles(ROLE_ADMIN, ROLE_HR)),
    db: Session = Depends(get_db),
):
    return await list_applications_for_admin()

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
# async def create_application(
#     request: CreateApplicationRequest,
#     current_user: User = Depends(require_roles(ROLE_ADMIN, ROLE_HR)),
#     db: Session = Depends(get_db),
# ):
#     """
#     Create a new application with candidate information.
#     Creates both User, Candidate, and Application records.
#     """
#     try:
#         # Check if user with this email already exists
#         existing_user = db.query(User).filter(User.email == request.candidate_email).first()
        
#         if existing_user:
#             # Check if this user is already a candidate
#             existing_candidate = db.query(Candidate).filter(Candidate.user_id == existing_user.id).first()
#             if not existing_candidate:
#                 raise HTTPException(status_code=400, detail="User exists but is not a candidate")
#             candidate_id = existing_candidate.id
#             user_id = existing_user.id
#         else:
#             # Create new user with candidate role
#             new_user = User(
#                 name=request.candidate_name,
#                 email=request.candidate_email,
#                 password=hash_password("defaultpass123"),  # Default password, should be changed
#                 role=ROLE_CANDIDATE
#             )
#             db.add(new_user)
#             db.flush()  # Get the ID without committing
#             user_id = new_user.id
            
#             # Create candidate record
#             new_candidate = Candidate(
#                 user_id=user_id,
#                 candidate_id=user_id,  # Using user_id as candidate_id
#                 resume_url=request.resume_url or "",
#                 skills=request.skills or "",
#                 experience=request.experience or "",
#                 education=request.education or "",
#                 profile_summary=request.profile_summary or ""
#             )
#             db.add(new_candidate)
#             db.flush()
#             candidate_id = new_candidate.id
        
#         # Check if job exists
#         job = db.query(Job).filter(Job.id == request.job_id).first()
#         if not job:
#             raise HTTPException(status_code=404, detail="Job not found")
        
#         # Check if application already exists for this candidate and job
#         existing_application = db.query(Application).filter(
#             and_(Application.candidate_id == candidate_id, Application.job_id == request.job_id)
#         ).first()
        
#         if existing_application:
#             raise HTTPException(status_code=400, detail="Application already exists for this candidate and job")
        
#         # Create application
#         new_application = Application(
#             candidate_id=candidate_id,
#             job_id=request.job_id,
#             status_applied=True,
#             status_under_review=False,
#             status_shortlisted=False,
#             status_interviewed=False,
#             status_offered=False,
#             status_rejected=False,
#             score=None,
#             submitted_at=datetime.now()
#         )
#         db.add(new_application)
#         db.commit()
        
#         # Return the created application with full details
#         return {
#             "message": "Application created successfully",
#             "application": {
#                 "id": new_application.id,
#                 "candidate_id": candidate_id,
#                 "job_id": request.job_id,
#                 "candidate_name": request.candidate_name,
#                 "candidate_email": request.candidate_email,
#                 "job_title": job.title,
#                 "status": "new-applications",
#                 "submitted_at": new_application.submitted_at.isoformat()
#             }
#         }
        
#     except HTTPException:
#         db.rollback()
#         raise
#     except Exception as e:
#         db.rollback()
#         print(f"Create application error: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to create application: {str(e)}")
async def api_create_application(
    request: CreateApplicationRequest,
    current_user: User = Depends(require_roles(ROLE_ADMIN, ROLE_HR)),
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
            existing_candidate = (
                db.query(Candidate).filter(Candidate.user_id == existing_user.id).first()
            )
            if not existing_candidate:
                raise HTTPException(status_code=400, detail="User exists but is not a candidate")

            candidate_id = existing_candidate.id
            user_id = existing_user.id

        else:
            # Create new user with candidate role
            new_user = User(
                name=request.candidate_name,
                email=request.candidate_email,
                password=hash_password("defaultpass123"),
                role=ROLE_CANDIDATE,
            )
            db.add(new_user)
            db.flush()
            user_id = new_user.id

            # Create candidate record
            new_candidate = Candidate(
                user_id=user_id,
                candidate_id=user_id,
                resume_url=request.resume_url or "",
                skills=request.skills or "",
                experience=request.experience or "",
                education=request.education or "",
                profile_summary=request.profile_summary or "",
            )
            db.add(new_candidate)
            db.flush()
            candidate_id = new_candidate.id

        # Check if job exists
        job = db.query(Job).filter(Job.id == request.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Check if application already exists
        existing_application = (
            db.query(Application)
            .filter(and_(Application.candidate_id == candidate_id, Application.job_id == request.job_id))
            .first()
        )

        if existing_application:
            raise HTTPException(status_code=400, detail="Application already exists for this job")

        # Create new application
        new_application = Application(
            candidate_id=candidate_id,
            job_id=request.job_id,
            status_applied=True,
            submitted_at=datetime.now(),
        )
        db.add(new_application)
        db.commit()

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
                "submitted_at": new_application.submitted_at.isoformat(),
            },
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print("Create application error:", e)
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

# @app.get("/jobs", tags=["Jobs"])
# async def get_jobs(
#     User = Depends(require_roles(ROLE_ADMIN, ROLE_HR)),
#     db: Session = Depends(get_db),
# ):
#     """Get all available jobs for application creation."""
#     try:
#         jobs = db.query(Job).filter(Job.status == "active").all()
#         return [
#             {
#                 "id": job.id,
#                 "title": job.title,
#                 "location": job.location,
#                 "employment_type": job.employment_type,
#                 "description": job.description
#             }
#             for job in jobs
#         ]
#     except Exception as e:
#         print(f"Get jobs error: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to get jobs: {str(e)}")

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

    # If the new user is a candidate, create a Candidate row with sane defaults
    if new_user.role == ROLE_CANDIDATE:
        candidate = Candidate(
            resume_url="",
            skills="",
            experience="",
            education="",
            profile_summary="",
            user_id=new_user.id,
            candidate_id=new_user.id,
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

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
    # jobs are created with status 'open' in the API, so count those
    result = db.execute(text('SELECT COUNT(*) FROM job WHERE status = :status'), {"status": "open"})
    count = result.scalar()
    return {"active_jobs_count": count}


# --- Jobs CRUD endpoints ---

# Create a new job
@app.post("/create-job", tags=["Jobs"], status_code=201)
async def api_create_job(
    payload: JobCreate,
    user: User = Depends(require_roles(ROLE_HR)),
):
    """Create a job. Only HR users may create jobs."""
    try:
        data = payload.dict()
        # ensure created_at is set server-side when not provided
        created_at = data.get("created_at")
        if created_at is None:
            data["created_at"] = datetime.utcnow()
        # if created_at is a string, try to parse it
        elif isinstance(created_at, str):
            try:
                data["created_at"] = datetime.fromisoformat(created_at)
            except Exception:
                data["created_at"] = datetime.utcnow()

        job = await create_job(Job(**data))
        return JobResponse(**job.__dict__)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# List or search jobs

@app.get("/jobs", tags=["Jobs"])
async def api_list_jobs(q: Optional[str] = None, location: Optional[str] = None, limit: int = 100, db: Session = Depends(get_db)):
    """List or search jobs. Public endpoint. Returns job objects with an `applicants` count."""
    try:
        if q or location:
            jobs = await search_jobs(query=q, location=location, limit=limit)
        else:
            jobs = await list_jobs(limit=limit)

        out = []
        for j in jobs:
            count = db.query(Application).filter(Application.job_id == j.id).count()
            job_dict = j.__dict__.copy()
            job_dict["applicants"] = count
            out.append(job_dict)
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#get job by id
@app.get("/jobs/{job_id}", tags=["Jobs"], response_model=JobResponse)
async def api_get_job(job_id: int):
    job = await get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse(**job.__dict__)

# Apply to a job
@app.post("/jobs/{job_id}/apply", tags=["Applications"], status_code=201)
async def api_apply_job(
    job_id: int,
    user: User = Depends(require_roles(ROLE_CANDIDATE)),
    db: Session = Depends(get_db),
):
    """Candidate applies to a job. Creates an Application record."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    try:
        # Call the database-layer function
        result = await create_application_db(user.id, job_id)

        if result.get("status") == "exists":
            raise HTTPException(status_code=409, detail="Already applied to this job")

        app = result.get("application")
        return {"detail": "Application submitted", "id": getattr(app, "id", None)}

    except HTTPException:
        raise
    except IntegrityError as ie:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(ie))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Get applications for a job

@app.get("/jobs/{job_id}/applications", tags=["Applications"])
async def api_get_job_applications(job_id: int, user: User = Depends(require_roles(ROLE_HR, ROLE_ADMIN)), db: Session = Depends(get_db)):
    """Return applications for a job along with candidate info. HR/Admin only."""
    # validate job exists using controller
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        return await get_job_applications_with_candidate(job_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get applications for the current candidate

@app.get("/candidate/applications", tags=["Applications"])
async def api_candidate_applications(user: User = Depends(require_roles(ROLE_CANDIDATE)), db: Session = Depends(get_db)):
    """Return the current candidate's applications along with basic job info."""
    try:
        return await get_candidate_applications(user.id)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Withdraw (delete) an application

@app.delete("/applications/{application_id}", tags=["Applications"]) 
async def api_withdraw_application(application_id: int, user: User = Depends(require_roles(ROLE_CANDIDATE)), db: Session = Depends(get_db)):
    """Allow a candidate to withdraw (delete) their application."""
    try:
        res = await withdraw_application_by_candidate(application_id, user.id)
        if not res.get("ok"):
            if res.get("reason") == "not_found":
                raise HTTPException(status_code=404, detail="Application not found")
            if res.get("reason") == "forbidden":
                raise HTTPException(status_code=403, detail="Not authorized to withdraw this application")
            raise HTTPException(status_code=400, detail="Unable to withdraw application")
        return {"detail": "Application withdrawn"}
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# Update a job

@app.put("/jobs/{job_id}", tags=["Jobs"], response_model=JobResponse)
async def api_update_job(job_id: int, updates: dict, user: User = Depends(require_roles(ROLE_HR))):
    job = await update_job(job_id, updates)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse(**job.__dict__)

# Delete a job

@app.delete("/jobs/{job_id}", tags=["Jobs"], status_code=204)
async def api_delete_job(job_id: int, user: User = Depends(require_roles(ROLE_HR))):
    ok = await delete_job(job_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"detail": "Deleted"}

# Get jobs posted by a specific poster(hr user)

@app.get("/jobs/by-poster/{poster_id}", tags=["Jobs"], response_model=List[JobResponse])
async def api_jobs_by_poster(poster_id: int, user: User = Depends(require_roles(ROLE_HR, ROLE_ADMIN))):
    jobs = await find_jobs_by_poster(poster_id)
    return [JobResponse(**j.__dict__) for j in jobs]

#--- Analytics and Communications endpoints ---

#get candidate count

@app.get('/candidate-count', tags=["Candidates"])
async def get_all_candidates(
    User = Depends(require_roles(ROLE_HR)),
    db: Session = Depends(get_db),
):
    result = db.execute(text('SELECT COUNT(*) FROM candidate'))
    count = result.scalar()
    return {"candidate_count": count}

#get hired count

@app.get('/hired-count', tags=["Hires"])
async def get_hired_candidates(
    User = Depends(require_roles(ROLE_HR)),
    db: Session = Depends(get_db),
):
    result = db.execute(text("SELECT COUNT(*) FROM application WHERE status_offered = :status"), {"status": 1})
    count = result.scalar()
    return {"hired_count": count}

#get application count


@app.get('/application-count', tags=["Applications"])
async def get_application_count(
    User = Depends(require_roles(ROLE_CANDIDATE)),
    db: Session = Depends(get_db),
):
    result = db.execute(text('SELECT COUNT(*) FROM application'))
    count = result.scalar()
    return {"application_count": count}

#get interview count

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

#get job offered count

@app.get('/job-offered-count', tags=["Jobs"])
async def get_job_offered_count(
    User = Depends(require_roles(ROLE_CANDIDATE)),
    db: Session = Depends(get_db),
):
    result = db.execute(text("SELECT COUNT(*) FROM application WHERE status_offered = :status"), {"status": 1})
    count = result.scalar()
    return {"offer_count": count}

#get candidate list

@app.get('/candidate-list', tags=["Candidates"])
async def get_candidate_list(
    db: Session = Depends(get_db)
):
    # Join candidate and user tables
    result = db.execute(
        text('SELECT c.id, u.name, u.email FROM candidate c JOIN user u ON c.user_id = u.id')
    )
    candidates = result.fetchall()
    candidate_list = [
        {"id": row[0], "name": row[1], "email": row[2]}
        for row in candidates
    ]
    return {"candidates": candidate_list}
    



@app.post('/notify-candidate', tags=["Communications"])
async def notify_candidate(
    payload: NotifyCandidateRequest,
    hr_user: User = Depends(require_roles(ROLE_HR)),
    db: Session = Depends(get_db),
):
    """
    Send notification email to candidate (HR only) and persist the communication record.
    """
    try:
        print(f"[DEBUG] notify_candidate called by hr_user.id={hr_user.id} for {payload.candidate_email}")
        # send the email first
        send_email(
            recipient_email=payload.candidate_email,
            subject=payload.subject,
            body=payload.body
        )

        # find candidate user by email
        candidate_user = db.query(User).filter(User.email == payload.candidate_email).first()
        if not candidate_user:
            print("[DEBUG] Candidate user not found for email:", payload.candidate_email)
            return {"message": "Notification sent but candidate record not found, communication not recorded"}

        # Create communication record (use None for optional fields)
        comm = Communication(
            sender_id=hr_user.id,
            receiver_id=candidate_user.id,
            content=payload.body,
            timestamp=datetime.utcnow(),
            type="email",
            application_id=None
        )
        db.add(comm)
        try:
            db.commit()
        except Exception as commit_err:
            db.rollback()
            print("[DEBUG] DB commit error while saving communication:", commit_err)
            raise HTTPException(status_code=500, detail="Failed to record communication in DB")

        db.refresh(comm)
        print(f"[DEBUG] Communication saved id={comm.id} sender={comm.sender_id} receiver={comm.receiver_id}")
        return {"message": "Notification email sent successfully", "communication_id": comm.id}
    except HTTPException:
        raise
    except Exception as e:
        try:
            db.rollback()
        except:
            pass
        print("[DEBUG] Exception in notify_candidate:", type(e).__name__, e)
        raise HTTPException(status_code=500, detail=f"Failed to send email or record communication: {e}")

@app.get("/", tags=["Health Check"])
async def root():
    return {"message": "Hello World"}



@app.post("/talk", tags=["Interviews"])
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

@app.get("/temp_audio/{file_path:path}", tags=["Interviews"])
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

@app.get("/audio/{file_path:path}",tags=["Interviews"])
def serve_audio(file_path: str):
    base = os.path.abspath(AUDIO_FOLDER)
    requested_path = os.path.abspath(os.path.join(base, file_path))

    # Prevent path traversal
    if os.path.commonpath([base, requested_path]) != base:
        raise HTTPException(status_code=403, detail="Forbidden")

    if not os.path.exists(requested_path) or not os.path.isfile(requested_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(requested_path, media_type="application/octet-stream")


# Ai Job Description
@app.post("/generate-job-summary", tags=["Job Description"])
async def generate_job_summary_endpoint(
    request: Request,
    ):
    
    try:
        data = await request.json()
        print("Received data for job summary generation:", data)
        
        print("Before extracting parameters")
        job_title = data.get("job_title")
        department = data.get("department")
        experience_level = data.get("experience_level")
        required_skills = data.get("required_skills", [])
        company_culture_keywords = data.get("company_culture_keywords", [])
        location = data.get("location")
        print("Before API key retrieval")
        api_key = os.getenv("GROQ_API_KEY")
        print(api_key)
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not set in environment")

        summary = create_job_summary(
            job_title=job_title,
            department=department,
            experience_level=experience_level,
            required_skills=required_skills,
            company_culture_keywords=company_culture_keywords,
            location=location,
            api_key=api_key,
        )
        return {"job_summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate job summary: {e}")


@app.post("/create-calendar-event", tags=["Calendar"])
async def create_calendar_event_endpoint(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Create a calendar event. HR users only."""
    # Try to authenticate user from token
    user = None
    if token:
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == int(user_id)).first()
        except (TokenValidationError, ValueError):
            pass
    
    # Check if user is HR
    if not user or user.role != ROLE_HR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR users can create calendar events",
        )
    
    try:
        create_calendar_event()
        webbrowser.open("https://calendar.google.com/calendar/u/0/r")
        return {"message": "Calendar event created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create calendar event: {e}")

@app.post("/resumes/upload", tags=["Resumes"])
async def upload_resume(
    file: UploadFile = File(...),
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Upload resume (pdf/docx/doc), parse it with ResumeParser, and save JSON to user.resume_json."""
    if not file or file.filename == "":
        raise HTTPException(status_code=400, detail="No file provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    temp_dir = tempfile.mkdtemp(prefix="resume_")
    tmp_path = os.path.join(temp_dir, file.filename)

    try:
        content = await file.read()
        with open(tmp_path, "wb") as f:
            f.write(content)

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not set in environment")

        parser = ResumeParser(api_key=api_key)
        parsed = await asyncio.to_thread(parser.parse_resume, tmp_path)

        # Authenticate user from token
        user = None
        if token:
            try:
                payload = decode_access_token(token)
                user_id = payload.get("sub")
                print(f"[DEBUG] Token decoded. user_id: {user_id}")
                if user_id:
                    user = db.query(User).filter(User.id == int(user_id)).first()
                    print(f"[DEBUG] User found: {user.email if user else 'None'}")
            except (TokenValidationError, ValueError) as e:
                print(f"[DEBUG] Token validation error: {e}")
                pass

        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        # Save parsed JSON
        user.resume_json = json.dumps(parsed)
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"[DEBUG] Resume JSON saved for user {user.id}")

        print("\n=== Extracted Resume Data ===")
        print(json.dumps(parsed, indent=2, ensure_ascii=False))

        # Check if there are jobs to score against
        job_count = db.query(Job).filter(Job.status == "open").count()
        print(f"[DEBUG] Found {job_count} active jobs")

        # Automatically process resume and generate scores
        print(f"[DEBUG] Starting automatic score generation for user {user.id}...")
        try:
            scoring_result = await process_resume_and_score(user=user, db=db)
            print(f"[DEBUG] Scoring result: {scoring_result}")
        except Exception as score_err:
            print(f"[DEBUG] Scoring error: {score_err}")
            traceback.print_exc()

        return {
            "message": "Resume parsed, saved, and scored successfully",
            "data": parsed
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"[DEBUG] Exception in upload_resume: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except Exception:
            pass

@app.post("/scores", tags=["Scores"])
async def update_score(
    score_data: ScoreUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update or create a candidate's score for a job. HR/Admin only."""
    if user.role not in [ROLE_HR, ROLE_ADMIN]:
        raise HTTPException(status_code=403, detail="Only HR/Admin can update scores")
    
    try:
        score = create_or_update_score(
            db,
            score_data.candidate_id,
            score_data.job_id,
            score_data.score
        )
        return {"message": "Score updated", "score": score.score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/scores/job/{job_id}", tags=["Scores"])
async def get_job_scores(
    job_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all candidate scores for a job."""
    scores = get_scores_for_job(db, job_id)
    return {"job_id": job_id, "scores": scores}


@app.get("/scores/candidate/{candidate_id}", tags=["Scores"])
async def get_candidate_scores(
    candidate_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all scores for a candidate."""
    scores = get_scores_for_candidate(db, candidate_id)
    return {"candidate_id": candidate_id, "scores": scores}

@app.post("/resumes/process-and-score", tags=["Resumes"])
async def process_resume_and_score(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Process the candidate's resume_json and compare it with all jobs.
    Generate similarity scores and store them in the scores table.
    """
    # Check if user has resume_json
    if not user.resume_json:
        raise HTTPException(status_code=400, detail="No resume found for this user")
    
    try:
        # Parse resume JSON
        resume_data = json.loads(user.resume_json)
        
        # Get all active jobs
        jobs = db.query(Job).filter(Job.status == "open").all()
        
        if not jobs:
            return {"message": "No active jobs found", "scores_created": 0}
        
        api_key = os.getenv("GROQ_API")
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not set")
        
        # Initialize Groq client
        groq_client = Groq(api_key=api_key)
        scores_created = 0
        
        # Compare resume with each job
        for job in jobs:
            try:
                # Create temporary job JSON
                job_data = {
                    "id": job.id,
                    "title": job.title,
                    "description": job.description,
                    "skills_required": job.skills_required,
                    "qualification": job.qualification,
                    "location": job.location,
                    "employment_type": job.employment_type,
                }
                
                # Create prompt for LLM comparison
                prompt = f"""You are an expert recruiter. Compare this resume with the job description and provide ONLY a similarity score (0-100).

Resume:
{json.dumps(resume_data, indent=2)}

Job Description:
{json.dumps(job_data, indent=2)}

Analyze the match based on:
1. Skills alignment
2. Experience relevance
3. Education requirements
4. Qualifications match

Respond with ONLY a JSON object like this (no other text):
{{"similarity_score": <number between 0-100>}}"""

                print(f"[DEBUG] Calling Groq API for job {job.id}...")
                
                # Call Groq API
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert recruiter. Always respond with valid JSON only."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    model="llama-3.3-70b-versatile",
                    temperature=0.3,
                    max_tokens=100
                )
                
                # Parse response
                response_text = chat_completion.choices[0].message.content.strip()
                print(f"[DEBUG] Groq response for job {job.id}: {response_text}")
                result = json.loads(response_text)
                similarity_score = result.get("similarity_score", 0)
                
                # Ensure score is between 0-100
                similarity_score = max(0, min(100, float(similarity_score)))
                
                # Create or update score in database
                score = create_or_update_score(
                    db,
                    user.id,
                    job.id,
                    similarity_score
                )
                
                print(f"[DEBUG] Score created for job {job.id}: {similarity_score}")
                scores_created += 1
                
            except json.JSONDecodeError as je:
                print(f"[DEBUG] JSON decode error for job {job.id}: {je}")
                continue
            except Exception as je:
                print(f"[DEBUG] Error processing job {job.id}: {type(je).__name__}: {je}")
                traceback.print_exc()
                continue
        
        return {
            "message": "Resume processed and scores generated",
            "candidate_id": user.id,
            "scores_created": scores_created,
            "total_jobs": len(jobs)
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid resume JSON format")
    except Exception as e:
        print(f"[DEBUG] Exception in process_resume_and_score: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/users/{user_id}", tags=["Users"])
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user details by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


from typing import Optional
from pydantic import BaseModel
from backend.databases.models import Candidate
from backend.roles import ROLE_CANDIDATE

class CandidateUpdate(BaseModel):
    resume_url: Optional[str] = None
    skills: Optional[str] = None
    experience: Optional[str] = None
    education: Optional[str] = None
    profile_summary: Optional[str] = None

@app.get("/candidates/me", tags=["Candidates"])
async def get_my_candidate_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return candidate profile for the authenticated user. Create default row if missing."""
    if current_user.role != ROLE_CANDIDATE:
        raise HTTPException(status_code=403, detail="Only candidates have candidate profiles")

    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        candidate = Candidate(
            user_id=current_user.id,
            candidate_id=current_user.id,
            resume_url="",
            skills="",
            experience="",
            education="",
            profile_summary=""
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

    return {
        "id": candidate.id,
        "user_id": candidate.user_id,
        "resume_url": candidate.resume_url,
        "skills": candidate.skills,
        "experience": candidate.experience,
        "education": candidate.education,
        "profile_summary": candidate.profile_summary,
    }

@app.put("/candidates/me", tags=["Candidates"])
async def update_my_candidate_profile(
    payload: CandidateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update candidate profile for authenticated user. Uses PUT semantics (replace/set provided fields)."""
    if current_user.role != ROLE_CANDIDATE:
        raise HTTPException(status_code=403, detail="Only candidates can update profile")

    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        candidate = Candidate(
            user_id=current_user.id,
            candidate_id=current_user.id,
            resume_url="",
            skills="",
            experience="",
            education="",
            profile_summary=""
        )
        db.add(candidate)

    update_data = payload.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(candidate, k, v)

    try:
        db.commit()
        db.refresh(candidate)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save candidate profile")

    return {
        "message": "Candidate profile updated",
        "candidate": {
            "id": candidate.id,
            "user_id": candidate.user_id,
            "resume_url": candidate.resume_url,
            "skills": candidate.skills,
            "experience": candidate.experience,
            "education": candidate.education,
            "profile_summary": candidate.profile_summary,
        },
    }

@app.post("/schedule-interview", tags=["Interviews"])
async def schedule_interview(
    payload: InterviewRequest,
    db: Session = Depends(get_db),
):
    candidate = db.query(User).filter(User.id == payload.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    scheduled_time = payload.scheduled_time or (datetime.utcnow() + timedelta(days=5))

    # Call with correct arguments
    event_id = create_calendar_event(candidate.email, scheduled_time)

    interview = Interview(
        candidate_id=candidate.id,
        hr_id=None,
        scheduled_time=scheduled_time,
        calendar_event_id=event_id,
        status="scheduled"
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    return {"message": "Interview scheduled", "interview_id": interview.id}

@app.post("/reschedule-interview", tags=["Interviews"])
async def reschedule_interview(
    payload: InterviewRescheduleRequest,
    candidate_user: User = Depends(require_roles(ROLE_CANDIDATE)),
    db: Session = Depends(get_db),
):
    interview = db.query(Interview).filter(
        Interview.id == payload.interview_id,
        Interview.candidate_id == candidate_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Update Google Calendar event here
    create_calendar_event(
        event_id=interview.calendar_event_id,
        new_time=payload.new_time
    )

    interview.scheduled_time = payload.new_time
    interview.status = "rescheduled"
    db.commit()
    db.refresh(interview)
    return {"message": "Interview rescheduled", "interview_id": interview.id}

@app.get("/recent-communications", tags=["Communications"])
async def get_recent_communications(db: Session = Depends(get_db)):
    """
    Return the last 3 communications, newest first.
    """
    # Join communication with user table to get candidate name/email
    results = (
        db.query(Communication, User)
        .join(User, Communication.receiver_id == User.id)
        .order_by(Communication.timestamp.desc())
        .limit(3)
        .all()
    )
    out = []
    for comm, user in results:
        out.append({
            "id": comm.id,
            "name": user.name,
            "email": user.email,
            "snippet": comm.content[:120] + ("..." if len(comm.content) > 120 else ""),
            "time": comm.timestamp.strftime("%Y-%m-%d %H:%M"),
            "tags": [comm.type.capitalize()],
            "color": "text-blue-600",
        })
    return {"recent": out}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
