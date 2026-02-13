# Agency Selection Feature - Implementation Guide

## Overview
This feature allows contractors to select their agency during signup and enables admins to manage agencies through the admin panel.

## Features Implemented

### 1. **Agency Selection on Signup**
- Contractors must select an agency from a dropdown during registration
- Agency selection is a required field
- 22 pre-configured agencies available

### 2. **Admin Agency Management**
- View all agencies in a table
- Add new agencies
- Edit existing agency names
- Delete agencies (with confirmation)

### 3. **User-Agency Association**
- Each contractor is linked to an agency
- Admins can see which agency each contractor belongs to
- Agency information displayed in the Users Management tab

## Database Schema

### Agencies Table
```sql
CREATE TABLE agencies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table Update
```sql
ALTER TABLE users 
ADD COLUMN agency_id INTEGER REFERENCES agencies(id);
```

## Pre-configured Agencies

1. 360 Connections Group Ltd
2. Aberdare Constructions Limited
3. CTRG Limited
4. Fusion Group Global Ltd
5. InterEx Group
6. ITRS Group Limited
7. ID Medical
8. Khuda Technology Ltd
9. Medacs Healthcare
10. Medics Pro Ltd
11. MOBILE TECHNICAL STAFF LTD
12. Next Best Move
13. Opus People Care Solutions
14. Priority Talent Group Limited
15. ReX Recruitment (Antal Sp. z o.o.)
16. Quantum Sourcing Ltd
17. SEND Inclusion Therapy Limited
18. Twenty Four Seven Nursing
19. Universal Search Group Limited
20. VANGUARD MASONRY LIMITED
21. XTP Recruitment Ltd
22. Excel Resourcing

## Setup Instructions

### Step 1: Run the Setup Script
```bash
cd Backend
node setupAgencies.js
```

This script will:
- Create the `agencies` table
- Add `agency_id` column to `users` table
- Populate the agencies table with all 22 agencies

### Step 2: Restart the Backend Server
```bash
cd Backend
node server.js
```

### Step 3: Test the Feature

#### Test Signup with Agency Selection:
1. Navigate to `http://localhost:3000/signup`
2. Fill in all fields including agency selection
3. Submit the form
4. Verify the user is created with the selected agency

#### Test Admin Agency Management:
1. Login as admin (`admin@test.com` / `password123`)
2. Navigate to Admin Panel
3. Click on "🏢 Manage Agencies" tab
4. Test adding, editing, and viewing agencies

## API Endpoints

### Get All Agencies (Public)
```
GET /api/agencies
Response: [{ id, name, created_at }, ...]
```

### Create Agency (Admin Only)
```
POST /api/agencies
Body: { name: "Agency Name" }
Response: { id, name, created_at }
```

### Update Agency (Admin Only)
```
PUT /api/agencies/:id
Body: { name: "New Agency Name" }
Response: { id, name, created_at }
```

### Delete Agency (Admin Only)
```
DELETE /api/agencies/:id
Response: { message: "Agency deleted successfully" }
```

## Files Modified/Created

### Backend Files:
1. **Backend/Models/Agency.js** - Agency model with CRUD operations
2. **Backend/Controllers/agencyController.js** - API endpoint handlers
3. **Backend/Routes/agencies.js** - Route definitions
4. **Backend/Models/User.js** - Added agency_id parameter
5. **Backend/Controllers/authController.js** - Added agency validation
6. **Backend/server.js** - Registered agency routes
7. **Backend/setupAgencies.js** - Database setup script

### Frontend Files:
1. **Frontend/Pages/signup.js** - Added agency dropdown
2. **Frontend/Pages/admin.js** - Added agency management tab and user agency display

## Validation Rules

### Signup Validation:
- Agency selection is required for contractors
- Returns error if no agency is selected
- Agency ID must be a valid integer

### Admin Operations:
- Only admins can create, update, or delete agencies
- Agency names must be unique
- Cannot delete an agency if contractors are associated with it (database constraint)

## User Interface

### Signup Page:
- Agency dropdown appears after password confirmation
- Shows all available agencies
- Required field indicator (red asterisk)
- Styled to match the SourcePay design

### Admin Panel - Manage Agencies Tab:
- **Add New Agency Form**: Input field and "Add Agency" button
- **Agencies Table**: Shows ID, Name, Created Date, and Actions
- **Edit Mode**: Inline editing with Save/Cancel buttons
- **Delete**: Confirmation dialog before deletion

### Admin Panel - Manage Users Tab:
- Added "Agency" column
- Shows agency name for each contractor
- Shows "N/A" for users without an agency (admins)

## Error Handling

### Common Errors:
1. **"Agency selection is required for contractors"** - User didn't select an agency
2. **"Agency name already exists"** - Trying to add duplicate agency
3. **"Cannot delete agency with associated users"** - Agency has contractors linked to it

## Testing Checklist

- [ ] Run `node setupAgencies.js` successfully
- [ ] Agencies table created with 22 agencies
- [ ] Users table has agency_id column
- [ ] Signup page shows agency dropdown
- [ ] Cannot submit signup without selecting agency
- [ ] User created with correct agency_id
- [ ] Admin can view all agencies
- [ ] Admin can add new agency
- [ ] Admin can edit agency name
- [ ] Admin can delete agency (if no users linked)
- [ ] Users list shows agency names
- [ ] Agency dropdown in signup loads all agencies

## Future Enhancements

1. **Agency Statistics**: Show number of contractors per agency
2. **Agency Filtering**: Filter users by agency in admin panel
3. **Agency Details Page**: Detailed view with all contractors from that agency
4. **Bulk Operations**: Assign multiple users to an agency at once
5. **Agency Deactivation**: Soft delete instead of hard delete
6. **Agency Contact Info**: Add contact details for each agency

## Troubleshooting

### Issue: Agencies not showing in dropdown
**Solution**: Ensure backend server is running and `/api/agencies` endpoint is accessible

### Issue: "Agency selection is required" error even after selecting
**Solution**: Check browser console for errors, verify agency_id is being sent in the request

### Issue: Cannot delete agency
**Solution**: Check if any users are associated with that agency. You must reassign or delete those users first

### Issue: Setup script fails
**Solution**: 
- Verify database connection in `.env`
- Check if tables already exist
- Ensure PostgreSQL is running

## Support

For issues or questions:
1. Check the console logs (both frontend and backend)
2. Verify database schema matches expected structure
3. Ensure all dependencies are installed (`npm install`)
4. Check that environment variables are properly configured

## Summary

The agency selection feature is now fully integrated into the Payroll Portal system. Contractors must select their agency during signup, and admins have full control over agency management through an intuitive interface in the admin panel.
