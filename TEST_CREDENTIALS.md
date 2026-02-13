# Test Credentials for Payroll Portal

## 🔐 Login Credentials

### Agency Admin User
```
Email:    agencyadmin@test.com
Password: agencyadmin123
Role:     Agency Admin
Agency:   Test Agency
```

**How to Login:**
1. Go to the login page
2. Click on "🏢 Agency Admin" button
3. Enter email: `agencyadmin@test.com`
4. Enter password: `agencyadmin123`
5. Click "Sign In"
6. You will be redirected to `/agency-admin`

**What You Can Do:**
- Upload timesheets for contractors in "Test Agency"
- View all uploaded timesheets
- Download timesheet files
- Delete timesheets
- View all contractors in "Test Agency"

---

### System Admin User
```
Email:    admin@sourcepay.com
Password: admin123
Role:     System Admin
```

**How to Login:**
1. Go to the login page
2. Click on "⚙️ System Admin" button
3. Enter email: `admin@sourcepay.com`
4. Enter password: `admin123`
5. Click "Sign In"
6. You will be redirected to `/admin`

**What You Can Do:**
- Full system access
- Manage all users
- Upload payslips for any contractor
- Pre-register new users
- Access agency admin portal (view all agencies)

---

### Contractor User
```
Email:    contractor@test.com
Password: contractor123
Role:     Contractor
```

**How to Login:**
1. Go to the login page
2. Click on "👤 Contractor" button (default selection)
3. Enter email: `contractor@test.com`
4. Enter password: `contractor123`
5. Click "Sign In"
6. You will be redirected to `/dashboard`

**What You Can Do:**
- View your payslips
- Download payslips
- View documents
- Update profile

---

## 🛠️ Creating Additional Test Users

### Create Another Agency Admin:
```bash
node Backend/createAgencyAdmin.js
```

### Create Contractor Manually:
```sql
INSERT INTO users (name, email, password_hash, role, agency_name, status) 
VALUES ('Test Contractor', 'test@contractor.com', '$2a$10$hashedpassword', 'contractor', 'Test Agency', 'active');
```

### Update Existing User to Agency Admin:
```sql
UPDATE users 
SET role = 'agency_admin', agency_name = 'Your Agency Name' 
WHERE email = 'user@email.com';
```

---

## 📋 Testing Checklist

### Agency Admin Portal Testing:
- [ ] Login as agency admin
- [ ] Navigate to agency admin dashboard
- [ ] View contractors list
- [ ] Upload a timesheet (weekly)
- [ ] Upload a timesheet (monthly)
- [ ] View uploaded timesheets
- [ ] Download a timesheet
- [ ] Delete a timesheet
- [ ] Verify can only see own agency data

### Role Selector Testing:
- [ ] Select Contractor role and login
- [ ] Select Agency Admin role and login
- [ ] Select System Admin role and login
- [ ] Try selecting wrong role (should show error)
- [ ] Verify redirect to correct dashboard

### System Admin Testing:
- [ ] Login as system admin
- [ ] Access agency admin portal from navbar
- [ ] View all agencies' timesheets
- [ ] View all contractors across agencies
- [ ] Upload payslips
- [ ] Pre-register users

---

## 🔄 Reset Test Data

### Clear All Timesheets:
```sql
DELETE FROM timesheets;
```

### Reset Agency Admin Password:
```sql
UPDATE users 
SET password_hash = '$2a$10$YourNewHashedPassword' 
WHERE email = 'agencyadmin@test.com';
```

---

## 📞 Support

If you encounter any issues:
1. Check `Backend/TROUBLESHOOTING.md`
2. Review `AGENCY_ADMIN_PORTAL.md`
3. Check console logs for errors
4. Verify database tables exist
5. Ensure backend server is running on port 5001
6. Ensure frontend is running on port 3000

---

## 🎯 Quick Start

1. **Start Backend:**
   ```bash
   cd Backend
   node server.js
   ```

2. **Start Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Login:**
   - Go to http://localhost:3000/login
   - Select your role
   - Enter credentials from above
   - Start testing!

---

## 📝 Notes

- All test passwords are simple for testing purposes
- In production, use strong passwords
- Agency admin can only see contractors from their agency
- System admin has full access to all data
- Contractors can only see their own data
