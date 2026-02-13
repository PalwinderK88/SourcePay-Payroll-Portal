# 🔧 CHATBOT NOT VISIBLE - COMPLETE TROUBLESHOOTING GUIDE

## 📋 QUICK DIAGNOSIS

Run this command first to test if the chatbot component is properly configured:

```bash
node TEST_CHATBOT_COMPONENT.js
```

If all tests pass, the issue is **NOT** with the code - it's with:
1. **Servers not running**
2. **Browser cache**
3. **Not logged in**

---

## 🚀 SOLUTION 1: AUTOMATED FIX (RECOMMENDED)

### **Run the Diagnostic Script:**

1. **Double-click:** `DIAGNOSE_AND_FIX_CHATBOT.bat`
2. This will:
   - Kill any running Node.js processes
   - Clear build cache
   - Start both servers
   - Open the application

3. **After the script runs:**
   - Wait for both server windows to show "ready"
   - In your browser, press `Ctrl + Shift + Delete`
   - Select "All time" and clear "Cached images and files"
   - **Close ALL browser windows**
   - Open a **NEW INCOGNITO/PRIVATE window**
   - Go to: `http://localhost:3000`
   - Login with your credentials

---

## 🔍 SOLUTION 2: MANUAL STEP-BY-STEP

### **Step 1: Verify Servers Are Running**

Open Task Manager (Ctrl + Shift + Esc) and check if you see **node.exe** processes.

**If NO node.exe processes:**
```bash
# Terminal 1 - Backend
cd Backend
node server.js

# Terminal 2 - Frontend (new terminal)
cd Frontend
npm run dev
```

**If node.exe processes exist but servers aren't working:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Then start fresh (see above)
```

### **Step 2: Clear Frontend Build Cache**

```bash
# Delete the .next folder
rmdir /s /q Frontend\.next

# Restart frontend
cd Frontend
npm run dev
```

### **Step 3: Clear Browser Cache Completely**

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select **"All time"**
3. Check ALL boxes
4. Click "Clear data"
5. **Close browser completely**
6. **Reopen in incognito mode** (Ctrl + Shift + N)

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select **"Everything"**
3. Check all boxes
4. Click "Clear Now"
5. **Close browser completely**
6. **Reopen in private mode** (Ctrl + Shift + P)

### **Step 4: Access Application**

1. In incognito/private window: `http://localhost:3000`
2. **Login** with your credentials
3. Look for **GREEN BUTTON** in bottom-right corner

---

## 🐛 SOLUTION 3: DEBUGGING

### **Check Browser Console:**

1. Open application in browser
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Look for:
   - ✅ No red errors
   - ✅ "🤖 Chatbot component mounted!" (if you added console.log)
   - ❌ Any error messages about Chatbot

### **Check Network Tab:**

1. In DevTools, go to **Network** tab
2. Refresh page (Ctrl + Shift + R)
3. Look for `_app.js` in the list
4. Check:
   - Status should be **200** (not 304 from cache)
   - Size should show actual size (not "from cache")

### **Check if Logged In:**

The chatbot **ONLY shows for logged-in users**. Verify:
1. Open DevTools → Console
2. Type: `localStorage.getItem('token')`
3. Should return a token string (not null)

If null:
- You're not logged in
- Login at: `http://localhost:3000/login`

---

## 🎯 SOLUTION 4: VERIFY CHATBOT CODE

### **Check _app.js:**

```bash
# View the file
type Frontend\Pages\_app.js
```

Should contain:
```javascript
import Chatbot from '../Components/Chatbot';

// And in the return statement:
<Chatbot />
```

### **Check Chatbot.js:**

```bash
# View the file
type Frontend\Components\Chatbot.js
```

Should have:
- `position: 'fixed'`
- `zIndex: 99999`
- `display: 'flex !important'`
- `visibility: 'visible'`

---

## 🔄 SOLUTION 5: NUCLEAR OPTION (Last Resort)

If nothing else works:

### **1. Complete Clean Restart:**

```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Delete all build artifacts
rmdir /s /q Frontend\.next
rmdir /s /q Frontend\node_modules\.cache

# Reinstall dependencies (if needed)
cd Frontend
npm install

# Start fresh
cd ..
cd Backend
start cmd /k node server.js
cd ..
cd Frontend
start cmd /k npm run dev
```

### **2. Try Different Browser:**

- If using Chrome, try Edge or Firefox
- Always use incognito/private mode
- This confirms if it's browser-specific

### **3. Try Different Port:**

Edit `Frontend/package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

Then access: `http://localhost:3001`

---

## ✅ VERIFICATION CHECKLIST

Once you see the chatbot, verify it works:

- [ ] Green circular button visible in bottom-right
- [ ] Button has 💬 emoji icon
- [ ] Clicking opens chat window
- [ ] Chat window has green header
- [ ] Can see conversation starters
- [ ] Can type and send messages
- [ ] Console shows no errors

---

## 🎯 COMMON ISSUES & SOLUTIONS

### **Issue: "Cannot see chatbot after login"**
**Solution:** 
- Clear browser cache completely
- Use incognito/private mode
- Hard refresh (Ctrl + Shift + R)

### **Issue: "Chatbot was working, now it's gone"**
**Solution:**
- Servers probably stopped
- Run `DIAGNOSE_AND_FIX_CHATBOT.bat`

### **Issue: "Green button appears then disappears"**
**Solution:**
- JavaScript error in console
- Check DevTools Console for errors
- Verify backend is running on port 5000

### **Issue: "Button visible but clicking does nothing"**
**Solution:**
- Check Console for errors
- Verify FAQ routes exist: `Backend/Routes/faq.js`
- Verify chatbot service exists: `Backend/services/chatbotService.js`

### **Issue: "Works in incognito but not regular browser"**
**Solution:**
- Browser cache issue
- Clear cache completely in regular browser
- Or continue using incognito for development

---

## 📞 STILL NOT WORKING?

If you've tried everything above and still can't see the chatbot:

### **Provide this information:**

1. **Run diagnostic test:**
   ```bash
   node TEST_CHATBOT_COMPONENT.js
   ```
   Share the output

2. **Check servers:**
   - Is Backend running? (should show "Server running on port 5000")
   - Is Frontend running? (should show "ready - started server on 0.0.0.0:3000")

3. **Browser console:**
   - Press F12
   - Go to Console tab
   - Take screenshot of any errors

4. **Network tab:**
   - Press F12
   - Go to Network tab
   - Refresh page
   - Take screenshot showing _app.js loading

5. **What you see:**
   - Take screenshot of the page
   - Are you logged in?
   - What page are you on?

---

## 💡 IMPORTANT NOTES

1. **Chatbot only shows for logged-in users**
   - Must login first at `/login`
   - Token must be in localStorage

2. **Both servers must be running**
   - Backend on port 5000
   - Frontend on port 3000

3. **Browser cache is aggressive**
   - Always test in incognito/private mode
   - Clear cache between tests

4. **The code is correct**
   - If TEST_CHATBOT_COMPONENT.js passes, code is fine
   - Issue is with environment/cache/servers

---

## 🎉 SUCCESS INDICATORS

You'll know it's working when:

✅ GREEN circular button in bottom-right corner  
✅ Button has 💬 emoji icon  
✅ Button is always visible (fixed position)  
✅ Clicking opens chat window with green header  
✅ Can see conversation starters  
✅ Can interact with chatbot  
✅ No errors in browser console  

---

**Last Updated:** January 2025

**Quick Commands:**
- Test component: `node TEST_CHATBOT_COMPONENT.js`
- Auto-fix: Double-click `DIAGNOSE_AND_FIX_CHATBOT.bat`
- Manual start: Run Backend and Frontend servers separately
