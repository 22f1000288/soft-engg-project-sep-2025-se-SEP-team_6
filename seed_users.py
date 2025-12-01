import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.databases.models import SessionLocal, User, Job, Application, Scores
from backend.utils import hash_password
from datetime import datetime, timedelta
import json

def seed_database():
    """Seed the database with sample users, jobs, applications, and scores."""
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(Scores).delete()
        db.query(Application).delete()
        db.query(Job).delete()
        db.query(User).delete()
        db.commit()
        print("✓ Cleared existing data")
        
        # Create users
        admin_user = User(
            email="admin@company.com",
            password=hash_password("admin123"),
            role="admin",
            name="Admin User",
            location="New York, NY"
        )
        
        hr_user = User(
            email="msr@company.com",
            password=hash_password("hr123"),
            role="hr",
            name="MSR",
            location="San Francisco, CA"
        )
        
        candidate1 = User(
            email="john@gmail.com",
            password=hash_password("candidate123"),
            role="candidate",
            name="John Doe",
            location="New Delhi, India",
            resume_json=json.dumps({
                "personal_info": {
                    "name": "John Doe",
                    "email": "john@gmail.com",
                    "phone": "+91 9876543210"
                },
                "sections": {
                    "skills": ["Python", "JavaScript", "React", "SQL"],
                    "experience": ["5 years as Full Stack Developer"]
                }
            })
        )
        
        candidate2 = User(
            email="jane@gmail.com",
            password=hash_password("candidate123"),
            role="candidate",
            name="Jane Smith",
            location="Mumbai, India",
            resume_json=json.dumps({
                "personal_info": {
                    "name": "Jane Smith",
                    "email": "jane@gmail.com",
                    "phone": "+91 9876543211"
                },
                "sections": {
                    "skills": ["Java", "Spring Boot", "MySQL", "Docker"],
                    "experience": ["3 years as Backend Developer"]
                }
            })
        )
        
        candidate3 = User(
            email="bob@gmail.com",
            password=hash_password("candidate123"),
            role="candidate",
            name="Bob Wilson",
            location="Bangalore, India",
            resume_json=json.dumps({
                "personal_info": {
                    "name": "Bob Wilson",
                    "email": "bob@gmail.com",
                    "phone": "+91 9876543212"
                },
                "sections": {
                    "skills": ["Python", "Data Science", "Machine Learning", "TensorFlow"],
                    "experience": ["2 years as ML Engineer"]
                }
            })
        )
        
        db.add_all([admin_user, hr_user, candidate1, candidate2, candidate3])
        db.commit()
        print("✓ Created 5 users (1 admin, 1 HR, 3 candidates)")
        
        # Create jobs
        job1 = Job(
            posted_by=hr_user.id,
            title="Senior Full Stack Developer",
            description="Looking for an experienced Full Stack Developer with expertise in React and Node.js. Must have 5+ years of experience.",
            skills_required="Python, JavaScript, React, Node.js, SQL, Docker",
            qualification="B.Tech in Computer Science",
            location="San Francisco, CA",
            employment_type="Full-time",
            status="open"
        )
        
        job2 = Job(
            posted_by=hr_user.id,
            title="Backend Developer",
            description="Seeking a Backend Developer proficient in Java and Spring Boot. Experience with microservices and cloud deployment required.",
            skills_required="Java, Spring Boot, MySQL, Kubernetes, Docker",
            qualification="B.Tech in CS or equivalent",
            location="Bangalore, India",
            employment_type="Full-time",
            status="open"
        )
        
        job3 = Job(
            posted_by=hr_user.id,
            title="Machine Learning Engineer",
            description="We're hiring ML Engineers to build scalable AI solutions. Strong background in deep learning and data science required.",
            skills_required="Python, TensorFlow, PyTorch, Data Science, Machine Learning",
            qualification="M.Tech in AI/ML or equivalent",
            location="New Delhi, India",
            employment_type="Full-time",
            status="open"
        )
        
        db.add_all([job1, job2, job3])
        db.commit()
        print("✓ Created 3 job postings")
        
        # Create applications
        app1 = Application(
            candidate_id=candidate1.id,
            job_id=job1.id,
            status_applied=True,
            status_shortlisted=True,
            status_interviewed=False,
            status_offered=False,
            status_rejected=False,
            score=85.5,
            submitted_at=datetime.utcnow()
        )
        
        app2 = Application(
            candidate_id=candidate2.id,
            job_id=job2.id,
            status_applied=True,
            status_shortlisted=True,
            status_interviewed=True,
            status_offered=True,
            status_rejected=False,
            score=92.0,
            submitted_at=datetime.utcnow()
        )
        
        app3 = Application(
            candidate_id=candidate3.id,
            job_id=job3.id,
            status_applied=True,
            status_shortlisted=False,
            status_interviewed=False,
            status_offered=False,
            status_rejected=True,
            score=45.0,
            submitted_at=datetime.utcnow()
        )
        
        db.add_all([app1, app2, app3])
        db.commit()
        print("✓ Created 3 applications")
        
        # Create scores
        score1 = Scores(
            candidate_id=candidate1.id,
            job_id=job1.id,
            score=88.5
        )
        
        score2 = Scores(
            candidate_id=candidate1.id,
            job_id=job2.id,
            score=65.0
        )
        
        score3 = Scores(
            candidate_id=candidate2.id,
            job_id=job1.id,
            score=72.0
        )
        
        score4 = Scores(
            candidate_id=candidate2.id,
            job_id=job2.id,
            score=95.0
        )
        
        score5 = Scores(
            candidate_id=candidate3.id,
            job_id=job3.id,
            score=89.5
        )
        
        score6 = Scores(
            candidate_id=candidate3.id,
            job_id=job1.id,
            score=52.0
        )
        
        db.add_all([score1, score2, score3, score4, score5, score6])
        db.commit()
        print("✓ Created 6 scores")
        
        print("\n✅ Database seeded successfully!")
        print(f"\nTest credentials:")
        print(f"Admin: admin@company.com / admin123")
        print(f"HR: msr@company.com / hr123")
        print(f"Candidate 1: john@gmail.com / candidate123")
        print(f"Candidate 2: jane@gmail.com / candidate123")
        print(f"Candidate 3: bob@gmail.com / candidate123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()