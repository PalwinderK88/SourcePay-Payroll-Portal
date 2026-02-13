# Login Troubleshooting Guide

## ✅ Available Login Credentials

Based on the database check, here are the valid login credentials:

### **1. Admin Account**
- **Email:** `admin@test.com`
- **Password:** `admin123` (default)
- **Role:** Admin
- **Access:** Full system access

### **2. Test Contractor**
- **Email:** `contractor@test.com`
- **Password:** `contractor123` (default)
- **Role:** Contractor
- **Access:** Contractor dashboard

### **3. Agency Admin**
- **Email:** `agencyadmin@test.com`
- **Password:** `agency123` (default)
- **Role:** Agency Admin
- **Access:** Agency management

### **4. Pal (Contractor)**
- **Email:** `it@sourcepay.co.uk`
- **Password:** (Check with team)
- **Role:** Contractor

### **5. Palwinder Kaur (Contractor)**
- **Email:** `it@pjn-group.com`
- **Password:** (Check with team)
- **Role:** Contractor

---

## 🔍 Why Login Might Not Be Working

### **Issue 1: Backend Server Not Running**
**Symptom:** Login button does nothing, or shows "Network Error"

**Solution:**
1. Check if backend is running on port 5003
2. Kill all node processes:
   ```powershell
   taskkill /F /IM node.exe
   ```
3. Start backend:
   ```powershell
   cd Backend
   node server.js
   ```
4. You should see:
   ```
   ✅ Server running on port 5003
   🔌 Socket.IO ready for connections
   📅 Document reminder service active
   🔔 Notification service initialized
   💬 FAQ/Chatbot service ready
   ```

### **Issue 2: Frontend Not Running**
**Symptom:** Can't access http://localhost:3000

**Solution:**
1. Start frontend in a NEW terminal:
   ```powershell
   cd Frontend
   npm run dev
   ```
2. Access at: `http://localhost:3000`

### **Issue 3: Port Conflicts**
**Symptom:** "EADDRINUSE" error

**Solution:**
1. Kill all node processes (as Administrator):
   ```powershell
   taskkill /F /IM node.exe
   ```
2. Or restart your computer
3. Then start backend and frontend again

### **Issue 4: Wrong API URL**
**Symptom:** Login fails with 404 or connection error

**Check:** Frontend is pointing to correct backend URL

**File:** `Frontend/utils/api.js`
```javascript
const API_URL = 'http://localhost:5003/api';
```

If backend is on different port, update this file.

---

## 🧪 Test Login Manually

### **Step 1: Verify Backend is Running**
Open browser and go to:
```
http://localhost:5003
```
You should see: "Backend is running"

### **Step 2: Test Login API Directly**
Use this PowerShell command to test login:
```powershell
$body = @{
    email = "contractor@test.com"
    password = "contractor123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5003/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "name": "Test Contractor",
    "email": "contractor@test.com",
    "role": "contractor"
  }
}
```

### **Step 3: Test Frontend**
1. Go to `http://localhost:3000`
2. Enter credentials:
   - Email: `contractor@test.com`
   - Password: `contractor123`
3. Click "Login"

---

## 🔧 Quick Fix Commands

### **Complete Reset (Run as Administrator)**
```powershell
# Kill all node processes
taskkill /F /IM node.exe

# Start backend
cd "C:\Users\Admin\Documents\Payroll Portal\Backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start frontend
cd "C:\Users\Admin\Documents\Payroll Portal\Frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

### **Check What's Running**
```powershell
# Check if backend is running
Test-NetConnection -ComputerName localhost -Port 5003

# Check if frontend is running
Test-NetConnection -ComputerName localhost -Port 3000
```

---

## 📝 Common Error Messages

### **"Network Error" or "Failed to fetch"**
- Backend is not running
- Wrong API URL in frontend
- CORS issue (should be fixed in server.js)

### **"Invalid credentials"**
- Wrong email or password
- User doesn't exist in database
- Password hash mismatch

### **"Cannot read property 'token' of undefined"**
- Backend returned error
- Check backend console for errors
- Check browser console (F12) for details

### **Page just refreshes, nothing happens**
- JavaScript error in frontend
- Check browser console (F12)
- Check if all frontend files are present

---

## 🎯 Step-by-Step Login Process

1. **Kill all node processes:**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Start Backend (Terminal 1):**
   ```powershell
   cd Backend
   node server.js
   ```
   Wait for: "✅ Server running on port 5003"

3. **Start Frontend (Terminal 2):**
   ```powershell
   cd Frontend
   npm run dev
   ```
   Wait for: "ready - started server on 0.0.0.0:3000"

4. **Open Browser:**
   ```
   http://localhost:3000
   ```

5. **Login:**
   - Email: `contractor@test.com`
   - Password: `contractor123`

6. **After Login, you should see:**
   - Dashboard with payslips
   - Chatbot button (💬) in bottom-right
   - Notification bell in navbar
   - Document status section

---

## 🆘 Still Not Working?

### **Check Backend Logs**
Look at the terminal where backend is running. You should see:
- Login attempts
- Any errors
- API requests

### **Check Frontend Console**
1. Open browser
2. Press F12
3. Go to Console tab
4. Look for errors (red text)

### **Check Network Tab**
1. Open browser
2. Press F12
3. Go to Network tab
4. Try to login
5. Look for failed requests (red)
6. Click on failed request to see details

### **Verify Database**
```powershell
cd Backend
node checkUsers.js
```
Should show 5 users including contractor@test.com

---

## ✅ Success Checklist

- [ ] Backend running on port 5003
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:5003 (shows "Backend is running")
- [ ] Can access http://localhost:3000 (shows login page)
- [ ] No errors in backend terminal
- [ ] No errors in browser console (F12)
- [ ] Users exist in database (checked with checkUsers.js)
- [ ] Using correct credentials (contractor@test.com / contractor123)

---

## 🎉 After Successful Login

You should be able to access:

1. **Dashboard** - Main page with overview
2. **Payslips** - View payslips with breakdown button
3. **Documents** - Upload and view documents
4. **Notifications** - Bell icon in navbar
5. **Chatbot** - 💬 button in bottom-right corner
6. **FAQ Page** - Navigate to /faq

---

## 📞 Need More Help?

If login still doesn't work after following all steps:

1. Take a screenshot of:
   - Backend terminal output
   - Frontend terminal output
   - Browser console (F12 → Console tab)
   - Network tab showing failed request

2. Note which step failed:
   - Can't start backend?
   - Can't start frontend?
   - Can access pages but login fails?
   - Login succeeds but redirects to wrong page?

3. Check if any antivirus/firewall is blocking ports 3000 or 5003
