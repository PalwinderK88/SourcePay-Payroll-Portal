# Payroll Portal - User Guide

## 🚀 Complete Setup and Usage Guide

### Prerequisites
- Backend server running on `http://localhost:5001`
- Frontend server running on `http://localhost:3000`
- Database initialized with tables

---

## 📋 Step-by-Step Guide

### Step 1: Create Admin User (First Time Setup)

If you don't have an admin user yet, create one:

```bash
cd Backend
node createuser.js
```

This creates:
- **Email:** admin@test.com
- **Password:** password123
- **Role:** admin

---

### Step 2: Login as Admin

1. Open browser: `http://localhost:3000/login`
2. Enter credentials:
   - Email: `admin@test.com`
   - Password: `password123`
3. Click "Sign In"

---

### Step 3: Create a Regular User (Employee/Contractor)

**Option A: Using Signup Page**
1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - Full Name: `John Doe`
   - Email: `john.doe@company.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Check "I agree to Terms of Service"
4. Click "Create Account"
5. User will be created with role: `contractor`

**Option B: Using Backend Script**
```bash
cd Backend
node createuser.js
# Edit the file to change name, email, password, and role
```

---

### Step 4: Upload Payslip for User

1. **Login as Admin** (`admin@test.com`)
2. You'll see the homepage with three cards
3. Click on **"Admin Panel"** card
4. You'll see three tabs:
   - User Management
   - Upload Payslips
   - Upload Documents

5. **Click "Upload Payslips" tab**
6. Fill in the form:
   - **Select User:** Choose the user (e.g., John Doe)
   - **Month:** Select month (e.g., January)
   - **Year:** Enter year (e.g., 2024)
   - **Amount:** Enter amount (e.g., 5000)
   - **Upload File:** Click "Choose File" and select a PDF payslip

7. Click **"Upload Payslip"** button
8. You'll see a success message

---

### Step 5: User Views Their Payslip

1. **Logout from admin account**
   - Click "Logout" button in header

2. **Login as the user**
   - Go to `http://localhost:3000/login`
   - Email: `john.doe@company.com`
   - Password: `password123`

3. **View Dashboard**
   - After login, you'll see the homepage
   - Click on **"Dashboard"** card

4. **Navigate to Payslips**
   - Click on **"Payslips"** tab in the dashboard
   - You'll see a table with all your payslips
   - Click **"Download"** button to download the PDF

---

## 🎯 Quick Reference

### Admin Functions

**Access Admin Panel:**
- Login as admin → Click "Admin Panel" card

**Upload Payslip:**
1. Admin Panel → Upload Payslips tab
2. Select user, month, year, amount
3. Upload PDF file
4. Click "Upload Payslip"

**Upload Document:**
1. Admin Panel → Upload Documents tab
2. Select user and document type
3. Upload file
4. Click "Upload Document"

**View All Users:**
1. Admin Panel → User Management tab
2. See list of all users
3. Search users by name or email

---

### User (Contractor) Functions

**View Payslips:**
1. Login → Dashboard → Payslips tab
2. See all your payslips
3. Download any payslip

**View Documents:**
1. Login → Dashboard → Documents tab
2. See all your documents
3. Download any document

**View Overview:**
1. Login → Dashboard → Overview tab
2. See recent activity
3. Quick actions

---

## 📝 Creating Multiple Users

### Method 1: Signup Page (Recommended)
Each user can register themselves at `http://localhost:3000/signup`

### Method 2: Admin Creates Users
Currently, users must self-register. If you want admin to create users, you can:

1. Use the backend API directly:
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@company.com",
    "password": "password123",
    "role": "contractor"
  }'
```

2. Or modify `Backend/createuser.js` and run it multiple times with different details

---

## 🔐 User Roles

### Admin
- Can upload payslips for any user
- Can upload documents for any user
- Can view all users
- Access to Admin Panel

### Contractor (Regular User)
- Can view their own payslips
- Can view their own documents
- Can download their files
- Access to Dashboard only

---

## 📂 File Upload Guidelines

### Payslips
- **Format:** PDF recommended
- **Naming:** Use descriptive names (e.g., `payslip_january_2024.pdf`)
- **Size:** Keep under 10MB for best performance

### Documents
- **Types:** Contract, Tax Form, ID Proof, Other
- **Format:** PDF, DOC, DOCX, JPG, PNG
- **Size:** Keep under 10MB

---

## 🛠️ Troubleshooting

### Can't Login?
1. Check if backend server is running (`http://localhost:5001`)
2. Check if user exists in database
3. Verify password is correct
4. Check browser console for errors

### Can't Upload Payslip?
1. Make sure you're logged in as admin
2. Check file size (should be under 10MB)
3. Verify user exists in the system
4. Check backend server logs for errors

### Payslip Not Showing?
1. Refresh the page
2. Check if upload was successful
3. Verify you're logged in as the correct user
4. Check backend API: `http://localhost:5001/api/payslips/`

---

## 📊 Example Workflow

### Complete Example: Onboarding New Employee

1. **Employee Registers**
   ```
   - Go to /signup
   - Name: Sarah Johnson
   - Email: sarah.johnson@company.com
   - Password: SecurePass123
   - Click "Create Account"
   ```

2. **Admin Uploads First Payslip**
   ```
   - Login as admin
   - Go to Admin Panel
   - Click "Upload Payslips"
   - Select: Sarah Johnson
   - Month: January
   - Year: 2024
   - Amount: 6000
   - Upload: payslip_sarah_jan2024.pdf
   - Click "Upload Payslip"
   ```

3. **Employee Views Payslip**
   ```
   - Login as sarah.johnson@company.com
   - Click "Dashboard"
   - Click "Payslips" tab
   - See payslip for January 2024
   - Click "Download" to get PDF
   ```

---

## 🎨 Portal Features

### Login Page
- Modern split-screen design
- SourcePay branding
- Olive green theme
- Animated background

### Signup Page
- Matches login design
- Easy registration
- Form validation
- Terms acceptance

### Dashboard
- Overview tab with recent activity
- Payslips tab with download option
- Documents tab with file access
- User profile in header

### Admin Panel
- User management table
- Payslip upload form
- Document upload form
- Search functionality

---

## 📞 Support

If you encounter any issues:
1. Check `Backend/TROUBLESHOOTING.md`
2. Run diagnostics: `node Backend/diagnose.js`
3. Check server logs in terminal
4. Verify database connection

---

## 🔄 Regular Maintenance

### Monthly Tasks
1. Upload payslips for all employees
2. Backup database
3. Check for any errors in logs

### As Needed
1. Create new user accounts
2. Upload additional documents
3. Update user information

---

## ✅ Checklist for New Month

- [ ] Prepare payslip PDFs for all employees
- [ ] Login as admin
- [ ] Go to Admin Panel → Upload Payslips
- [ ] Upload payslip for each employee
- [ ] Verify uploads were successful
- [ ] Notify employees that payslips are available

---

## 🎯 Quick Commands

```bash
# Start Backend
cd Backend
node server.js

# Start Frontend
cd Frontend
npm run dev

# Create Admin User
cd Backend
node createuser.js

# Check Database
cd Backend
node checkUsers.js

# Run Diagnostics
cd Backend
node diagnose.js
```

---

**Your portal is now ready to use! 🎉**

Default Admin Login:
- Email: admin@test.com
- Password: password123
