# Resume Feature - Deployment Checklist

## Pre-Deployment Checklist

### Backend Setup
- [ ] Ensure Python 3.8+ is installed
- [ ] Verify all dependencies are installed from `requirements.txt`
- [ ] Set `GROQ_API_KEY` in `.env` file
- [ ] Run database migration script: `python backend/databases/migrate_resume_column.py`
- [ ] Test backend endpoints manually or with Postman
- [ ] Verify resume parsing works with sample PDF

### Frontend Setup
- [ ] Ensure Node.js and npm are installed
- [ ] Run `npm install` in `hrms-project` directory
- [ ] Verify ResumeUpload component renders correctly
- [ ] Verify ResumeDisplay component renders correctly
- [ ] Test file upload UI

### Integration Testing
- [ ] Start backend server on port 8000
- [ ] Start frontend dev server on port 5173
- [ ] Login as candidate user
- [ ] Navigate to Profile page
- [ ] Upload a PDF resume
- [ ] Verify resume is parsed correctly
- [ ] Check that all sections display properly
- [ ] Click Edit button and modify fields
- [ ] Click Save and verify changes persist
- [ ] Refresh page and verify data loads
- [ ] Test error scenarios (invalid file, network errors)

### Security Testing
- [ ] Verify only candidates can access resume endpoints
- [ ] Test authentication requirements (no token = 401)
- [ ] Verify users can only access their own resume data
- [ ] Test file type validation (only PDF allowed)
- [ ] Check that temporary files are cleaned up

### Performance Testing
- [ ] Test with large PDF files (5-10 MB)
- [ ] Test with complex multi-page resumes
- [ ] Verify parsing completes in reasonable time (< 30s)
- [ ] Check database query performance
- [ ] Monitor memory usage during file upload

## Deployment Steps

### 1. Backend Deployment

```bash
# Navigate to project root
cd /path/to/soft-engg-project-sep-2025-se-SEP-team_6

# Run database migration
python backend/databases/migrate_resume_column.py

# Verify environment variables
cat .env | grep GROQ_API_KEY

# Start backend
python main.py
```

### 2. Frontend Deployment

```bash
# Navigate to frontend directory
cd hrms-project

# Install dependencies (if not already done)
npm install

# Start development server (for testing)
npm run dev

# Or build for production
npm run build
```

### 3. Verification

After deployment, verify the following:

#### API Endpoints
```bash
# Test upload endpoint (requires valid token)
curl -X POST http://localhost:8000/resume/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/resume.pdf"

# Test get endpoint
curl http://localhost:8000/resume \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test update endpoint
curl -X PUT http://localhost:8000/resume \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"personal_info": {...}, "sections": [...]}'
```

#### Database
```bash
# Check that resume_json column exists
sqlite3 backend/databases/users.db "PRAGMA table_info(user);"

# Verify data is being stored
sqlite3 backend/databases/users.db "SELECT id, name, length(resume_json) FROM user WHERE resume_json IS NOT NULL;"
```

## Post-Deployment Checklist

### Monitoring
- [ ] Set up logging for resume upload/parse errors
- [ ] Monitor API response times
- [ ] Track successful vs failed uploads
- [ ] Monitor database size growth

### User Acceptance Testing
- [ ] Have real users test the feature
- [ ] Gather feedback on UI/UX
- [ ] Note any parsing accuracy issues
- [ ] Document common user questions

### Documentation
- [ ] Update main README with resume feature info
- [ ] Add API documentation to OpenAPI spec
- [ ] Create user guide for candidates
- [ ] Document troubleshooting steps

### Maintenance
- [ ] Set up regular database backups
- [ ] Monitor Groq API usage/costs
- [ ] Plan for future enhancements
- [ ] Track feature adoption metrics

## Common Issues & Solutions

### Issue: Database migration fails
**Solution**: 
```bash
# Backup existing database
cp backend/databases/users.db backend/databases/users.db.backup

# Try migration again
python backend/databases/migrate_resume_column.py

# If still fails, check database permissions
ls -la backend/databases/users.db
```

### Issue: Resume parsing is slow
**Solution**:
- Check Groq API response times
- Consider caching parsed results
- Optimize PDF extraction settings
- Add timeout handling

### Issue: Frontend not connecting to backend
**Solution**:
```javascript
// Verify API URL in frontend code
// Check CORS settings in main.py
// Ensure backend is running on correct port
```

### Issue: Authentication errors
**Solution**:
- Verify JWT token is being sent in Authorization header
- Check token expiration
- Ensure user has ROLE_CANDIDATE
- Verify token secret key matches

## Rollback Plan

If issues arise after deployment:

1. **Backend Rollback**:
   ```bash
   # Restore database backup
   cp backend/databases/users.db.backup backend/databases/users.db
   
   # Remove new endpoints from main.py
   # Or comment out the resume routes
   ```

2. **Frontend Rollback**:
   ```bash
   # Remove ResumeUpload and ResumeDisplay imports
   # Revert CandidateProfile.jsx changes
   git checkout main -- hrms-project/src/components/CandidateProfile.jsx
   ```

3. **Database Rollback**:
   ```sql
   -- If needed, remove the column (will lose data!)
   -- Note: SQLite doesn't support DROP COLUMN directly
   -- Would need to recreate table without the column
   ```

## Success Criteria

The feature is successfully deployed when:

- ✅ Candidates can upload PDF resumes
- ✅ Resumes are parsed accurately (>90% accuracy on key fields)
- ✅ Parsed data displays correctly in UI
- ✅ Edit functionality works without errors
- ✅ Changes persist across sessions
- ✅ No security vulnerabilities
- ✅ Performance is acceptable (< 15s for upload+parse)
- ✅ Error handling works properly
- ✅ User feedback is positive

## Support & Maintenance

### Regular Tasks
- Weekly: Check error logs
- Monthly: Review parsing accuracy
- Quarterly: Update dependencies
- As needed: Handle user support tickets

### Contact Points
- Backend issues: Check backend logs
- Frontend issues: Check browser console
- API issues: Check FastAPI logs
- Database issues: Check SQLite integrity

## Future Improvements to Consider

1. **Short-term** (1-2 weeks):
   - Add support for DOCX files
   - Improve error messages
   - Add loading animations

2. **Medium-term** (1-2 months):
   - Resume version history
   - Download original file
   - Batch resume processing

3. **Long-term** (3+ months):
   - AI-powered resume scoring
   - Skill matching with jobs
   - Resume templates
   - Multi-language support

---

**Last Updated**: November 30, 2025
**Feature Version**: 1.0.0
**Status**: Ready for Deployment
