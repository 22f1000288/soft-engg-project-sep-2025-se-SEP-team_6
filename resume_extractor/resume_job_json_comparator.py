import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def load_json_file(file_path):
    """Load and parse a JSON file."""
    with open(file_path, 'r') as f:
        return json.load(f)

def compare_resume_job(resume_path, job_desc_path, api_key=None):
    """
    Compare resume and job description using Llama 3.3B as judge.
    
    Args:
        resume_path: Path to resume JSON file
        job_desc_path: Path to job description JSON file
        api_key: Groq API key (optional, uses env var if not provided)
    
    Returns:
        Dictionary containing similarity score and analysis
    """
    # Initialize Groq client
    client = Groq(api_key=api_key or os.environ.get("GROQ_API_KEY"))
    
    # Load JSON files
    resume = load_json_file(resume_path)
    job_description = load_json_file(job_desc_path)
    
    # Create prompt for LLM judge
    prompt = f"""You are an expert recruiter and career advisor. Compare the following resume and job description.

Resume:
{json.dumps(resume, indent=2)}

Job Description:
{json.dumps(job_description, indent=2)}

Analyze the match between the resume and job description based on:
1. Skills alignment
2. Experience relevance
3. Education requirements
4. Qualifications match

Provide your response in the following JSON format:
{{
    "similarity_score": <number between 0-100>,
    "skills_match": <number between 0-100>,
    "experience_match": <number between 0-100>,
    "education_match": <number between 0-100>,
    "strengths": ["strength1", "strength2"],
    "gaps": ["gap1", "gap2"],
    "recommendation": "brief recommendation"
}}

Only respond with valid JSON, no additional text."""

    # Call Llama model
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an expert recruiter who evaluates candidate-job fit. Always respond with valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        max_tokens=1000
    )
    
    # Parse response
    response_text = chat_completion.choices[0].message.content
    result = json.loads(response_text)
    
    return result

def main():
    """Example usage of the comparator."""
    # Set your paths here
    resume_path = "extracted_resume_2.json"
    job_desc_path = "job_details.json"
    
    try:
        result = compare_resume_job(resume_path, job_desc_path, api_key=GROQ_API_KEY)
        
        print("=" * 50)
        print("RESUME-JOB COMPARISON RESULTS")
        print("=" * 50)
        print(f"Overall Similarity Score: {result['similarity_score']}/100")
        print(f"Skills Match: {result['skills_match']}/100")
        print(f"Experience Match: {result['experience_match']}/100")
        print(f"Education Match: {result['education_match']}/100")
        print(f"\nStrengths:")
        for strength in result['strengths']:
            print(f"  • {strength}")
        print(f"\nGaps:")
        for gap in result['gaps']:
            print(f"  • {gap}")
        print(f"\nRecommendation: {result['recommendation']}")
        
    except FileNotFoundError as e:
        print(f"Error: Could not find file - {e}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()