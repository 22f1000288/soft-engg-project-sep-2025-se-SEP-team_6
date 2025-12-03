#!/usr/bin/env python3
"""
Demo Data Population Script for HRMS Database

Run this script from the project root to populate your database with sample data.
Usage: python populate_demo_data.py
"""

import os
import sys
from datetime import datetime, timedelta
import random

from backend.databases.models import SessionLocal, User, Job, Candidate, Application
from backend.roles import ROLE_HR, ROLE_CANDIDATE
from backend.utils import hash_password

def populate_demo_data():
    """Populate database with comprehensive demo data"""
    print("🚀 Starting demo data population...")
    
    db = SessionLocal()
    
    try:
        # Clear existing demo data (keep admin)
        print("🧹 Clearing existing demo data...")
        db.query(Application).delete()
        db.query(Candidate).filter(Candidate.user_id > 1).delete()
        db.query(Job).delete() 
        db.query(User).filter(User.id > 1).delete()
        db.commit()
        
        # Create HR users
        print("👥 Creating HR users...")
        hr_users_data = [
            {"name": "Sarah Johnson", "email": "sarah.johnson@company.com"},
            {"name": "Michael Chen", "email": "michael.chen@company.com"},
            {"name": "Emily Rodriguez", "email": "emily.rodriguez@company.com"}
        ]
        
        hr_users = []
        for hr_data in hr_users_data:
            hr_user = User(
                name=hr_data["name"],
                email=hr_data["email"],
                password=hash_password("hr123"),
                role=ROLE_HR
            )
            db.add(hr_user)
            db.flush()
            hr_users.append(hr_user)
        
        # Create jobs
        print("💼 Creating job postings...")
        jobs_data = [
            {
                "title": "Senior Frontend Developer",
                "description": "Develop user-facing web applications using modern JavaScript frameworks like React and Vue.js.",
                "skills_required": "React, JavaScript, TypeScript, HTML5, CSS3, Redux",
                "qualification": "Bachelor's degree in Computer Science, 3+ years frontend experience",
                "location": "San Francisco, CA",
                "employment_type": "Full-time"
            },
            {
                "title": "Backend Developer", 
                "description": "Build scalable server-side applications and APIs using Python and cloud technologies.",
                "skills_required": "Python, FastAPI, PostgreSQL, Docker, AWS, REST APIs",
                "qualification": "Bachelor's degree in Computer Science, 2+ years backend experience",
                "location": "Seattle, WA",
                "employment_type": "Full-time"
            },
            {
                "title": "Product Manager",
                "description": "Lead product strategy and roadmap for our core platform and user experience.",
                "skills_required": "Product Strategy, Agile, User Research, Analytics, Roadmap Planning",
                "qualification": "MBA or equivalent, 3+ years product management experience",
                "location": "New York, NY", 
                "employment_type": "Full-time"
            },
            {
                "title": "UX/UI Designer",
                "description": "Create intuitive user interfaces and conduct user research for web and mobile apps.",
                "skills_required": "Figma, Sketch, User Research, Prototyping, Design Systems",
                "qualification": "Bachelor's in Design, 2+ years UX/UI design experience",
                "location": "Austin, TX",
                "employment_type": "Full-time"
            },
            {
                "title": "Data Scientist",
                "description": "Analyze datasets and build ML models to derive business insights and predictions.",
                "skills_required": "Python, R, Machine Learning, Statistics, TensorFlow, SQL",
                "qualification": "Master's in Data Science, 2+ years analytics experience",
                "location": "Boston, MA",
                "employment_type": "Full-time"
            },
            {
                "title": "DevOps Engineer",
                "description": "Manage cloud infrastructure and implement CI/CD pipelines for system reliability.",
                "skills_required": "AWS, Docker, Kubernetes, Jenkins, Terraform, Linux",
                "qualification": "Bachelor's in Computer Science, 3+ years DevOps experience",
                "location": "Denver, CO",
                "employment_type": "Full-time"
            },
            {
                "title": "Mobile App Developer",
                "description": "Develop native and cross-platform mobile applications for iOS and Android.",
                "skills_required": "React Native, Swift, Kotlin, Flutter, Mobile UI/UX",
                "qualification": "Bachelor's in Computer Science, 2+ years mobile development",
                "location": "Los Angeles, CA",
                "employment_type": "Full-time"
            },
            {
                "title": "Quality Assurance Engineer",
                "description": "Design and execute test plans to ensure software quality and reliability.",
                "skills_required": "Test Automation, Selenium, Jest, API Testing, Bug Tracking",
                "qualification": "Bachelor's degree, 2+ years QA experience",
                "location": "Chicago, IL",
                "employment_type": "Full-time"
            }
        ]
        
        jobs = []
        for job_data in jobs_data:
            job = Job(
                posted_by=random.choice(hr_users).id,
                title=job_data["title"],
                description=job_data["description"],
                skills_required=job_data["skills_required"],
                qualification=job_data["qualification"],
                location=job_data["location"],
                employment_type=job_data["employment_type"],
                status="active",
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            db.add(job)
            db.flush()
            jobs.append(job)
        
        # Create candidates and applications
        print("🎯 Creating candidates and applications...")
        candidates_data = [
            {
                "name": "John Smith",
                "email": "john.smith@email.com",
                "skills": "React, JavaScript, TypeScript, Node.js, HTML5, CSS3",
                "experience": "5 years",
                "education": "BS Computer Science, Stanford University",
                "profile_summary": "Experienced frontend developer passionate about user interfaces.",
                "resume_url": "https://example.com/resumes/john-smith.pdf"
            },
            {
                "name": "Sarah Davis", 
                "email": "sarah.davis@email.com",
                "skills": "Python, Django, PostgreSQL, AWS, Docker, REST APIs",
                "experience": "4 years",
                "education": "MS Software Engineering, MIT",
                "profile_summary": "Backend developer specializing in scalable microservices.",
                "resume_url": "https://example.com/resumes/sarah-davis.pdf"
            },
            {
                "name": "Mike Wilson",
                "email": "mike.wilson@email.com", 
                "skills": "Product Strategy, Agile, User Research, Analytics",
                "experience": "6 years",
                "education": "MBA, Harvard Business School",
                "profile_summary": "Product manager with B2B SaaS experience.",
                "resume_url": "https://example.com/resumes/mike-wilson.pdf"
            },
            {
                "name": "Emily Chen",
                "email": "emily.chen@email.com",
                "skills": "Figma, Sketch, User Research, Prototyping, Design Systems", 
                "experience": "3 years",
                "education": "BFA Interaction Design, RISD",
                "profile_summary": "UX/UI designer focused on user-centered design.",
                "resume_url": "https://example.com/resumes/emily-chen.pdf"
            },
            {
                "name": "Alex Rodriguez",
                "email": "alex.rodriguez@email.com",
                "skills": "Python, R, Machine Learning, Statistics, TensorFlow",
                "experience": "3 years", 
                "education": "PhD Data Science, UC Berkeley",
                "profile_summary": "Data scientist with ML and statistical analysis expertise.",
                "resume_url": "https://example.com/resumes/alex-rodriguez.pdf"
            },
            {
                "name": "Lisa Wang",
                "email": "lisa.wang@email.com",
                "skills": "AWS, Kubernetes, Docker, Jenkins, Terraform, Python",
                "experience": "4 years",
                "education": "BS Computer Engineering, Carnegie Mellon", 
                "profile_summary": "DevOps engineer passionate about automation and reliability.",
                "resume_url": "https://example.com/resumes/lisa-wang.pdf"
            },
            {
                "name": "David Brown",
                "email": "david.brown@email.com",
                "skills": "React, Vue.js, JavaScript, CSS, Responsive Design",
                "experience": "2 years",
                "education": "BS Web Development, University of Washington",
                "profile_summary": "Junior frontend developer eager to grow and learn.",
                "resume_url": "https://example.com/resumes/david-brown.pdf"
            },
            {
                "name": "Jennifer Taylor",
                "email": "jennifer.taylor@email.com",
                "skills": "Java, Spring Boot, MySQL, Microservices, API Design",
                "experience": "5 years",
                "education": "MS Computer Science, Georgia Tech",
                "profile_summary": "Senior backend developer with enterprise experience.",
                "resume_url": "https://example.com/resumes/jennifer-taylor.pdf"
            },
            {
                "name": "Robert Johnson",
                "email": "robert.johnson@email.com",
                "skills": "React, Angular, JavaScript, TypeScript, CSS3, HTML5",
                "experience": "4 years",
                "education": "BS Computer Science, UCLA",
                "profile_summary": "Frontend developer with expertise in modern frameworks.",
                "resume_url": "https://example.com/resumes/robert-johnson.pdf"
            },
            {
                "name": "Maria Garcia",
                "email": "maria.garcia@email.com",
                "skills": "Python, Flask, PostgreSQL, Redis, Docker",
                "experience": "3 years",
                "education": "BS Software Engineering, UT Austin",
                "profile_summary": "Backend developer focused on scalable web applications.",
                "resume_url": "https://example.com/resumes/maria-garcia.pdf"
            },
            {
                "name": "Kevin Lee",
                "email": "kevin.lee@email.com",
                "skills": "Product Management, Scrum, Analytics, Market Research",
                "experience": "5 years",
                "education": "MBA, Wharton School",
                "profile_summary": "Product manager with fintech and e-commerce experience.",
                "resume_url": "https://example.com/resumes/kevin-lee.pdf"
            },
            {
                "name": "Amanda White",
                "email": "amanda.white@email.com",
                "skills": "UI/UX Design, Adobe Creative Suite, Wireframing, User Testing",
                "experience": "4 years",
                "education": "BFA Graphic Design, Art Center",
                "profile_summary": "Creative designer with strong user experience focus.",
                "resume_url": "https://example.com/resumes/amanda-white.pdf"
            },
            {
                "name": "James Miller",
                "email": "james.miller@email.com",
                "skills": "Python, Pandas, Scikit-learn, SQL, Tableau",
                "experience": "2 years",
                "education": "MS Data Analytics, Northwestern",
                "profile_summary": "Data scientist specializing in predictive analytics.",
                "resume_url": "https://example.com/resumes/james-miller.pdf"
            },
            {
                "name": "Rachel Kim",
                "email": "rachel.kim@email.com",
                "skills": "AWS, Azure, Kubernetes, CI/CD, Infrastructure as Code",
                "experience": "6 years",
                "education": "BS Computer Engineering, MIT",
                "profile_summary": "Senior DevOps engineer with cloud architecture expertise.",
                "resume_url": "https://example.com/resumes/rachel-kim.pdf"
            }
        ]
        
        # Status options for realistic distribution
        status_options = [
            {"status_applied": True, "status_under_review": False, "status_shortlisted": False, "status_interviewed": False, "status_offered": False, "status_rejected": False},  # New
            {"status_applied": True, "status_under_review": True, "status_shortlisted": False, "status_interviewed": False, "status_offered": False, "status_rejected": False},   # Under review  
            {"status_applied": True, "status_under_review": True, "status_shortlisted": True, "status_interviewed": False, "status_offered": False, "status_rejected": False},    # Interview scheduled
            {"status_applied": True, "status_under_review": True, "status_shortlisted": True, "status_interviewed": True, "status_offered": False, "status_rejected": False},    # Final review
            {"status_applied": True, "status_under_review": True, "status_shortlisted": True, "status_interviewed": True, "status_offered": True, "status_rejected": False},     # Hired
            {"status_applied": True, "status_under_review": False, "status_shortlisted": False, "status_interviewed": False, "status_offered": False, "status_rejected": True}    # Rejected
        ]
        
        candidates = []
        applications = []
        app_id_counter = 1
        
        for candidate_data in candidates_data:
            # Create user
            user = User(
                name=candidate_data["name"],
                email=candidate_data["email"],
                password=hash_password("candidate123"),
                role=ROLE_CANDIDATE
            )
            db.add(user)
            db.flush()
            
            # Create candidate profile
            candidate = Candidate(
                user_id=user.id,
                candidate_id=user.id,
                resume_url=candidate_data["resume_url"],
                skills=candidate_data["skills"],
                experience=candidate_data["experience"],
                education=candidate_data["education"],
                profile_summary=candidate_data["profile_summary"]
            )
            db.add(candidate)
            db.flush()
            candidates.append(candidate)
            
            # Create one application per candidate (due to candidate_id being primary key)
            job = random.choice(jobs)
            
            # Choose realistic status distribution
            status_weights = [0.3, 0.25, 0.2, 0.15, 0.08, 0.02]
            status = random.choices(status_options, weights=status_weights)[0]
            
            # Generate score for progressed applications
            score = None
            if status["status_interviewed"] or status["status_offered"]:
                score = round(random.uniform(7.0, 9.5), 1)
            elif status["status_shortlisted"]:
                score = round(random.uniform(6.0, 8.5), 1)
            
            application = Application(
                id=app_id_counter,
                candidate_id=candidate.candidate_id,
                job_id=job.id,
                submitted_at=datetime.now() - timedelta(days=random.randint(1, 45)),
                score=score,
                **status
            )
            db.add(application)
            applications.append(application)
            app_id_counter += 1
        
        db.commit()
        
        # Print summary
        print("\n" + "="*60)
        print("🎉 DEMO DATA POPULATION COMPLETE!")
        print("="*60)
        print(f"✅ HR Users: {len(hr_users)}")
        print(f"✅ Jobs: {len(jobs)}")
        print(f"✅ Candidates: {len(candidates)}")
        print(f"✅ Applications: {len(applications)}")
        
        # Application status breakdown
        status_counts = {"new": 0, "under_review": 0, "interview_scheduled": 0, "final_review": 0, "hired": 0, "rejected": 0}
        
        for app in applications:
            if app.status_rejected:
                status_counts["rejected"] += 1
            elif app.status_offered:
                status_counts["hired"] += 1
            elif app.status_interviewed:
                status_counts["final_review"] += 1
            elif app.status_shortlisted:
                status_counts["interview_scheduled"] += 1
            elif app.status_under_review:
                status_counts["under_review"] += 1
            elif app.status_applied:
                status_counts["new"] += 1
            else:
                status_counts["new"] += 1
        
        print("\n📊 Application Status Distribution:")
        for status, count in status_counts.items():
            print(f"   {status.replace('_', ' ').title()}: {count}")
        
        print("\n🔑 Login Credentials:")
        print("   Admin: admin@company.com / admin123")
        print("   HR Users: [email] / hr123")
        print("   Candidates: [email] / candidate123")
        print("\n" + "="*60)
        
    except Exception as e:
        print(f"❌ Error occurred: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    populate_demo_data()
