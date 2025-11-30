# Resume Upload and Management Feature

## Overview
This feature allows candidates to upload PDF resumes, which are automatically parsed into structured JSON format and stored in the database. Candidates can view their parsed resume data and edit it directly from the frontend.

## Features Implemented

### Backend (Python/FastAPI)

#### 1. Database Model Update (`backend/databases/models.py`)
- Added `resume_json` column to the `User` table to store parsed resume data as JSON string

#### 2. Controller Functions (`backend/databases/controller.py`)
- `update_user_resume(user_id, resume_json)`: Updates the resume_json field for a user
- `get_user_resume(user_id)`: Retrieves the resume_json for a user

#### 3. API Endpoints (`main.py`)

**POST /resume/upload**
- Accepts PDF file upload from candidates
- Parses the resume using the `ResumeParser` from `resume_extractor`
- Stores parsed JSON in the database
- Returns parsed resume data
- Authentication: Requires ROLE_CANDIDATE

**GET /resume**
- Retrieves the stored resume JSON for the authenticated candidate
- Returns parsed resume data or null if not found
- Authentication: Requires ROLE_CANDIDATE

**PUT /resume**
- Updates the resume JSON in the database
- Accepts edited resume data from the frontend
- Authentication: Requires ROLE_CANDIDATE

### Frontend (React)

#### 1. ResumeUpload Component (`hrms-project/src/components/ResumeUpload.jsx`)
- File upload interface with drag-and-drop support
- PDF file validation
- Upload progress indicator
- Success/error feedback
- Calls `/resume/upload` API endpoint

#### 2. ResumeDisplay Component (`hrms-project/src/components/ResumeDisplay.jsx`)
- Displays parsed resume data in a structured format
- Shows personal information (name, email, phone, location, LinkedIn, GitHub)
- Displays all resume sections (experience, education, skills, projects, etc.)
- Edit mode with inline editing capabilities
- Save/Cancel functionality for edits
- Calls `/resume` (GET) and `/resume` (PUT) API endpoints

#### 3. CandidateProfile Integration (`hrms-project/src/components/CandidateProfile.jsx`)
- Integrated both ResumeUpload and ResumeDisplay components
- Fetches existing resume data on component mount
- Handles upload success and update callbacks
- Displays loading states appropriately

## Usage Flow

### For Candidates:

1. **Upload Resume**
   - Navigate to the Profile page
   - In the "Resume" section, click on the upload area or drag a PDF file
   - Click "Upload Resume" button
   - System will parse the PDF and extract information
   - Parsed data will be displayed below

2. **View Resume**
   - Parsed resume is automatically displayed on the Profile page
   - All sections are organized and formatted
   - Personal information is highlighted at the top

3. **Edit Resume**
   - Click the "Edit" button in the Resume section
   - Edit any field inline
   - Click "Save" to update the database
   - Click "Cancel" to discard changes

## Technical Details

### Resume Parsing
- Uses the existing `ResumeParser` class from `resume_extractor/resume_extractor.py`
- Leverages Groq API for intelligent resume parsing
- Supports bi-column PDF layouts
- Extracts:
  - Personal information (name, email, phone, location, social links)
  - Work experience
  - Education
  - Skills
  - Projects
  - Certifications
  - Custom sections

### Data Storage
- Resume data is stored as a JSON string in the `resume_json` column of the `User` table
- Structure:
```json
{
  "personal_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York, USA",
    "linkedin": "linkedin.com/in/johndoe",
    "github": "github.com/johndoe"
  },
  "sections": [
    {
      "section_name": "WORK EXPERIENCE",
      "content_type": "experience",
      "items": [...]
    },
    ...
  ],
  "metadata": {
    "file_path": "...",
    "parsed_at": "2025-11-30T..."
  }
}
```

### Security
- All endpoints require authentication
- Only candidates can access their own resume data
- File upload restricted to PDF format
- Temporary files are cleaned up after parsing

## Dependencies

### Backend
Already included in existing `requirements.txt`:
- `PyPDF2==3.0.1`
- `pdfplumber==0.10.3`
- `python-docx==1.1.0`
- `groq==0.33.0`

### Frontend
Already included in existing setup:
- React
- lucide-react (for icons)
- fetch API (for HTTP requests)

## Environment Variables
Ensure `GROQ_API_KEY` is set in your `.env` file for resume parsing to work.

## Testing the Feature

1. **Start the backend server:**
   ```bash
   cd c:\Users\pc\Desktop\soft-engg-project-sep-2025-se-SEP-team_6
   python main.py
   ```

2. **Start the frontend:**
   ```bash
   cd hrms-project
   npm run dev
   ```

3. **Test the flow:**
   - Login as a candidate
   - Navigate to Profile page
   - Upload a PDF resume
   - Verify the parsed data is displayed
   - Click Edit and modify some fields
   - Click Save and verify changes persist
   - Refresh the page to confirm data is stored

## Error Handling

- **Invalid file type**: Shows error message "Only PDF files are supported"
- **Upload failure**: Displays error with details
- **Parse failure**: Returns 500 error with error message
- **Update failure**: Shows alert to retry
- **No resume**: Displays "No resume data available" message

## Future Enhancements

- Support for DOCX file uploads
- Download original resume file
- Resume version history
- AI-powered resume suggestions
- Export to different formats
- Resume scoring/analysis
- Skill matching with job postings
