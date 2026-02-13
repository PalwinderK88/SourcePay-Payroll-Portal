# Troubleshooting Login Issues

## Common Issues and Solutions

### 1. Database Connection Issue
The project is configured for PostgreSQL but you might not have it running.

**Check if PostgreSQL is running:**
```bash
# Windows
Get-Service -Name postgresql*

# If not running, start it
Start-Service postgresql-x64-14  # adjust version number
```

**Alternative: Check if you have users in the database:**
```bash
cd Backend
node checkUsers.js
```

### 2. Missing Environment Variables
Create a `.env` file in the Backend directory:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=payroll
DB_PASSWORD=your_password_here
DB_PORT=5432
JWT_SECRET=your_secret_key_here
PORT=5001
```

### 3. No Users in Database
If the database is empty, create a test user:

```bash
cd Backend
node createuser.js
```

### 4. Test the Login Endpoint
After ensuring the database has users:

```bash
# Start the server
cd Backend
node server.js

# In another terminal, test login
node testLogin.js
```

### 5. Check Server Logs
When you try to login, check the server console for error messages. Common errors:
- `ECONNREFUSED` - Database not running
- `relation "users" does not exist` - Tables not created
- `Invalid credentials` - Wrong email/password or user doesn't exist

### 6. Frontend API Configuration
Make sure the frontend is pointing to the correct backend URL.

Check `Frontend/utils/api.js`:
```javascript
baseURL: "http://localhost:5001"
```

### 7. CORS Issues
If you see CORS errors in browser console, the backend CORS is already configured, but make sure:
- Backend is running on port 5001
- Frontend is making requests to http://localhost:5001

## Step-by-Step Debugging

1. **Start Backend Server:**
   ```bash
   cd Backend
   node server.js
   ```
   You should see: `✅ Server running on port 5001`

2. **Check if server is responding:**
   Open browser and go to: http://localhost:5001
   You should see: "Backend is running"

3. **Test login with existing user:**
   ```bash
   node testLogin.js
   ```

4. **Check browser console:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try to login
   - Check the request to `/api/auth/login`
   - Look at the response

## Quick Fix Commands

```bash
# Install dependencies
cd Backend
npm install

# Create tables (if using PostgreSQL)
node createTables.js

# Create a test user
node createuser.js

# Start server
node server.js
```

## Expected Login Flow

1. User enters email and password in frontend
2. Frontend sends POST to `http://localhost:5001/api/auth/login`
3. Backend checks user in database
4. Backend returns: `{ token: "...", user: { id, name, role } }`
5. Frontend stores token in localStorage
6. Frontend redirects to homepage

## If Still Not Working

Please provide:
1. Error message from browser console
2. Error message from server console
3. Output of `node checkUsers.js`
4. Database type you're using (PostgreSQL or SQLite)
