import sys
import os
from resume_extractor import ResumeParser
import json

def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py <path_to_resume.pdf> [output.json]")
        print("\nMake sure to set GROQ_API_KEY environment variable first!")
        print("Get free API key from: https://console.groq.com")
        sys.exit(1)
    
    # Get Groq API key
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("Error: GROQ_API_KEY environment variable not set!")
        print("\nTo set it:")
        print("  Linux/Mac: export GROQ_API_KEY='your_key_here'")
        print("  Windows: set GROQ_API_KEY=your_key_here")
        print("\nGet free API key from: https://console.groq.com")
        sys.exit(1)
    
    resume_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else "extracted_resume.json"
    
    print(f"Extracting resume from: {resume_path}")
    print("Using Groq API (free tier)...")
    
    # Initialize parser with Groq API
    parser = ResumeParser(api_key=api_key)
    
    try:
        # Parse resume
        resume_data = parser.parse_resume(resume_path)
        
        # Save to JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(resume_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✓ Resume data saved to: {output_path}")
        
        # Print preview
        print("\n=== Extracted Resume Data ===")
        print(json.dumps(resume_data, indent=2, ensure_ascii=False))
        
    except Exception as e:
        print(f"\n✗ Error parsing resume: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()