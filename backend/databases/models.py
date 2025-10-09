import os
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the absolute path to the current directory (where this file lives)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Build a full absolute path for the database file
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'users.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    name = Column(String, nullable=False)

class Application(Base):

    __tablename__ = 'applications'
    id = Column(Integer, primary_key=True, index=True)
    candidateName = Column(String, nullable=False)
    email = Column(String, nullable=False)
    position = Column(String, nullable=False)
    status = Column(String, nullable=False)
    appliedDate = Column(String, nullable=False)

def add_user(user: User):
    db = SessionLocal()
    db.add(user)
    db.commit()
    db.close()

def add_application(application: Application):
    db = SessionLocal()
    db.add(application)
    db.commit()
    db.close()

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

init_admin()

if __name__ == "__main__":
    add_user(User(id=2, email="hr@company.com", password="hr123", role="hr", name="HR Manager"))
    add_user(User(id=3, email="candidate@example.com", password="candidate123", role="candidate", name="John Doe"))
    add_application(Application(id=1, candidateName="John Doe", email="candidate@example.com", position="Software Engineer", status="under-review", appliedDate="2025-10-01"))
    add_application(Application(id=2, candidateName="Jane Smith", email="jane@example.com", position="Product Manager", status="approved", appliedDate="2025-09-28"))
    add_application(Application(id=3, candidateName="Mike Johnson", email="mike@example.com", position="UX Designer", status="rejected", appliedDate="2025-09-25"))

    