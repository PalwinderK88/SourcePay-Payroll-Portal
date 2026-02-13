# Chatbot Not Visible - Troubleshooting Guide

## 🔍 Issue: Chatbot Button Not Showing After Login

### **Root Cause:**
The frontend was cached with the old port configuration (5001). After updating to port 5003, the frontend needs to be completely restarted and browser cache cleared.

---

## ✅ SOLUTION - Complete Reset (Follow These Steps)

### **Step 1: Kill All Node Processes**
```powershell
# Run as Administrator
taskkill /F /IM node.exe
```

### **Step 2: Clear Browser Cache**
**Option A - Hard Refresh:**
- Press `Ctrl + Shift + Delete`
- Select "Cached images and files"
- Click "Clear data"

**Option B - Incognito Mode:**
- Open browser in Incognito/Private mode
- This bypasses cache completely

### **Step 3: Delete Frontend Build Cache**
```powershell
cd Frontend
rmdir /s /q .next
```

### **Step 4: Start Backend**
```powershell
cd Backend
node server.js
```
**Wait for:** "✅ Server running on port 5003"

### **Step 5: Start Frontend (New Terminal)**
```powershell
cd Frontend
npm run dev
```
**Wait for:** "ready - started server on 0.0.0.0:3000"

### **Step 6: Open Browser**
```
http://localhost:3000
```

### **Step 7: Login**
- Email: `contractor@test.com`
- Password: `contractor123`

### **Step 8: Look for Chatbot**
After login, you should see:
- 💬 Button in **bottom-right corner** of the screen
- It should be a circular green button with a chat icon

---

## 🎯 What You Should See

### **Before Login:**
- Login page only
- NO chatbot button (this is correct)

### **After Login:**
```
┌─────────────────────────────────────┐
│  Dashboard                    🔔 👤 │
│                                     │
│  Your content here...               │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                              [💬]   │ ← Chatbot button here
└─────────────────────────────────────┘
```

The chatbot button should be:
- **Position:** Bottom-right corner
- **Size:** 60px circle
- **Color:** Dark green gradient
- **Icon:** 💬 (chat bubble emoji)
- **Always visible:** On every page after login

---

## 🔧 Alternative: Use Startup Script

### **Option 1: Double-click START_APPLICATION.bat**
This will:
1. Kill all node processes
2. Start backend
3. Start frontend
4. Open browser automatically

### **Option 2: Manual PowerShell Script**
```powershell
# Run this entire block in PowerShell (as Administrator)

# Kill processes
taskkill /F /IM node.exe

# Wait
Start-Sleep -Seconds 2

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Admin\Documents\Payroll Portal\Backend'; node server.js"

# Wait for backend
Start-Sleep -Seconds 5

# Clear frontend cache
cd "C:\Users\Admin\Documents\Payroll Portal\Frontend"
if (Test-Path .next) { Remove-Item -Recurse -Force .next }

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Admin\Documents\Payroll Portal\Frontend'; npm run dev"

# Wait for frontend
Start-Sleep -Seconds 8

# Open browser
Start-Process "http://localhost:3000"
```

---

## 🐛 Still Not Visible? Check These:

### **1. Check Browser Console (F12)**
```javascript
// You should see these logs:
"Socket already connected" or "🔌 Connected to Socket.IO server"
```

### **2. Check if Chatbot Component Loaded**
```javascript
// In browser console, type:
document.querySelector('[title="Need help? Chat with us!"]')
// Should return: <button>...</button>
```

### **3. Check CSS/Styling**
The chatbot uses inline styles, so it should always be visible. If not:
- Check if any other CSS is overriding `z-index: 1000`
- Check if `position: fixed` is being overridden

### **4. Check Network Tab**
- Open F12 → Network tab
- Look for requests to `/api/chatbot/starters`
- Should return 200 OK with category data

### **5. Verify Backend is Running**
```powershell
# Test backend directly
curl http://localhost:5003
# Should return: "Backend is running"

# Test chatbot endpoint
curl http://localhost:5003/api/chatbot/starters
# Should return JSON with categories
```

---

## 📱 Mobile/Responsive View

If you're testing on a small screen:
- Chatbot button might be hidden by other elements
- Try zooming out (Ctrl + Mouse Wheel)
- Or resize browser window to full screen

---

## 🎨 Visual Debugging

### **Add This to Browser Console:**
```javascript
// Force show chatbot button
const style = document.createElement('style');
style.innerHTML = `
  button[title="Need help? Chat with us!"] {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    z-index: 9999 !important;
  }
`;
document.head.appendChild(style);
```

If this makes it appear, there's a CSS conflict.

---

## 🔄 Complete Fresh Start

If nothing works, do a complete fresh start:

### **1. Stop Everything**
```powershell
taskkill /F /IM node.exe
```

### **2. Clear All Caches**
```powershell
# Frontend
cd Frontend
rmdir /s /q .next
rmdir /s /q node_modules\.cache

# Browser
# Clear all browsing data (Ctrl + Shift + Delete)
```

### **3. Reinstall Dependencies (if needed)**
```powershell
cd Frontend
npm install
```

### **4. Start Fresh**
```powershell
# Terminal 1: Backend
cd Backend
node server.js

# Terminal 2: Frontend
cd Frontend
npm run dev
```

### **5. Use Incognito Mode**
- Open browser in Incognito/Private mode
- Go to http://localhost:3000
- Login
- Check for chatbot button

---

## ✅ Success Checklist

After following the steps, you should have:

- [ ] Backend running on port 5003
- [ ] Frontend running on port 3000
- [ ] Successfully logged in
- [ ] Can see dashboard
- [ ] **Chatbot button visible in bottom-right corner**
- [ ] Clicking chatbot opens chat window
- [ ] Can see welcome message with category cards
- [ ] Can type and send messages

---

## 📞 If Still Not Working

### **Take Screenshots of:**
1. Full browser window after login
2. Browser console (F12 → Console tab)
3. Network tab (F12 → Network tab)
4. Backend terminal output
5. Frontend terminal output

### **Check:**
- Are there any JavaScript errors in console?
- Are there any failed network requests?
- Is the backend responding to requests?
- Is Socket.IO connected?

### **Try:**
1. Different browser (Chrome, Firefox, Edge)
2. Incognito/Private mode
3. Different user account
4. Restart computer (clears all ports and caches)

---

## 🎯 Expected Behavior

### **Chatbot Button:**
- Always visible after login
- Bottom-right corner
- Circular, green gradient
- 60px × 60px
- Hover effect (slight scale)
- Click to open chat window

### **Chat Window:**
- Opens on button click
- 400px × 600px
- Bottom-right corner
- Shows welcome message
- Shows 5 category cards (CIS, Umbrella, PAYE, EOR, General)
- Has input field at bottom
- Has "Browse all FAQs" link in footer

---

## 🚀 Quick Test

After starting everything, run this in browser console:

```javascript
// Test 1: Check if Chatbot component exists
console.log('Chatbot button:', document.querySelector('[title="Need help? Chat with us!"]'));

// Test 2: Check if API is accessible
fetch('http://localhost:5003/api/chatbot/starters')
  .then(r => r.json())
  .then(d => console.log('Chatbot API working:', d))
  .catch(e => console.error('Chatbot API error:', e));

// Test 3: Check Socket.IO
console.log('Socket.IO loaded:', typeof io !== 'undefined');
```

All three should return positive results.
