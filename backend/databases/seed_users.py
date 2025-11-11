from backend.databases.models import SessionLocal, User, Candidate, Recruiter
from backend.roles import ROLE_ADMIN, ROLE_CANDIDATE, ROLE_HR
from backend.utils import hash_password

SEED_USERS = [
    {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "role": ROLE_ADMIN,
        "password": "admin123",
    },
    {
        "id": 2,
        "name": "MSR",
        "email": "msr@iitm.com",
        "role": ROLE_HR,
        "password": "test123",
    },
    {
        "id": 3,
        "name": "Shamanthak",
        "email": "shamanthakreddy@gmail.com",
        "role": ROLE_CANDIDATE,
        "password": "test123",
    },
]

SEED_CANDIDATES = [
    {
        "id": 1,
        "resume_url": "https://shamanthak-portfolio.vercel.app/",
        "skills": "Python, FastAPI, PostgreSQL",
        "experience": "5 years",
        "education": "B.Tech - Computer Science",
        "profile_summary": "Backend engineer focused on building reliable APIs for HR tech.",
        "user_id": 3,
        "candidate_id": 1001,
    }
]

SEED_RECRUITERS = [
    {
        "id": 1,
        "user_id": 2,
        "organization": "IITM",
        "designation": "Senior HR Manager",
        "department": "HR",
        "permissions_level": "level_2",
    }
]


def _seed_users(db: SessionLocal) -> None:
    for payload in SEED_USERS:
        user = db.query(User).filter(User.id == payload["id"]).first()
        hashed_pw = hash_password(payload["password"])
        if user:
            user.name = payload["name"]
            user.email = payload["email"]
            user.role = payload["role"]
            user.password = hashed_pw
            continue
        user = User(
            id=payload["id"],
            name=payload["name"],
            email=payload["email"],
            role=payload["role"],
            password=hashed_pw,
        )
        db.add(user)


def _seed_candidates(db: SessionLocal) -> None:
    for payload in SEED_CANDIDATES:
        candidate = db.query(Candidate).filter(Candidate.id == payload["id"]).first()
        if candidate:
            for key, value in payload.items():
                setattr(candidate, key, value)
            continue
        candidate = Candidate(**payload)
        db.add(candidate)


def _seed_recruiters(db: SessionLocal) -> None:
    for payload in SEED_RECRUITERS:
        recruiter = db.query(Recruiter).filter(Recruiter.id == payload["id"]).first()
        if recruiter:
            for key, value in payload.items():
                setattr(recruiter, key, value)
            continue
        recruiter = Recruiter(**payload)
        db.add(recruiter)


def seed_all() -> None:
    """Insert baseline data for users, candidates, and recruiters."""
    db = SessionLocal()
    try:
        _seed_users(db)
        _seed_candidates(db)
        _seed_recruiters(db)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
