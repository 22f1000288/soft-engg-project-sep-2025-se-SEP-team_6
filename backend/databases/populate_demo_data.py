#!/usr/bin/env python3
"""
Demo Data Population Script for HRMS Database

This script populates the database with realistic demo data including:
- HR users and candidates
- Job postings
- Candidate profiles
- Job applications with various statuses

Run this script to populate your database with sample data for testing.
"""

import os
import sys
from datetime import datetime, timedelta
import random

# Add project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from backend.databases.models import SessionLocal, User, Job, Candidate, Application
from backend.roles import ROLE_HR, ROLE_CANDIDATE
from backend.utils import hash_password

def clear_existing_data(db):
    """Clear existing demo data (optional - be careful with this!)"""
    print("Clearing existing demo data...")
    
    # Delete in reverse order of dependencies
    db.query(Application).delete()
    db.query(Candidate).filter(Candidate.user_id > 1).delete()  # Keep admin
    db.query(Job).delete()
    db.query(User).filter(User.id > 1).delete()  # Keep admin user
    
    db.commit()
    print("Existing demo data cleared.")

def create_hr_users(db):
    """Create HR users"""
    print("Creating HR users...")
    
    hr_users = [
        {
            "name": "Sarah Johnson",
            "email": "sarah.johnson@company.com",
            "password": "hr123"
        },
        {
            "name": "Michael Chen",
            "email": "michael.chen@company.com", 
            "password": "hr123"
        },
        {
            "name": "Emily Rodriguez",
            "email": "emily.rodriguez@company.com",
            "password": "hr123"
        }
    ]
    
    created_hr_users = []
    for hr_data in hr_users:
        hr_user = User(
            name=hr_data["name"],
            email=hr_data["email"],
            password=hash_password(hr_data["password"]),
            role=ROLE_HR
        )
        db.add(hr_user)
        db.flush()
        created_hr_users.append(hr_user)
    
    db.commit()
    print(f"Created {len(created_hr_users)} HR users.")
    return created_hr_users

def create_jobs(db, hr_users):
    """Create job postings"""
    print("Creating job postings...")
    
    jobs_data = [
        {
            "title": "Senior Frontend Developer",
            "description": "We are looking for an experienced Frontend Developer to join our dynamic team. You will be responsible for developing user-facing web applications using modern JavaScript frameworks.",
            "skills_required": "React, JavaScript, TypeScript, HTML5, CSS3, Redux, Webpack",
            "qualification": "Bachelor's degree in Computer Science or equivalent experience. 3+ years of frontend development experience.",
            "location": "San Francisco, CA",
            "employment_type": "Full-time"
        },
        {
            "title": "Backend Developer",
            "description": "Join our backend team to build scalable and robust server-side applications. You will work with microservices architecture and cloud technologies.",
            "skills_required": "Python, FastAPI, PostgreSQL, Docker, AWS, Redis, REST APIs",
            "qualification": "Bachelor's degree in Computer Science. 2+ years of backend development experience.",
            "location": "Seattle, WA",
            "employment_type": "Full-time"
        },
        {
            "title": "Product Manager",
            "description": "Lead product strategy and roadmap for our core platform. Work closely with engineering, design, and business teams to deliver exceptional user experiences.",
            "skills_required": "Product Strategy, Agile, User Research, Analytics, Roadmap Planning",
            "qualification": "MBA or equivalent experience. 3+ years in product management role.",
            "location": "New York, NY",
            "employment_type": "Full-time"
        },
        {
            "title": "UX/UI Designer",
            "description": "Create intuitive and beautiful user interfaces for our web and mobile applications. Conduct user research and create design systems.",
            "skills_required": "Figma, Sketch, Adobe Creative Suite, User Research, Prototyping, Design Systems",
            "qualification": "Bachelor's degree in Design or related field. 2+ years of UX/UI design experience.",
            "location": "Austin, TX",
            "employment_type": "Full-time"
        },
        {
            "title": "Data Scientist",
            "description": "Analyze large datasets to derive business insights and build machine learning models. Work with cross-functional teams to implement data-driven solutions.",
            "skills_required": "Python, R, SQL, Machine Learning, Statistics, Pandas, Scikit-learn, TensorFlow",
            "qualification": "Master's degree in Data Science, Statistics, or related field. 2+ years of experience.",
            "location": "Boston, MA",
            "employment_type": "Full-time"
        },
        {
            "title": "DevOps Engineer",
            "description": "Manage and optimize our cloud infrastructure. Implement CI/CD pipelines and ensure system reliability and scalability.",
            "skills_required": "AWS, Docker, Kubernetes, Jenkins, Terraform, Linux, Python, Monitoring",
            "qualification": "Bachelor's degree in Computer Science. 3+ years of DevOps experience.",
            "location": "Denver, CO",
            "employment_type": "Full-time"
        },
        {
            "title": "Marketing Specialist",
            "description": "Develop and execute marketing campaigns across digital channels. Analyze campaign performance and optimize for better ROI.",
            "skills_required": "Digital Marketing, Google Analytics, SEO, SEM, Social Media, Content Marketing",
            "qualification": "Bachelor's degree in Marketing or related field. 2+ years of marketing experience.",
            "location": "Los Angeles, CA",
            "employment_type": "Full-time"
        },
        {
            "title": "Sales Representative",
            "description": "Drive revenue growth by identifying and closing new business opportunities. Build relationships with potential clients and manage sales pipeline.",
            "skills_required": "Sales, CRM, Lead Generation, Negotiation, Communication, Customer Relationship Management",
            "qualification": "Bachelor's degree preferred. 2+ years of B2B sales experience.",
            "location": "Chicago, IL",
            "employment_type": "Full-time"
        }
    ]
    
    created_jobs = []
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
        created_jobs.append(job)
    
    db.commit()
    print(f"Created {len(created_jobs)} job postings.")
    return created_jobs

def create_candidates_and_applications(db, jobs):
    """Create candidate users, profiles, and applications"""
    print("Creating candidates and applications...")
    
    candidates_data = [
        {
            "name": "John Smith",
            "email": "john.smith@email.com",
            "skills": "React, JavaScript, TypeScript, Node.js, HTML5, CSS3",
            "experience": "5 years",
            "education": "BS Computer Science, Stanford University",
            "profile_summary": "Experienced frontend developer with a passion for creating intuitive user interfaces and scalable web applications.",
            "resume_url": "https://example.com/resumes/john-smith.pdf"
        },
        {
            "name": "Sarah Davis",
            "email": "sarah.davis@email.com",
            "skills": "Python, Django, PostgreSQL, AWS, Docker, REST APIs",
            "experience": "4 years",
            "education": "MS Software Engineering, MIT",
            "profile_summary": "Backend developer specializing in scalable microservices architecture and cloud-native applications.",
            "resume_url": "https://example.com/resumes/sarah-davis.pdf"
        },
        {
            "name": "Mike Wilson",
            "email": "mike.wilson@email.com",
            "skills": "Product Strategy, Agile, Scrum, User Research, Analytics",
            "experience": "6 years",
            "education": "MBA, Harvard Business School",
            "profile_summary": "Product manager with extensive experience in B2B SaaS products and data-driven decision making.",
            "resume_url": "https://example.com/resumes/mike-wilson.pdf"
        },
        {
            "name": "Emily Chen",
            "email": "emily.chen@email.com",
            "skills": "Figma, Sketch, User Research, Prototyping, Design Systems",
            "experience": "3 years",
            "education": "BFA Interaction Design, RISD",
            "profile_summary": "UX/UI designer focused on user-centered design and creating delightful digital experiences.",
            "resume_url": "https://example.com/resumes/emily-chen.pdf"
        },
        {
            "name": "Alex Rodriguez",
            "email": "alex.rodriguez@email.com",
            "skills": "Python, R, Machine Learning, Statistics, TensorFlow, SQL",
            "experience": "3 years",
            "education": "PhD Data Science, UC Berkeley",
            "profile_summary": "Data scientist with expertise in machine learning and statistical analysis for business intelligence.",
            "resume_url": "https://example.com/resumes/alex-rodriguez.pdf"
        },
        {
            "name": "Lisa Wang",
            "email": "lisa.wang@email.com",
            "skills": "AWS, Kubernetes, Docker, Jenkins, Terraform, Python",
            "experience": "4 years",
            "education": "BS Computer Engineering, Carnegie Mellon",
            "profile_summary": "DevOps engineer passionate about automation, infrastructure as code, and system reliability.",
            "resume_url": "https://example.com/resumes/lisa-wang.pdf"
        },
        {
            "name": "David Brown",
            "email": "david.brown@email.com",
            "skills": "Digital Marketing, Google Analytics, SEO, Content Marketing",
            "experience": "3 years",
            "education": "BA Marketing, UCLA",
            "profile_summary": "Marketing specialist with proven track record in digital campaigns and growth marketing.",
            "resume_url": "https://example.com/resumes/david-brown.pdf"
        },
        {
            "name": "Jennifer Taylor",
            "email": "jennifer.taylor@email.com",
            "skills": "B2B Sales, CRM, Lead Generation, Negotiation, Salesforce",
            "experience": "5 years",
            "education": "BA Business Administration, NYU",
            "profile_summary": "Sales professional with consistent track record of exceeding quotas and building client relationships.",
            "resume_url": "https://example.com/resumes/jennifer-taylor.pdf"
        },
        {
            "name": "Robert Johnson",
            "email": "robert.johnson@email.com",
            "skills": "Java, Spring Boot, MySQL, Microservices, Kafka",
            "experience": "6 years",
            "education": "MS Computer Science, Georgia Tech",
            "profile_summary": "Senior backend developer with expertise in enterprise-scale distributed systems.",
            "resume_url": "https://example.com/resumes/robert-johnson.pdf"
        },
        {
            "name": "Amanda Martinez",
            "email": "amanda.martinez@email.com",
            "skills": "React Native, iOS, Android, Flutter, Mobile UI/UX",
            "experience": "4 years",
            "education": "BS Mobile Development, ASU",
            "profile_summary": "Mobile developer specializing in cross-platform applications and native mobile experiences.",
            "resume_url": "https://example.com/resumes/amanda-martinez.pdf"
        },
        {
            "name": "Kevin Lee",
            "email": "kevin.lee@email.com",
            "skills": "Cybersecurity, Penetration Testing, CISSP, Network Security",
            "experience": "7 years",
            "education": "MS Cybersecurity, George Washington University",
            "profile_summary": "Cybersecurity expert with extensive experience in threat assessment and security architecture.",
            "resume_url": "https://example.com/resumes/kevin-lee.pdf"
        },
        {
            "name": "Rachel Green",
            "email": "rachel.green@email.com",
            "skills": "Quality Assurance, Test Automation, Selenium, API Testing",
            "experience": "4 years",
            "education": "BS Information Technology, Penn State",
            "profile_summary": "QA engineer focused on test automation and ensuring high-quality software delivery.",
            "resume_url": "https://example.com/resumes/rachel-green.pdf"
        }
    ]
    
    # Application status distributions for realistic demo data
    status_distributions = [
        {"status_applied": True, "status_shortlisted": False, "status_interviewed": False, "status_offered": False, "status_rejected": False},  # New applications
        {"status_applied": True, "status_shortlisted": True, "status_interviewed": False, "status_offered": False, "status_rejected": False},   # Under review
        {"status_applied": True, "status_shortlisted": True, "status_interviewed": True, "status_offered": False, "status_rejected": False},    # Interview scheduled
        {"status_applied": True, "status_shortlisted": True, "status_interviewed": True, "status_offered": False, "status_rejected": False},    # Final review
        {"status_applied": True, "status_shortlisted": True, "status_interviewed": True, "status_offered": True, "status_rejected": False},     # Hired
        {"status_applied": True, "status_shortlisted": False, "status_interviewed": False, "status_offered": False, "status_rejected": True},   # Rejected
    ]
    
    created_candidates = []
    created_applications = []
    
    for i, candidate_data in enumerate(candidates_data):
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
            candidate_id=user.id,  # Using user_id as candidate_id as per existing schema
            resume_url=candidate_data["resume_url"],
            skills=candidate_data["skills"],
            experience=candidate_data["experience"],
            education=candidate_data["education"],
            profile_summary=candidate_data["profile_summary"]
        )
        db.add(candidate)
        db.flush()
        created_candidates.append(candidate)
        
        # Create 1-3 applications per candidate
        num_applications = random.randint(1, 3)
        candidate_jobs = random.sample(jobs, min(num_applications, len(jobs)))
        
        for j, job in enumerate(candidate_jobs):
            # Choose status based on realistic distribution
            if j == 0:  # First application - more likely to be in later stages
                status_weights = [0.2, 0.2, 0.2, 0.2, 0.15, 0.05]  # Less likely to be rejected
            else:  # Additional applications - more likely to be in early stages
                status_weights = [0.4, 0.25, 0.15, 0.1, 0.05, 0.05]
            
            status = random.choices(status_distributions, weights=status_weights)[0]
            
            # Calculate submitted date (1-60 days ago)
            submitted_date = datetime.now() - timedelta(days=random.randint(1, 60))
            
            # Generate score for applications that have progressed
            score = None
            if status["status_interviewed"] or status["status_offered"]:
                score = round(random.uniform(6.5, 9.5), 1)
            elif status["status_shortlisted"]:
                score = round(random.uniform(5.0, 8.0), 1)
            
            application = Application(
                id=len(created_applications) + 1,  # Manual ID since it's unique but not primary key
                candidate_id=candidate.candidate_id,
                job_id=job.id,
                submitted_at=submitted_date,
                score=score,
                **status
            )
            db.add(application)
            created_applications.append(application)
    
    db.commit()
    print(f"Created {len(created_candidates)} candidates and {len(created_applications)} applications.")
    return created_candidates, created_applications

def print_summary(hr_users, jobs, candidates, applications):
    """Print a summary of created data"""
    print("\n" + "="*50)
    print("DEMO DATA POPULATION COMPLETE")
    print("="*50)
    print(f"HR Users: {len(hr_users)}")
    print(f"Jobs: {len(jobs)}")
    print(f"Candidates: {len(candidates)}")
    print(f"Applications: {len(applications)}")
    
    # Application status breakdown
    status_counts = {
        "new": 0,
        "under_review": 0, 
        "interview_scheduled": 0,
        "final_review": 0,
        "hired": 0,
        "rejected": 0
    }
    
    for app in applications:
        if app.status_rejected:
            status_counts["rejected"] += 1
        elif app.status_offered:
            status_counts["hired"] += 1
        elif app.status_interviewed:
            status_counts["final_review"] += 1
        elif app.status_shortlisted:
            status_counts["interview_scheduled"] += 1
        elif app.status_applied:
            status_counts["under_review"] += 1
        else:
            status_counts["new"] += 1
    
    print("\nApplication Status Breakdown:")
    for status, count in status_counts.items():
        print(f"  {status.replace('_', ' ').title()}: {count}")
    
    print("\nLogin Credentials:")
    print("  Admin: admin@company.com / admin123")
    print("  HR Users: [name]@company.com / hr123")
    print("  Candidates: [name]@email.com / candidate123")
    print("\n" + "="*50)

def main():
    """Main function to populate demo data"""
    print("Starting demo data population...")
    
    db = SessionLocal()
    
    try:
        # Ask user if they want to clear existing data
        response = input("Do you want to clear existing demo data first? (y/N): ").lower()
        if response in ['y', 'yes']:
            clear_existing_data(db)
        
        # Create demo data
        hr_users = create_hr_users(db)
        jobs = create_jobs(db, hr_users)
        candidates, applications = create_candidates_and_applications(db, jobs)
        
        # Print summary
        print_summary(hr_users, jobs, candidates, applications)
        
    except Exception as e:
        print(f"Error occurred: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
