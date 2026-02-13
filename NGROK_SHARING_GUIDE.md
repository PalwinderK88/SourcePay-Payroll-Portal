# Temporary Sharing Guide - Ngrok Setup

## Share Both Payroll Portal & Payroll Calculator

This guide will help you create temporary public URLs to share your applications with others.

---

## Prerequisites

1. **Install ngrok**
   - Download from: https://ngrok.com/download
   - Or install via command:
     - Windows (Chocolatey): `choco install ngrok`
     - Mac (Homebrew): `brew install ngrok/ngrok/ngrok`
     - Linux: Download and extract from website

2. **Sign up for ngrok** (Free)
   - Go to: https://dashboard.ngrok.com/signup
   - Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken
   - Run: `ngrok config add-authtoken YOUR_TOKEN_HERE`

---

## Setup Steps

### Step 1: Fix the Password Reset Error (Important!)

Before sharing, fix the database issue:

```bash
cd "C:\Users\Admin\Documents\Payroll Portal\Backend"
node addResetTokenColumns.js
```

You should see:
```
✓ Added reset_token column
✓ Added reset_token_expiry column
✅ Reset token columns added successfully!
```

### Step 2: Start Payroll Portal Backend

**Terminal 1:**
```bash
cd "C:\Users\Admin\Documents\Payroll Portal\Backend"
node server.js
```

Wait for: `✅ Server running on port 5001`

### Step 3: Expose Payroll Portal Backend

**Terminal 2:**
```bash
ngrok http 5001
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5001
```

**Copy this URL** (e.g., `https://abc123.ngrok.io`) - this is your **Backend URL**

### Step 4: Update Frontend API Configuration

Open `Frontend/utils/api.js` and temporarily change the baseURL:

```javascript
// Change from:
baseURL: 'http://localhost:5001',

// To your ngrok backend URL:
baseURL: 'https://abc123.ngrok.io',  // Use YOUR ngrok URL here
```

**Save the file!**

### Step 5: Start Payroll Portal Frontend

**Terminal 3:**
```bash
cd "C:\Users\Admin\Documents\Payroll Portal\Frontend"
npm run dev
```

Wait for: `ready - started server on 0.0.0.0:3000`

### Step 6: Expose Payroll Portal Frontend

**Terminal 4:**
```bash
ngrok http 3000
```

You'll see:
```
Forwarding  https://xyz789.ngrok.io -> http://localhost:3000
```

**This is your Payroll Portal URL to share!** 🎉

### Step 7: Start Payroll Calculator (If Separate)

If your Payroll Calculator is a separate application:

**Terminal 5:**
```bash
cd "C:\Users\Admin\Documents\Payroll Calculator"
# Start your calculator app (adjust command as needed)
npm run dev
# or
node server.js
```

### Step 8: Expose Payroll Calculator

**Terminal 6:**
```bash
ngrok http [CALCULATOR_PORT]  # Replace with actual port
```

**This is your Payroll Calculator URL to share!** 🎉

---

## Quick Reference

### Your Shareable URLs:

1. **Payroll Portal:** `https://xyz789.ngrok.io`
   - Login: admin@test.com / password123
   - Features: Payslips, Documents, User Management, Password Reset

2. **Payroll Calculator:** `https://[your-calc-url].ngrok.io`
   - (If separate application)

### Important Notes:

✅ **URLs are temporary** - They expire when you close ngrok  
✅ **Free tier limits** - 40 connections/minute, 1 online ngrok process  
✅ **Security** - Don't share sensitive data, these are public URLs  
✅ **Session duration** - URLs last as long as ngrok is running  

---

## Sharing Instructions for Recipients

Send this to people you want to share with:

```
Hi! I'm sharing the Payroll Portal with you.

🔗 Payroll Portal: https://xyz789.ngrok.io

Login Credentials:
📧 Email: admin@test.com
🔑 Password: password123

Features you can test:
✅ Login/Signup with agency selection
✅ View payslips and documents
✅ Password reset functionality
✅ Admin panel (with admin account)
✅ Upload documents

Note: This is a temporary demo link. It will expire when I stop the server.
```

---

## Troubleshooting

### Issue: "Failed to complete tunnel connection"

**Solution:** You may have hit the free tier limit. Wait a few minutes or upgrade to paid plan.

### Issue: "ERR_NGROK_108"

**Solution:** You need to add your auth token:
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### Issue: Frontend can't connect to backend

**Solution:** Make sure you updated `Frontend/utils/api.js` with the correct ngrok backend URL.

### Issue: Password reset still shows error

**Solution:** 
1. Make sure you ran `node addResetTokenColumns.js`
2. Restart the backend server
3. Check backend console for actual error

### Issue: ngrok URL shows "ngrok is not recognized"

**Solution:** 
- Windows: Add ngrok to PATH or use full path
- Or run from the folder where ngrok.exe is located

---

## Stopping Everything

When you're done sharing:

1. Press `Ctrl+C` in each terminal to stop:
   - Backend server
   - Frontend server
   - All ngrok processes

2. **Revert the API URL change:**
   - Open `Frontend/utils/api.js`
   - Change back to: `baseURL: 'http://localhost:5001',`
   - Save the file

---

## Alternative: ngrok Dashboard

For better management:

1. Go to: https://dashboard.ngrok.com/
2. View all active tunnels
3. See connection statistics
4. Manage multiple tunnels

---

## Upgrading (Optional)

**Free Plan Limitations:**
- 1 online ngrok process
- 40 connections/minute
- Random URLs each time

**Paid Plans ($8/month+):**
- Multiple simultaneous tunnels
- Custom domains
- More connections
- Reserved URLs

---

## Security Best Practices

⚠️ **Before sharing:**

1. **Change default passwords** - Don't use admin@test.com/password123 in production
2. **Limit access** - Only share with trusted people
3. **Monitor usage** - Check ngrok dashboard for activity
4. **Time limit** - Only keep ngrok running when needed
5. **No sensitive data** - Don't use real user data for demos

---

## Quick Start Commands (Copy-Paste)

```bash
# Terminal 1 - Backend
cd "C:\Users\Admin\Documents\Payroll Portal\Backend"
node addResetTokenColumns.js
node server.js

# Terminal 2 - Expose Backend
ngrok http 5001

# Terminal 3 - Frontend (after updating api.js)
cd "C:\Users\Admin\Documents\Payroll Portal\Frontend"
npm run dev

# Terminal 4 - Expose Frontend
ngrok http 3000
```

---

## Need Help?

- ngrok Documentation: https://ngrok.com/docs
- ngrok Community: https://ngrok.com/slack
- Check backend console for errors
- Check browser console (F12) for frontend errors

---

**Remember:** These URLs are temporary and will change each time you restart ngrok!
