# Quick Start Guide - Payroll Portal

## Prerequisites
- Node.js installed
- PostgreSQL installed and running

## Setup Steps

### 1. Install Dependencies

```bash
# Backend
cd Backend
npm install

# Frontend (in a new terminal)
cd Frontend
npm install
```

### 2. Configure Environment

Create `Backend/.env` file (or copy from `Backend/.env.example`):
```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=payroll
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_secret_key_here

# Server Configuration
PORT=5001

# Email Configuration (for welcome emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**Note:** Email configuration is optional but recommended. See `EMAIL_SETUP.md` for detailed setup instructions.

### 3. Setup Email (Optional but Recommended)

To enable welcome emails when users sign up:

1. **Quick Setup with Gmail:**
   - Enable 2-Factor Authentication on your Gmail account
   - Generate an App Password (Google Account → Security → App passwords)
   - Add to `.env` file:
     ```env
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-16-char-app-password
     ```

2. **Test Email Configuration:**
   ```bash
   cd Backend
   node testEmail.js
   ```

3. **For detailed setup instructions**, see `EMAIL_SETUP.md`

**Skip this step if you don't need email functionality yet.**

### 4. Setup Database

```bash
cd Backend

# Run diagnostics to check everything
node diagnose.js

# If tables don't exist, create them
node createTables.js

# If no users exist, create a test user
node createuser.js
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd Backend
node server.js
```
You should see: `✅ Server running on port 5001`

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```
You should see: `ready - started server on 0.0.0.0:3000`

### 6. Test Login

**Option A: Using the test script**
```bash
cd Backend
node testLogin.js
```

**Option B: Using the browser**
1. Open http://localhost:3000/login
2. Enter credentials (default: admin@test.com / password123)
3. Click Login

### 7. Test Signup with Email

1. Go to http://localhost:3000/signup
2. Create a new account
3. Check your email for the welcome message
4. If email doesn't arrive, check spam folder or see `EMAIL_SETUP.md`

## Troubleshooting

If login fails, run the diagnostic script:
```bash
cd Backend
node diagnose.js
```

This will check:
- ✅ Database connection
- ✅ Users table exists
- ✅ Users in database
- ✅ Environment variables

For detailed troubleshooting, see `Backend/TROUBLESHOOTING.md`

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration

### Payslips
- GET `/api/payslips/` - Get user's payslips (authenticated)
- GET `/api/payslips/all` - Get all payslips (admin only)
- POST `/api/payslips/upload` - Upload payslip (admin only)

### Documents
- GET `/api/documents/` - Get user's documents (authenticated)
- POST `/api/documents/upload` - Upload document (admin only)

### Users
- POST `/api/users/login` - Alternative login endpoint

## Default Test User

After running `createuser.js`, you'll have:
- Email: admin@test.com
- Password: password123
- Role: admin

## Common Issues

### "Login failed" error
1. Check if PostgreSQL is running
2. Run `node diagnose.js` to identify the issue
3. Check browser console for detailed error
4. Check server console for backend errors

### Database connection error
- Verify PostgreSQL is running
- Check `.env` file credentials
- Ensure database 'payroll' exists

### "Users table does not exist"
```bash
cd Backend
node createTables.js
```

### "No users found"
```bash
cd Backend
node createuser.js
```

### Email not sending
1. Check if EMAIL_USER and EMAIL_PASSWORD are set in `.env`
2. Run `node testEmail.js` to test email configuration
3. See `EMAIL_SETUP.md` for detailed troubleshooting
4. For Gmail: Make sure you're using an App Password, not your regular password
