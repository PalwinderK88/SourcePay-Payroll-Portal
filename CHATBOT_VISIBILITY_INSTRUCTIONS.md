# Chatbot Visibility Instructions

## Important: The chatbot ONLY appears for LOGGED-IN users!

The chatbot is configured to show only when a user is authenticated. Here's how to see it:

## Steps to See the Chatbot:

### 1. Make Sure You're Logged In
- Go to http://localhost:3000
- If you see the login page, enter credentials:
  - **Email:** contractor@test.com
  - **Password:** contractor123
- Click "Login"

### 2. After Login, Look for the Chatbot Button
- The chatbot appears as a **GREEN circular button** with a 💬 icon
- Location: **Bottom-right corner** of the screen
- It should be visible on ALL pages after login (dashboard, payslips, documents, etc.)

### 3. If You Still Don't See It:

#### Option A: Clear Browser Cache (Recommended)
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page (F5)
5. Log in again

#### Option B: Use Incognito/Private Mode
1. Open a new Incognito/Private window
2. Go to http://localhost:3000
3. Log in with the test credentials
4. The chatbot should appear

#### Option C: Clear Next.js Cache and Restart
Run this command from the project root:
```bash
.\CLEAR_CACHE_AND_RESTART.bat
```

### 4. Verify Chatbot is Working:
Once you see the green button:
1. Click the 💬 button
2. A chat window should open
3. You'll see conversation starters with categories
4. Try asking a question like "How do I view my payslips?"

## Technical Details:

### Why the Chatbot Only Shows for Logged-In Users:
The chatbot component checks for authentication:
```javascript
const token = localStorage.getItem('token');
setIsLoggedIn(!!token);

if (!isLoggedIn) {
  return null; // Don't render if not logged in
}
```

### Chatbot Features:
- ✅ AI-powered FAQ search
- ✅ Category-based navigation
- ✅ Quick action suggestions
- ✅ Direct links to detailed FAQ pages
- ✅ Real-time responses

### Chatbot Button Styling:
- Position: Fixed bottom-right (24px from edges)
- Size: 60x60 pixels
- Color: Green gradient (#3d5a3d to #2d4a2d)
- Z-index: 99999 (always on top)
- Shadow: Visible drop shadow

## Troubleshooting Checklist:

- [ ] Backend server is running on port 5003
- [ ] Frontend server is running on port 3000
- [ ] You are logged in (check for token in localStorage)
- [ ] Browser cache is cleared
- [ ] No JavaScript errors in browser console (F12)
- [ ] Page is fully loaded

## Still Having Issues?

1. Open browser console (F12)
2. Check for any error messages
3. Verify the token exists:
   ```javascript
   localStorage.getItem('token')
   ```
4. Check if Chatbot component is mounted:
   ```javascript
   document.querySelector('[title="Need help? Chat with us!"]')
   ```

## Quick Test:
After logging in, open browser console (F12) and run:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

If both show values, the chatbot should be visible!
