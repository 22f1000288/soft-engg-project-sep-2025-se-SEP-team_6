# Resume Extractor System

A Python-based system that extracts structured information from PDF resumes without using hardcoded headings.

## Features

- Extracts personal information (name, email, phone, LinkedIn, GitHub, etc.)
- Dynamically identifies sections (Education, Experience, Skills, Projects, etc.)
- Uses NLP (spaCy) for intelligent text parsing
- Outputs structured JSON data
- No hardcoded section headings - adapts to different resume formats

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Download spaCy language model:
```bash
python -m spacy download en_core_web_sm
```

## Usage

```bash
python main.py <path_to_resume.pdf> [output.json]
```

Example:
```bash
python main.py resume.pdf extracted_data.json
```

## Output Format

The system outputs a JSON file with the following structure:

```json
{
  "personal_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "linkedin": "linkedin.com/in/johndoe",
    "github": "github.com/johndoe",
    "location": "New York, NY"
  },
  "sections": {
    "education": [...],
    "experience": [...],
    "skills": [...],
    "projects": [...],
    "certifications": [...]
  },
  "raw_text": "..."
}
```

## How It Works

1. **PDF Text Extraction**: Uses `pdfplumber` to extract text from PDF
2. **Section Detection**: Dynamically identifies sections using keywords and formatting patterns
3. **NER Processing**: Uses spaCy for named entity recognition (names, locations, organizations)
4. **Pattern Matching**: Extracts emails, phones, URLs using regex patterns
5. **Date Extraction**: Identifies various date formats
6. **Content Parsing**: Intelligently parses section content based on detected type

## Customization

The system can be extended by modifying the `ResumeExtractor` class methods for specific requirements.