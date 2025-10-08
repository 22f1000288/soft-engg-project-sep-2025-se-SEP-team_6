from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///backend/databases/users.db"

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