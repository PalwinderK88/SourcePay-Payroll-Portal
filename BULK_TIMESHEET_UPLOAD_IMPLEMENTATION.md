# Bulk Timesheet Upload Feature - Implementation Plan

## Overview
Adding bulk upload functionality for agency admins to upload multiple timesheets at once using CSV/Excel + PDF files.

## Features to Implement

### 1. CSV/Excel Template
**File:** `Backend/templates/timesheet_bulk_upload_template.csv`

**Columns:**
- contractor_id (required)
- contractor_name (required)
- period_type (required: "weekly" or "monthly")
- week_number (required if weekly)
- month (required if monthly)
- year (required)
- filename (required: name of PDF file to match)
- hours_worked (optional)
- notes (optional)

**Example:**
```csv
contractor_id,contractor_name,period_type,week_number,month,year,filename,hours_worked,notes
2,John Doe,weekly,1,,2024,john_doe_week1.pdf,40,Regular hours
3,Jane Smith,monthly,,January,2024,jane_smith_jan.pdf,160,Full month
```

### 2. Backend Implementation

#### A. Install Required Package
```bash
cd Backend
npm install xlsx csv-parser
```

#### B. New Controller Method
**File:** `Backend/Controllers/timesheetController.js`

Add new method: `bulkUploadTimesheets`
- Accept CSV/Excel file + multiple PDF files
- Parse CSV/Excel
- Match PDFs to CSV rows
- Validate all data
- Create timesheet records
- Return success/error report

#### C. New Route
**File:** `Backend/Routes/timesheets.js`

```javascript
router.post('/bulk-upload',
  authenticateToken,
  timesheetController.bulkUploadMiddleware,
  timesheetController.bulkUploadTimesheets
);

router.get('/bulk-template',
  authenticateToken,
  timesheetController.downloadBulkTemplate
);
```

### 3. Frontend Implementation

#### A. New Component
**File:** `Frontend/Components/BulkTimesheetUpload.js`

Features:
- Download CSV template button
- CSV/Excel file upload
- Multiple PDF files upload (drag & drop)
- Preview uploaded data
- Validation before submission
- Progress indicator
- Success/error report

#### B. Update Agency Admin Page
**File:** `Frontend/Pages/agency-admin.js`

Add tabs:
- Single Upload (existing)
- Bulk Upload (new)

### 4. Validation Rules

**CSV Validation:**
- All required fields present
- Valid period_type values
- Valid dates
- Contractor exists in system
- No duplicate entries

**PDF Validation:**
- All PDFs mentioned in CSV are uploaded
- File size limits (10MB per file)
- Valid file types (PDF only)
- Unique filenames

**Business Logic:**
- No duplicate timesheets for same contractor/period
- Agency admin can only upload for their agency contractors
- Proper error messages for each validation failure

### 5. Error Handling

**Partial Success:**
- If some timesheets succeed and some fail
- Return detailed report:
  - Successful uploads: count + list
  - Failed uploads: count + reasons
  - Allow retry for failed ones

**Complete Failure:**
- Clear error message
- Rollback any partial uploads
- Suggest corrections

### 6. User Experience Flow

```
1. Agency Admin clicks "Bulk Upload" tab
2. Downloads CSV template
3. Fills in contractor data
4. Uploads CSV file
5. System validates CSV and shows preview
6. Admin uploads corresponding PDF files
7. System matches PDFs to CSV rows
8. Shows confirmation with matched files
9. Admin clicks "Upload All"
10. System processes and shows progress
11. Displays success/error report
12. Option to download error report
```

### 7. Database Changes

No schema changes needed - uses existing timesheets table.

### 8. Security Considerations

- Validate file types (CSV/Excel/PDF only)
- Check file sizes
- Sanitize CSV data
- Verify agency admin permissions
- Prevent path traversal attacks
- Rate limiting on bulk uploads

### 9. Performance Optimization

- Process files asynchronously
- Show progress updates
- Limit bulk upload size (e.g., max 100 timesheets per batch)
- Queue large uploads

### 10. Testing Plan

**Unit Tests:**
- CSV parsing
- PDF matching
- Validation logic
- Error handling

**Integration Tests:**
- Full upload flow
- Partial success scenarios
- Error scenarios

**Manual Testing:**
- Upload 1 timesheet
- Upload 10 timesheets
- Upload 100 timesheets
- Test with missing PDFs
- Test with invalid CSV data
- Test with duplicate entries

## Implementation Timeline

**Phase 1: Backend (2-3 hours)**
- Install packages
- Create CSV template
- Implement bulk upload controller
- Add routes
- Test with Postman

**Phase 2: Frontend (2-3 hours)**
- Create BulkTimesheetUpload component
- Update agency-admin page
- Add drag & drop functionality
- Implement preview and validation

**Phase 3: Testing & Polish (1-2 hours)**
- Test all scenarios
- Fix bugs
- Improve UX
- Add loading states
- Create user documentation

**Total Estimated Time: 5-8 hours**

## Files to Create/Modify

### New Files:
1. `Backend/templates/timesheet_bulk_upload_template.csv`
2. `Frontend/Components/BulkTimesheetUpload.js`
3. `BULK_TIMESHEET_UPLOAD_GUIDE.md` (user documentation)

### Modified Files:
1. `Backend/Controllers/timesheetController.js` (add bulk upload methods)
2. `Backend/Routes/timesheets.js` (add bulk upload routes)
3. `Backend/package.json` (add xlsx, csv-parser)
4. `Frontend/Pages/agency-admin.js` (add bulk upload tab)

## Success Criteria

✅ Agency admin can download CSV template
✅ Agency admin can upload CSV + multiple PDFs
✅ System validates all data before processing
✅ System provides clear error messages
✅ System shows progress during upload
✅ System provides detailed success/error report
✅ Single upload still works as before
✅ All uploads are properly logged
✅ Contractors can see their uploaded timesheets

## Next Steps

Would you like me to:
1. Start implementing this feature now?
2. Create a simpler version first for testing?
3. Modify the plan based on your feedback?

Let me know and I'll begin implementation!
