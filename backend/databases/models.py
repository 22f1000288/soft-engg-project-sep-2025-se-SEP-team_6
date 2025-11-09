import os
from sqlalchemy import create_engine, event
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the absolute path to the current directory (where this file lives)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Build a full absolute path for the database file
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'users.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# enable WAL and foreign_keys on each sqlite connection
@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    name = Column(String, nullable=False)

class Application(Base):

    __tablename__ = 'application'
    id = Column(Integer, unique=True, nullable=False)
    candidate_id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, nullable=True)
    status_applied = Column(Boolean, nullable=True)
    status_shortlisted = Column(Boolean, nullable=True)
    status_interviewed = Column(Boolean, nullable=True)
    status_offered = Column(Boolean, nullable=True)
    status_rejected = Column(Boolean, nullable=True)
    score = Column(Float, nullable=True)
    submitted_at = Column(DateTime, nullable=True)

class Job(Base):
    __tablename__ = 'job'
    id = Column(Integer, primary_key=True, index=True)
    posted_by = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    skills_required = Column(String, nullable=False)
    qualification = Column(String, nullable=False)
    location = Column(String, nullable=False)
    employment_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

class Analytics(Base):
    __tablename__ = 'analytics'
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    data = Column(String, nullable=False)
    generated_at = Column(DateTime, nullable=False)
    user_id = Column(Integer, nullable=False)

class Candidate(Base):
    __tablename__ = 'candidate'
    id = Column(Integer, primary_key=True, index=True)
    resume_url = Column(String, nullable=False)
    skills = Column(String, nullable=False)
    experience = Column(String, nullable=False)
    education = Column(String, nullable=False)
    profile_summary = Column(String, nullable=False)
    user_id = Column(Integer, nullable=False)
    candidate_id = Column(Integer, nullable=False)

class Communication(Base):
    __tablename__ = 'communication'
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, nullable=False)
    receiver_id = Column(Integer, nullable=False)
    message_id = Column(Integer, nullable=False)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    type = Column(String, nullable=False)
    application_id = Column(Integer, nullable=False)

class Recruiter(Base):
    __tablename__ = 'recruiter'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    organization = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    department = Column(String, nullable=False)
    permissions_level = Column(String, nullable=False)


# Create the table
Base.metadata.create_all(bind=engine)

# Insert admin user if not exists
def init_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@company.com").first()
    if not admin:
        admin = User(
            id=1,
            email="admin@company.com",
            password="admin123",
            role="admin",
            name="Admin User"
        )
        db.add(admin)
        db.commit()
    db.close()

if __name__ == "__main__":
    init_admin()


    