import os
from groq import Groq
from env import GROQ_API_KEY
import json

def create_job_summary(
    job_title: str,
    department: str,
    experience_level: str,
    required_skills: list,
    company_culture_keywords: list,
    location: str,
    api_key: str = None,
) -> str:
    """
    Generate a LinkedIn job summary using Groq AI.
    
    Args:
        job_title: The job title
        department: Department name
        experience_level: Experience level required
        required_skills: List of required skills
        company_culture_keywords: List of company culture keywords
        location: Job location
    
    Returns:
        Generated job summary as a string
    """
    client = Groq(api_key=api_key)
    
    prompt = f"""Create a professional and engaging LinkedIn job posting summary with the following details:

Job Title: {job_title}
Department: {department}
Experience Level: {experience_level}
Required Skills: {', '.join(required_skills)}
Company Culture: {', '.join(company_culture_keywords)}
Location: {location}

Generate a compelling job summary that includes:
1. A brief introduction about the role
2. Key responsibilities (2-3 bullet points)
3. Required qualifications
4. Company culture fit
5. A call to action

Keep it professional, concise, and under 300 words."""

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.7,
        max_tokens=1024,
    )
    
    return chat_completion.choices[0].message.content


if __name__ == "__main__":
    with open('job_details.json', 'r') as f:
        job_data = json.load(f)
    
    job_summary = create_job_summary(
        job_title=job_data['job_title'],
        department=job_data['department'],
        experience_level=job_data['experience_level'],
        required_skills=job_data['required_skills'],
        company_culture_keywords=job_data['company_culture_keywords'],
        location=job_data['location'],
        api_key=GROQ_API_KEY,
    )
    with open('job_summary.md', 'w') as f:
        f.write(job_summary)
    print("Job summary written to job_summary.md")