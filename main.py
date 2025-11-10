import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.databases.models import SessionLocal, User, Application
from backend.utils import verify_password, hash_password

app = FastAPI(
    title="TalentForm HRMS API",
    description="API documentation for HRMS application",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
        ],
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic model for login
class Login(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str

@app.get("/users", tags=["Users"])
async def read_users(db: Session = Depends(get_db)):
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
async def read_apps(db: Session = Depends(get_db)):
    apps = db.query(Application).all()
    return [
        {
            "id": app.id,
            "candidate_id": app.candidate_id,
            "job_id": app.job_id,
            "status_applied": app.status_applied,
            "status_shortlisted": app.status_shortlisted,
            "status_interviewed": app.status_interviewed,
            "status_offered": app.status_offered,
            "status_rejected": app.status_rejected,
            "score": app.score,
            "submitted_at": app.submitted_at
        }
        for app in apps
    ]

@app.post("/login", tags=["Authentication"])
async def login(request: Login, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == request.email).first()
        # verify_password should accept (plain_password, hashed_password) and return True/False
        if user and verify_password(request.password, user.password):
            return {
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "name": user.name
                }
            }
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        raise
    except Exception as e:
        print("Login error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/signup", tags=["Authentication"])
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
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
    return {
        "message": "Signup successful",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "role": new_user.role,
            "name": new_user.name
        }
    }

@app.get("/active-jobs",tags=["Jobs"])
async def get_active_jobs(db: Session = Depends(get_db)):
    # Use named parameters in the SQL query
    result = db.execute(text('SELECT COUNT(*) FROM job WHERE status = :status'), {"status": "active"})
    count = result.scalar()
    return {"active_jobs_count": count}

@app.get('/candidate-count', tags=["Candidates"])
async def get_all_candidates(db: Session = Depends(get_db)):
    result = db.execute(text('SELECT COUNT(*) FROM candidate'))
    count = result.scalar()
    return {"candidate_count": count}

# @app.get('/interview-count', tags=["Interviews"])
# async def get_all_interviews(db: Session = Depends(get_db)):
#     result = db.execute(text('SELECT COUNT(*) FROM candidate'))
#     count = result.scalar()
#     return {"interview_count": count}

@app.get('/hired-count', tags=["Hires"])
async def get_hired_candidates(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT COUNT(*) FROM application WHERE status_offered = :status"), {"status": 1})
    count = result.scalar()
    return {"hired_count": count}

@app.get('/application-count', tags=["Applications"])
async def get_application_count(db: Session = Depends(get_db)):
    result = db.execute(text('SELECT COUNT(*) FROM application'))
    count = result.scalar()
    return {"application_count": count}

@app.get('/interview-count', tags=["Interviews"])
async def get_interview_count(db: Session = Depends(get_db)):
    result = db.execute(text('SELECT COUNT(*) FROM interview'))
    count = result.scalar()
    return {"interview_count": count}

@app.get('/job-offered-count', tags=["Jobs"])
async def get_job_offered_count(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT COUNT(*) FROM application WHERE status_offered = :status"), {"status": 1})
    count = result.scalar()
    return {"offer_count": count}

@app.get('/candidate-list', tags=["Candidates"])
async def get_candidate_list(db: Session = Depends(get_db)):
    result = db.execute(text('SELECT c.id, u.name from candidate c JOIN user u ON c.user_id = u.id'))
    candidates = result.fetchall()
    candidate_list = [{"id": row[0], "name": row[1]} for row in candidates]
    return {"candidates": candidate_list}
    

@app.get("/", tags=["Health Check"])
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)