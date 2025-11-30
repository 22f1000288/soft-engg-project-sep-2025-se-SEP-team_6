# Resume Feature Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            CandidateProfile.jsx (Main Page)              │  │
│  │  - Manages overall profile state                         │  │
│  │  - Fetches resume data on mount                          │  │
│  │  - Handles callbacks from child components               │  │
│  └────────────────┬────────────────┬────────────────────────┘  │
│                   │                │                            │
│       ┌───────────▼──────┐  ┌─────▼──────────┐                │
│       │ ResumeUpload.jsx │  │ ResumeDisplay  │                │
│       │                  │  │    .jsx        │                │
│       │ - File picker    │  │ - Display data │                │
│       │ - Drag & drop    │  │ - Edit mode    │                │
│       │ - Validation     │  │ - Save/Cancel  │                │
│       │ - Progress       │  │ - Inline edit  │                │
│       └────────┬─────────┘  └────────┬───────┘                │
│                │                     │                          │
└────────────────┼─────────────────────┼──────────────────────────┘
                 │                     │
                 │ HTTP Requests       │
                 │ (Bearer Token)      │
                 │                     │
┌────────────────▼─────────────────────▼──────────────────────────┐
│                      BACKEND (FastAPI)                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     main.py (API Layer)                    │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │  POST /resume/upload                                       │  │
│  │  ├─ Accept PDF file                                        │  │
│  │  ├─ Save to temp file                                      │  │
│  │  ├─ Call ResumeParser.parse_resume()                       │  │
│  │  ├─ Store JSON in database                                 │  │
│  │  └─ Return parsed data                                     │  │
│  │                                                            │  │
│  │  GET /resume                                               │  │
│  │  ├─ Get user from auth token                              │  │
│  │  ├─ Call get_user_resume(user_id)                         │  │
│  │  └─ Return JSON data                                      │  │
│  │                                                            │  │
│  │  PUT /resume                                               │  │
│  │  ├─ Get user from auth token                              │  │
│  │  ├─ Validate JSON data                                     │  │
│  │  ├─ Call update_user_resume(user_id, json)               │  │
│  │  └─ Return updated data                                   │  │
│  │                                                            │  │
│  └────────────────────────┬──────────────────────────────────┘  │
│                           │                                      │
│       ┌───────────────────▼───────────────────┐                 │
│       │    resume_extractor/resume_extractor  │                 │
│       │    .py (ResumeParser)                 │                 │
│       ├───────────────────────────────────────┤                 │
│       │  - extract_text_from_pdf()            │                 │
│       │  - parse_resume()                     │                 │
│       │  - Uses Groq API for parsing          │                 │
│       │  - Handles 1 & 2 column layouts       │                 │
│       └───────────────────────────────────────┘                 │
│                           │                                      │
│       ┌───────────────────▼───────────────────┐                 │
│       │   backend/databases/controller.py     │                 │
│       ├───────────────────────────────────────┤                 │
│       │  - update_user_resume()               │                 │
│       │  - get_user_resume()                  │                 │
│       └───────────────────┬───────────────────┘                 │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                ┌───────────▼──────────┐
                │      DATABASE        │
                │    (SQLite)          │
                ├──────────────────────┤
                │  User Table          │
                │  ├─ id               │
                │  ├─ name             │
                │  ├─ email            │
                │  ├─ password         │
                │  ├─ role             │
                │  └─ resume_json  ◄── NEW COLUMN
                └──────────────────────┘
```

## Data Flow Diagrams

### Upload Flow
```
User → Upload PDF
  │
  ├─► Frontend: ResumeUpload
  │     │
  │     ├─► Validate file (PDF only)
  │     │
  │     └─► POST /resume/upload with file
  │           │
  │           ├─► Backend: Save to temp file
  │           │
  │           ├─► ResumeParser: Parse PDF
  │           │     │
  │           │     ├─► Extract text (pdfplumber)
  │           │     │
  │           │     ├─► Groq API: Intelligent parsing
  │           │     │
  │           │     └─► Return structured JSON
  │           │
  │           ├─► Controller: update_user_resume()
  │           │     │
  │           │     └─► Database: Store in resume_json
  │           │
  │           └─► Return parsed data
  │
  └─► Frontend: Display in ResumeDisplay
```

### Edit Flow
```
User → Click Edit
  │
  ├─► Frontend: ResumeDisplay enters edit mode
  │
  ├─► User modifies fields
  │
  └─► User clicks Save
        │
        ├─► Frontend: PUT /resume with updated JSON
        │     │
        │     └─► Backend: update_user_resume()
        │           │
        │           └─► Database: Update resume_json
        │
        └─► Frontend: Exit edit mode, show updated data
```

### View Flow
```
User → Navigate to Profile
  │
  ├─► Frontend: CandidateProfile loads
  │     │
  │     └─► GET /resume
  │           │
  │           ├─► Backend: get_user_resume()
  │           │     │
  │           │     └─► Database: Fetch resume_json
  │           │
  │           └─► Return JSON data
  │
  └─► Frontend: ResumeDisplay renders data
```

## Component Hierarchy

```
CandidateProfile
├── CandidateNavbar
├── Profile Info Section (existing)
│   ├── Personal Info Display
│   └── Edit Form
└── Resume Section (NEW)
    ├── ResumeUpload
    │   ├── File Picker
    │   ├── Upload Button
    │   └── Status Messages
    └── ResumeDisplay
        ├── Personal Info Card
        │   ├── Name
        │   ├── Contact Info
        │   └── Social Links
        └── Sections List
            ├── Experience Section
            ├── Education Section
            ├── Skills Section
            ├── Projects Section
            └── Other Sections
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│         Authentication Layer            │
├─────────────────────────────────────────┤
│                                         │
│  User Login                             │
│    │                                    │
│    ├─► JWT Token Generated             │
│    │                                    │
│    └─► Stored in localStorage          │
│                                         │
└────────────┬────────────────────────────┘
             │
    ┌────────▼─────────┐
    │  All API Calls   │
    │  Include Token   │
    │  in Header       │
    └────────┬─────────┘
             │
┌────────────▼────────────────────────────┐
│      Authorization Middleware           │
├─────────────────────────────────────────┤
│                                         │
│  require_roles(ROLE_CANDIDATE)          │
│    │                                    │
│    ├─► Verify token                    │
│    │                                    │
│    ├─► Check user role                 │
│    │                                    │
│    └─► Ensure user_id matches          │
│                                         │
└────────────┬────────────────────────────┘
             │
    ┌────────▼─────────┐
    │  Resume Endpoint │
    │  Access Granted  │
    └──────────────────┘
```

## Database Schema

```sql
-- User table with new resume_json column

CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    resume_json TEXT  -- NEW: Stores parsed resume as JSON string
);

-- Example resume_json content:
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
      "items": [
        {
          "title": "Senior Software Engineer",
          "company": "Tech Corp",
          "dates": "2020-Present",
          "description": ["Built scalable APIs", "Led team of 5"]
        }
      ]
    }
  ],
  "metadata": {
    "file_path": "/tmp/resume.pdf",
    "parsed_at": "2025-11-30T12:00:00"
  }
}
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│            Frontend                     │
├─────────────────────────────────────────┤
│  - React 18                             │
│  - Vite                                 │
│  - Tailwind CSS                         │
│  - lucide-react (icons)                 │
│  - Fetch API                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            Backend                      │
├─────────────────────────────────────────┤
│  - Python 3.8+                          │
│  - FastAPI                              │
│  - SQLAlchemy                           │
│  - PyPDF2 / pdfplumber                  │
│  - Groq API (LLM)                       │
│  - python-docx                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            Database                     │
├─────────────────────────────────────────┤
│  - SQLite                               │
│  - WAL mode enabled                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         External Services               │
├─────────────────────────────────────────┤
│  - Groq API (for resume parsing)        │
└─────────────────────────────────────────┘
```

This architecture provides a complete, secure, and scalable solution for resume management in the HRMS application.
