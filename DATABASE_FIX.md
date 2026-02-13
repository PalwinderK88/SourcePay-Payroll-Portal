# Database Configuration Fixed

## What Was Wrong
The project was configured to use PostgreSQL but actually uses SQLite. This caused the 500 errors when fetching payslips and documents.

## What Was Fixed

### 1. Database Configuration (Backend/config/db.js)
- Changed from PostgreSQL Pool to SQLite3
- Added promisified query methods for async/await
- Connected to existing `payroll.db` file

### 2. Models Updated
All models now use SQLite syntax:
- **User model** - Changed `$1, $2` to `?, ?` placeholders
- **Payslip model** - Changed `$1, $2, $3` to `?, ?, ?` placeholders  
- **Document model** - Changed `$1, $2, $3` to `?, ?, ?` placeholders

### 3. Query Methods
- PostgreSQL: `pool.query()` returns `result.rows`
- SQLite: Custom `query()` function returns `{ rows: [] }`
- Both now work the same way in the code

## How to Restart

1. **Stop the backend server** (Ctrl+C)
2. **Restart the backend**:
   ```bash
   cd Backend
   node server.js
   ```
3. **The frontend should already be running**, but if not:
   ```bash
   cd Frontend
   npm run dev
   ```

## Testing

After restarting, test these endpoints:
- ✅ Login: http://localhost:3000/login
- ✅ Dashboard: http://localhost:3000/dashboard (should load without 500 error)
- ✅ Payslips tab: Click on "Payslips" tab
- ✅ Documents tab: Click on "Documents" tab

## Database Tables

The SQLite database (`payroll.db`) should have these tables:
- `users` - User accounts
- `payslips` - Payslip records
- `documents` - Document records

If tables don't exist, run:
```bash
cd Backend
node createTables.js
