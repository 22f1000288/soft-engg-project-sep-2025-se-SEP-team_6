import os
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .models import User, Application, Job
from sqlalchemy import or_

# Get the absolute path to the current directory (where this file lives)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Build a full absolute path for the database file
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'users.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# User controller functions
async def add_user(user: User):
    db = SessionLocal()
    db.add(user)
    db.commit()
    db.close()


# Application controller functions
async def add_application(application: Application):
    db = SessionLocal()
    db.add(application)
    db.commit()
    db.close()


async def create_application(candidate_id: int, job_id: int):
    db = SessionLocal()
    try:
        # Check whether the candidate already applied to this job
        existing = db.query(Application).filter(
            Application.candidate_id == candidate_id,
            Application.job_id == job_id,
        ).first()
        if existing:
            return {"status": "exists", "existing_job_id": getattr(existing, 'job_id', None)}

        app = Application(
            candidate_id=candidate_id,
            job_id=job_id,
            status_applied=True,
            submitted_at=datetime.utcnow(),
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        return {"status": "created", "application": app}
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# Additional helpers used by API layer
async def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        return [
            {"id": u.id, "email": u.email, "role": u.role, "name": u.name}
            for u in users
        ]
    finally:
        db.close()


async def list_applications_for_admin():
    db = SessionLocal()
    try:
        apps = db.query(Application).all()
        return [
            {
                "id": a.id,
                "candidate_id": a.candidate_id,
                "job_id": a.job_id,
                "status_applied": a.status_applied,
                "status_shortlisted": a.status_shortlisted,
                "status_interviewed": a.status_interviewed,
                "status_offered": a.status_offered,
                "status_rejected": a.status_rejected,
                "score": a.score,
                "submitted_at": a.submitted_at,
            }
            for a in apps
        ]
    finally:
        db.close()


async def get_job_applications_with_candidate(job_id: int):
    db = SessionLocal()
    try:
        rows = (
            db.query(Application, User)
            .join(User, User.id == Application.candidate_id)
            .filter(Application.job_id == job_id)
            .all()
        )
        result = []
        for app_rec, candidate in rows:
            result.append(
                {
                    "application_id": getattr(app_rec, 'id', None),
                    "candidate_id": app_rec.candidate_id,
                    "job_id": app_rec.job_id,
                    "status_applied": app_rec.status_applied,
                    "submitted_at": app_rec.submitted_at,
                    "candidate": {"id": candidate.id, "email": candidate.email, "name": candidate.name},
                }
            )
        return result
    finally:
        db.close()


async def get_candidate_applications(candidate_id: int):
    db = SessionLocal()
    try:
        rows = (
            db.query(Application, Job)
            .join(Job, Job.id == Application.job_id)
            .filter(Application.candidate_id == candidate_id)
            .order_by(Application.submitted_at.desc())
            .all()
        )
        out = []
        for app_rec, job in rows:
            if getattr(app_rec, 'status_offered', False):
                status = "Offered"
            elif getattr(app_rec, 'status_interviewed', False):
                status = "Interview"
            elif getattr(app_rec, 'status_shortlisted', False):
                status = "Shortlisted"
            elif getattr(app_rec, 'status_rejected', False):
                status = "Rejected"
            elif getattr(app_rec, 'status_applied', False):
                status = "Applied"
            else:
                status = "Unknown"

            out.append(
                {
                    "application_id": getattr(app_rec, 'id', None),
                    "job_id": getattr(job, 'id', None),
                    "job_title": getattr(job, 'title', None),
                    "location": getattr(job, 'location', None),
                    "submitted_at": getattr(app_rec, 'submitted_at', None),
                    "status": status,
                    "status_applied": bool(getattr(app_rec, 'status_applied', False)),
                    "status_interviewed": bool(getattr(app_rec, 'status_interviewed', False)),
                    "status_offered": bool(getattr(app_rec, 'status_offered', False)),
                    "status_rejected": bool(getattr(app_rec, 'status_rejected', False)),
                }
            )
        return out
    finally:
        db.close()


async def withdraw_application_by_candidate(application_id: int, candidate_id: int):
    db = SessionLocal()
    try:
        app_rec = db.query(Application).filter(Application.id == application_id).first()
        if not app_rec:
            return {"ok": False, "reason": "not_found"}
        if app_rec.candidate_id != candidate_id:
            return {"ok": False, "reason": "forbidden"}
        db.delete(app_rec)
        db.commit()
        return {"ok": True}
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# Job controller functions

# Create a new job record
async def create_job(job: Job):

    db = SessionLocal()
    try:
        db.add(job)
        db.commit()
        db.refresh(job)
        return job
    finally:
        db.close()


async def get_job(job_id: int):
    """Retrieve a job by its id. Returns None if not found."""
    db = SessionLocal()
    try:
        return db.query(Job).filter(Job.id == job_id).first()
    finally:
        db.close()


async def list_jobs(limit: int = 100, offset: int = 0):

    db = SessionLocal()
    try:
        return (
            db.query(Job)
            .order_by(Job.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )
    finally:
        db.close()


async def update_job(job_id: int, updates: dict):

    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None
        for key, value in updates.items():
            if hasattr(job, key):
                setattr(job, key, value)
        db.add(job)
        db.commit()
        db.refresh(job)
        return job
    finally:
        db.close()


async def delete_job(job_id: int):
    """Delete a job by id. Returns True if deleted, False if not found."""
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return False
        db.delete(job)
        db.commit()
        return True
    finally:
        db.close()


async def find_jobs_by_poster(poster_id: int):
    """Return all jobs posted by a given user id (poster)."""
    db = SessionLocal()
    try:
        return db.query(Job).filter(Job.posted_by == poster_id).all()
    finally:
        db.close()


async def search_jobs(query: str = None, location: str = None, limit: int = 50):
    db = SessionLocal()
    try:
        q = db.query(Job)
        if query:
            like = f"%{query}%"
            q = q.filter(
                or_(
                    Job.title.ilike(like),
                    Job.description.ilike(like),
                    Job.skills_required.ilike(like),
                )
            )
        if location:
            loc_like = f"%{location}%"
            q = q.filter(Job.location.ilike(loc_like))
        return q.order_by(Job.created_at.desc()).limit(limit).all()
    finally:
        db.close()


# Analytics controller functions
# TODO: Implement analytics-related controller functions here

# Candidate controller functions
# TODO: Implement candidate-related controller functions here

# Communication controller functions
# TODO: Implement communication-related controller functions here

# Recruiter controller functions
# TODO: Implement recruiter-related controller functions here

# Additional controller functions can be added below as needed


if __name__ == "__main__":
    add_user(User(id=2, email="hr@company.com", password="hr123", role="hr", name="HR Manager"))
    add_user(User(id=3, email="candidate@example.com", password="candidate123", role="candidate", name="John Doe"))
    add_application(Application(id=1, candidateName="John Doe", email="candidate@example.com", position="Software Engineer", status="under-review", appliedDate="2025-10-01"))
    add_application(Application(id=2, candidateName="Jane Smith", email="jane@example.com", position="Product Manager", status="approved", appliedDate="2025-09-28"))
    add_application(Application(id=3, candidateName="Mike Johnson", email="mike@example.com", position="UX Designer", status="rejected", appliedDate="2025-09-25"))
