import os
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .models import User, Application

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


# Job controller functions
# *TODO: Implement job-related controller functions here*


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
