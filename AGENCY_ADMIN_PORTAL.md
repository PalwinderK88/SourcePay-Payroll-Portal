# Agency Admin Portal Feature

## Overview
The Agency Admin Portal is a comprehensive feature that allows agency administrators to manage timesheets for their contractors and view contractor details. System admins can access all agency timesheets across the platform.

## Features Implemented

### 1. **Database**
- **New Table: `timesheets`**
  - Stores timesheet records with agency and contractor information
  - Supports both weekly and monthly periods
  - Tracks upload metadata (uploaded_by, uploaded_at)
  
**Schema:**
```sql
CREATE TABLE timesheets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agency_id INTEGER,
  agency_name TEXT,
  contractor_id INTEGER,
  contractor_name TEXT,
  period_type TEXT DEFAULT 'weekly',
  week_number INTEGER,
  month TEXT,
  year INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by INTEGER NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 2. **Backend Components**

#### **Model: `Backend/models/Timesheet.js`**
- `create()` - Create new timesheet record
- `findAll()` - Get all timesheets (admin only)
- `findByAgency()` - Get timesheets by agency ID
- `findByAgencyName()` - Get timesheets by agency name
- `findByContractor()` - Get timesheets for specific contractor
- `findById()` - Get single timesheet
- `findByPeriod()` - Check for duplicate timesheets
- `delete()` - Delete timesheet record

#### **Controller: `Backend/controllers/timesheetController.js`**
- `uploadTimesheet` - Upload timesheet with file validation
- `getAllTimesheets` - Get all timesheets (admin only)
- `getAgencyTimesheets` - Get timesheets for agency admin's agency
- `getAgencyContractors` - Get contractors for agency admin's agency
- `downloadTimesheet` - Download timesheet file
- `deleteTimesheet` - Delete timesheet and file

**File Upload Configuration:**
- Accepted formats: PDF, DOC, DOCX, XLS, XLSX
- Max file size: 10MB
- Storage location: `Backend/uploads/timesheets/`
- Filename format: `{contractor_id}_{period}_{year}_{timestamp}.ext`

#### **Routes: `Backend/routes/timesheets.js`**
```
POST   /api/timesheets/upload       - Upload timesheet
GET    /api/timesheets/all          - Get all timesheets (admin)
GET    /api/timesheets/agency       - Get agency timesheets
GET    /api/timesheets/contractors  - Get agency contractors
GET    /api/timesheets/download/:id - Download timesheet
DELETE /api/timesheets/:id          - Delete timesheet
```

### 3. **Frontend Components**

#### **Page: `Frontend/Pages/agency-admin.js`**
A comprehensive dashboard with three tabs:

**Tab 1: Upload Timesheet**
- Contractor selection dropdown
- Period type selector (Weekly/Monthly)
- Week number (1-52) or Month selection
- Year selection
- File upload with validation
- Real-time error/success messages

**Tab 2: Timesheets**
- List of all uploaded timesheets
- Displays: Contractor name, Period, Year, Upload date
- Actions: Download, Delete
- Empty state handling

**Tab 3: Contractors**
- Grid view of all contractors
- Contractor cards showing:
  - Name and email
  - Agency name
  - Status (active/pending)
  - Number of timesheets uploaded
- Avatar with initials

#### **Navigation: `Frontend/Components/Navbar.js`**
Updated to support agency_admin role:
- Agency admins see "Agency Portal" link
- System admins see both "Admin Panel" and "Agency Admin" links
- Proper role-based navigation

#### **Login Redirect: `Frontend/Pages/login.js`**
Updated login logic to redirect based on role:
- `admin` → `/admin`
- `agency_admin` → `/agency-admin`
- `contractor` → `/dashboard`

### 4. **User Roles**

**New Role: `agency_admin`**
- Can upload timesheets for their agency's contractors
- Can view all contractors in their agency
- Can view/download/delete timesheets for their agency
- Cannot access other agencies' data

**System Admin (`admin`)**
- Can access all agency timesheets
- Can view all contractors across all agencies
- Full system access

**Contractor**
- No access to agency admin portal
- Can only view their own payslips and documents

## Security Features

1. **Role-Based Access Control**
   - Agency admins can only access their own agency data
   - System admins have full access
   - Proper authentication checks on all endpoints

2. **File Validation**
   - File type restrictions (PDF, DOC, DOCX, XLS, XLSX)
   - File size limit (10MB)
   - Duplicate prevention

3. **Data Isolation**
   - Agency admins filtered by `agency_name`
   - Contractors filtered by agency association

## Usage Guide

### For Agency Admins:

1. **Login** with agency_admin credentials
2. **Navigate** to Agency Portal (automatic redirect after login)
3. **Upload Timesheet:**
   - Select contractor from dropdown
   - Choose period type (Weekly/Monthly)
   - Select week number or month
   - Choose year
   - Upload file
   - Click "Upload Timesheet"

4. **View Timesheets:**
   - Click "Timesheets" tab
   - See all uploaded timesheets
   - Download or delete as needed

5. **View Contractors:**
   - Click "Contractors" tab
   - See all contractors in your agency
   - View contractor details and timesheet count

### For System Admins:

1. **Access** Agency Admin portal from navbar
2. **View all timesheets** across all agencies
3. **View all contractors** across all agencies
4. **Download/Delete** any timesheet

## File Structure

```
Backend/
├── models/
│   └── Timesheet.js
├── controllers/
│   └── timesheetController.js
├── routes/
│   └── timesheets.js
├── uploads/
│   └── timesheets/
└── createTimesheetsTable.js

Frontend/
├── Pages/
│   ├── agency-admin.js
│   └── login.js (updated)
└── Components/
    └── Navbar.js (updated)
```

## Database Setup

Run the table creation script:
```bash
node Backend/createTimesheetsTable.js
```

## API Endpoints

### Upload Timesheet
```
POST /api/timesheets/upload
Headers: Authorization: Bearer {token}
Body: FormData
  - timesheet: File
  - contractor_id: Integer
  - contractor_name: String
  - period_type: 'weekly' | 'monthly'
  - week_number: Integer (if weekly)
  - month: String (if monthly)
  - year: Integer
```

### Get Agency Timesheets
```
GET /api/timesheets/agency
Headers: Authorization: Bearer {token}
Response: Array of timesheet objects
```

### Get Agency Contractors
```
GET /api/timesheets/contractors
Headers: Authorization: Bearer {token}
Response: Array of contractor objects
```

### Download Timesheet
```
GET /api/timesheets/download/:id
Headers: Authorization: Bearer {token}
Response: File download
```

### Delete Timesheet
```
DELETE /api/timesheets/:id
Headers: Authorization: Bearer {token}
Response: Success message
```

## Testing

### Create Agency Admin User
To create an agency admin user, update the user's role in the database:
```sql
UPDATE users 
SET role = 'agency_admin', agency_name = 'Your Agency Name' 
WHERE email = 'admin@agency.com';
```

### Test Workflow
1. Create agency_admin user
2. Login as agency_admin
3. Verify redirect to /agency-admin
4. Upload a timesheet
5. View timesheets list
6. Download timesheet
7. View contractors
8. Delete timesheet

## Future Enhancements

- [ ] Timesheet approval workflow
- [ ] Email notifications on upload
- [ ] Bulk upload functionality
- [ ] Timesheet templates
- [ ] Export to Excel/CSV
- [ ] Timesheet analytics dashboard
- [ ] Contractor timesheet history view
- [ ] Comments/notes on timesheets

## Troubleshooting

**Issue: Cannot upload timesheet**
- Check file format (must be PDF, DOC, DOCX, XLS, XLSX)
- Check file size (must be under 10MB)
- Verify user has agency_admin role
- Check agency_name is set for user

**Issue: Cannot see contractors**
- Verify contractors have matching agency_name
- Check user role is agency_admin or admin
- Verify contractors exist in database

**Issue: Download not working**
- Check file exists in uploads/timesheets/
- Verify user has permission to access timesheet
- Check file path in database is correct

## Support

For issues or questions, refer to:
- Main documentation: `USER_GUIDE.md`
- System explanation: `SYSTEM_EXPLANATION.md`
- Troubleshooting: `Backend/TROUBLESHOOTING.md`
