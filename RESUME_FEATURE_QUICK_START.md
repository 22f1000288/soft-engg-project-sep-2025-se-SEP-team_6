# Resume Feature - Quick Start Guide

## Prerequisites
- Python 3.8+
- Node.js and npm
- GROQ API key

## Setup Instructions

### 1. Backend Setup

1. **Run the database migration** (if you have an existing database):
   ```bash
   cd backend/databases
   python migrate_resume_column.py
   ```

2. **Ensure environment variable is set**:
   Make sure your `.env` file contains:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Start the backend server**:
   ```bash
   python main.py
   ```
   Server will run at http://localhost:8000

### 2. Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd hrms-project
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Frontend will run at http://localhost:5173

## Testing the Feature

### As a Candidate:

1. **Login**:
   - Go to http://localhost:5173
   - Login with candidate credentials (e.g., john@gmail.com / test123)

2. **Navigate to Profile**:
   - Click on "Profile" in the navigation menu

3. **Upload Resume**:
   - Scroll to the "Resume" section
   - Click the upload area or drag a PDF resume file
   - Click "Upload Resume" button
   - Wait for parsing to complete (usually 5-10 seconds)

4. **View Parsed Resume**:
   - Once uploaded, your resume will be displayed below
   - All sections (experience, education, skills, etc.) will be visible

5. **Edit Resume**:
   - Click the "Edit" button in the resume section
   - Modify any fields you want to update
   - Click "Save" to persist changes
   - Or click "Cancel" to discard changes

6. **Verify Persistence**:
   - Refresh the page
   - Your resume data should still be there

## API Endpoints

All endpoints require authentication (Bearer token).

### Upload Resume
```
POST http://localhost:8000/resume/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body: 
  file: [PDF file]
```

### Get Resume
```
GET http://localhost:8000/resume
Authorization: Bearer {token}
```

### Update Resume
```
PUT http://localhost:8000/resume
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "personal_info": { ... },
  "sections": [ ... ]
}
```

## Troubleshooting

### Issue: "GROQ_API_KEY not configured"
**Solution**: Add GROQ_API_KEY to your .env file

### Issue: "Failed to parse resume"
**Solution**: 
- Ensure the PDF is not corrupted
- Check that the PDF contains actual text (not scanned images)
- Verify GROQ API key is valid

### Issue: Resume not displaying after upload
**Solution**: 
- Check browser console for errors
- Verify backend is running
- Check that authentication token is valid

### Issue: Database errors
**Solution**: 
- Run the migration script: `python backend/databases/migrate_resume_column.py`
- Or delete the database and restart the backend to recreate it

### Issue: Cannot edit resume
**Solution**: 
- Ensure you're logged in as a candidate
- Check that resume data was successfully uploaded
- Verify network connection to backend

## Sample Test Resume

You can use any PDF resume for testing. The parser supports:
- Single column layouts
- Two-column layouts
- Multiple sections (experience, education, skills, projects, etc.)
- Contact information extraction
- Social media links (LinkedIn, GitHub, etc.)

## Notes

- Only PDF files are supported for upload
- Maximum file size is controlled by FastAPI defaults (16MB)
- Resume parsing uses AI (Groq LLM) for intelligent extraction
- Parsed data is stored as JSON in the database
- Edit functionality allows inline editing of all fields
- Changes are saved to the database immediately

## Security

- Resume data is user-specific (candidates can only access their own)
- File uploads are validated for type and size
- Temporary files are cleaned up after parsing
- All endpoints require authentication
