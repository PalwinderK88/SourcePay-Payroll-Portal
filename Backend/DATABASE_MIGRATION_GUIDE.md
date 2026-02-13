# Database Migration Guide: SQLite to PostgreSQL

## 🎯 Overview

This guide will help you migrate your Payroll Portal from SQLite to PostgreSQL for production readiness.

**Estimated Time:** 4-6 hours  
**Difficulty:** Intermediate  
**Backup Required:** Yes (critical!)

---

## 📋 Table of Contents

1. [Why PostgreSQL?](#why-postgresql)
2. [Prerequisites](#prerequisites)
3. [Step 1: Install PostgreSQL](#step-1-install-postgresql)
4. [Step 2: Export SQLite Data](#step-2-export-sqlite-data)
5. [Step 3: Update Database Configuration](#step-3-update-database-configuration)
6. [Step 4: Update Code for PostgreSQL](#step-4-update-code-for-postgresql)
7. [Step 5: Create PostgreSQL Schema](#step-5-create-postgresql-schema)
8. [Step 6: Import Data](#step-6-import-data)
9. [Step 7: Test Migration](#step-7-test-migration)
10. [Step 8: Update Dependencies](#step-8-update-dependencies)
11. [Troubleshooting](#troubleshooting)

---

## Why PostgreSQL?

### SQLite Limitations (Current)
- ❌ No concurrent write support (crashes with multiple users)
- ❌ File-based (single point of failure)
- ❌ No built-in replication
- ❌ Limited scalability
- ❌ No user management
- ❌ Not suitable for web applications

### PostgreSQL Benefits (Production)
- ✅ Handles thousands of concurrent connections
- ✅ ACID compliant with full transaction support
- ✅ Built-in replication and backup
- ✅ Excellent performance and scalability
- ✅ Industry standard for production
- ✅ Advanced features (JSON, full-text search, etc.)

---

## Prerequisites

### Required Tools
```bash
# Check if you have Node.js
node --version  # Should be v14 or higher

# Check if you have npm
npm --version
```

### Backup Current Database
```bash
# CRITICAL: Backup your SQLite database first!
cd Backend
copy payroll.db payroll.db.backup
# Or on Mac/Linux: cp payroll.db payroll.db.backup
```

---

## Step 1: Install PostgreSQL

### Option A: Windows (Recommended)

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or 16 installer
   - Run the installer

2. **Installation Settings:**
   ```
   Port: 5432 (default)
   Password: [Choose a strong password - REMEMBER THIS!]
   Locale: Default
   ```

3. **Verify Installation:**
   ```bash
   # Open Command Prompt or PowerShell
   psql --version
   # Should show: psql (PostgreSQL) 15.x or 16.x
   ```

### Option B: Mac (Using Homebrew)

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Verify
psql --version
```

### Option C: Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
psql --version
```

### Option D: Cloud Database (Easiest for Production)

**Recommended Cloud Providers:**

1. **Supabase (Free tier available)**
   - Go to: https://supabase.com
   - Create account and new project
   - Get connection string from Settings > Database
   - Skip local installation steps

2. **Railway (Free tier available)**
   - Go to: https://railway.app
   - Create PostgreSQL database
   - Get connection string

3. **Heroku Postgres (Free tier available)**
   - Go to: https://www.heroku.com/postgres
   - Create database
   - Get connection string

4. **AWS RDS (Paid)**
   - Most robust for production
   - Automated backups
   - High availability

---

## Step 2: Export SQLite Data

### Create Export Script

Create a file: `Backend/exportSQLiteData.js`

```javascript
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

const exportData = async () => {
  console.log('📊 Exporting SQLite data...\n');

  const tables = [
    'users',
    'agencies',
    'payslips',
    'documents',
    'timesheets',
    'notifications',
    'faqs',
    'notification_preferences'
  ];

  const exportedData = {};

  for (const table of tables) {
    try {
      const data = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
          if (err) {
            console.log(`⚠️  Table ${table} not found or error: ${err.message}`);
            resolve([]);
          } else {
            resolve(rows);
          }
        });
      });

      exportedData[table] = data;
      console.log(`✅ Exported ${data.length} rows from ${table}`);
    } catch (error) {
      console.log(`❌ Error exporting ${table}:`, error.message);
      exportedData[table] = [];
    }
  }

  // Save to JSON file
  const outputPath = path.join(__dirname, 'sqlite_export.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportedData, null, 2));
  
  console.log(`\n✅ Data exported to: ${outputPath}`);
  console.log('\n📊 Export Summary:');
  Object.keys(exportedData).forEach(table => {
    console.log(`   ${table}: ${exportedData[table].length} rows`);
  });

  db.close();
};

exportData().catch(console.error);
```

### Run Export

```bash
cd Backend
node exportSQLiteData.js
```

**Expected Output:**
```
📊 Exporting SQLite data...

✅ Exported 5 rows from users
✅ Exported 22 rows from agencies
✅ Exported 2 rows from payslips
✅ Exported 4 rows from documents
✅ Exported 0 rows from timesheets
✅ Exported 0 rows from notifications
✅ Exported 15 rows from faqs
✅ Exported 0 rows from notification_preferences

✅ Data exported to: C:\...\Backend\sqlite_export.json
```

---

## Step 3: Update Database Configuration

### Install PostgreSQL Driver

```bash
cd Backend
npm install pg
# pg is already in package.json, but ensure it's installed
```

### Create New Database Config

**Backup current config:**
```bash
copy config\db.js config\db.js.sqlite.backup
# Or: cp config/db.js config/db.js.sqlite.backup
```

**Replace `config/db.js` with:**

```javascript
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Promisified query function
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return { rows: res.rows };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Promisified run function (for INSERT/UPDATE/DELETE)
const run = async (text, params = []) => {
  try {
    const res = await pool.query(text, params);
    return {
      lastID: res.rows[0]?.id || null,
      changes: res.rowCount
    };
  } catch (error) {
    console.error('Database run error:', error);
    throw error;
  }
};

// Get a client from the pool for transactions
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  query,
  run,
  pool,
  getClient
};
```

### Update Environment Variables

Create or update `.env` file:

```bash
# .env file

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/payroll_db

# For local PostgreSQL:
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/payroll_db

# For cloud database (Supabase example):
# DATABASE_URL=postgresql://postgres:your_password@db.xxx.supabase.co:5432/postgres

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Server Configuration
PORT=5003
NODE_ENV=development

# Octapay Integration
OCTAPAY_API_KEY=your-api-key-here
OCTAPAY_WEBHOOK_SECRET=your-webhook-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Important:** Replace the values with your actual credentials!

---

## Step 4: Update Code for PostgreSQL

### Key Differences: SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Parameter placeholder | `?` | `$1, $2, $3` |
| Auto-increment | `AUTOINCREMENT` | `SERIAL` or `GENERATED ALWAYS AS IDENTITY` |
| Boolean | `0/1` | `TRUE/FALSE` |
| Date/Time | Text | `TIMESTAMP` |
| RETURNING clause | Not supported | Supported |

### Update All Model Files

You need to update the SQL syntax in all model files. Here's how:

#### Example: Update `models/user.js`

**BEFORE (SQLite):**
```javascript
static async create(name, email, password, role = 'employee', agency_id = null, agency_name = null) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await run(
    'INSERT INTO users(name, email, password_hash, role, agency_id, agency_name) VALUES(?, ?, ?, ?, ?, ?)',
    [name, email, hashedPassword, role, agency_id, agency_name]
  );
  return { id: result.lastID, name, email, role, agency_id, agency_name };
}
```

**AFTER (PostgreSQL):**
```javascript
static async create(name, email, password, role = 'employee', agency_id = null, agency_name = null) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users(name, email, password_hash, role, agency_id, agency_name) VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
    [name, email, hashedPassword, role, agency_id, agency_name]
  );
  return { id: result.rows[0].id, name, email, role, agency_id, agency_name };
}
```

**Key Changes:**
1. `?` → `$1, $2, $3, ...`
2. Add `RETURNING id` to get the inserted ID
3. Access ID via `result.rows[0].id` instead of `result.lastID`

### Create Update Script

Create `Backend/updateModelsForPostgreSQL.js`:

```javascript
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const files = fs.readdirSync(modelsDir);

console.log('🔄 Updating model files for PostgreSQL...\n');

files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Backup original
    fs.writeFileSync(filePath + '.sqlite.backup', content);
    
    // Replace ? with $1, $2, etc.
    let paramCount = 0;
    content = content.replace(/\?/g, () => {
      paramCount++;
      return `$${paramCount}`;
    });
    
    // Reset counter for each query
    content = content.replace(/('INSERT INTO[^']+)/g, (match) => {
      paramCount = 0;
      return match.replace(/\$\d+/g, () => {
        paramCount++;
        return `$${paramCount}`;
      });
    });
    
    console.log(`✅ Updated: ${file}`);
  }
});

console.log('\n⚠️  Manual review required!');
console.log('Please check each model file and:');
console.log('1. Add RETURNING id to INSERT statements');
console.log('2. Update result.lastID to result.rows[0].id');
console.log('3. Verify parameter numbering is correct');
```

**Note:** This script provides a starting point, but you'll need to manually review and update each model file.

---

## Step 5: Create PostgreSQL Schema

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE payroll_db;

# Connect to the new database
\c payroll_db

# Exit
\q
```

### Create Schema Script

Create `Backend/createPostgreSQLSchema.js`:

```javascript
const { pool } = require('./config/db');

const createTables = async () => {
  console.log('📊 Creating PostgreSQL schema...\n');

  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'contractor',
        agency_id INTEGER,
        agency_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        reset_token VARCHAR(255),
        reset_token_expiry BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created users table');

    // Agencies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agencies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        logo_path TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created agencies table');

    // Payslips table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payslips (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        month VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        gross_pay DECIMAL(10, 2),
        net_pay DECIMAL(10, 2),
        tax DECIMAL(10, 2),
        ni DECIMAL(10, 2),
        pension DECIMAL(10, 2),
        other_deductions DECIMAL(10, 2),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created payslips table');

    // Documents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        file_path TEXT NOT NULL,
        expiry_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by INTEGER,
        rejection_reason TEXT,
        reminder_sent BOOLEAN DEFAULT FALSE,
        last_reminder_date DATE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created documents table');

    // Timesheets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timesheets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        week_ending DATE NOT NULL,
        hours_worked DECIMAL(5, 2) NOT NULL,
        file_path TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created timesheets table');

    // Notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created notifications table');

    // FAQs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        keywords TEXT,
        helpful_count INTEGER DEFAULT 0,
        not_helpful_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created faqs table');

    // Notification preferences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        push_notifications BOOLEAN DEFAULT TRUE,
        document_reminders BOOLEAN DEFAULT TRUE,
        payslip_notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created notification_preferences table');

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_agency_id ON users(agency_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_payslips_user_id ON payslips(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');
    console.log('✅ Created indexes');

    console.log('\n✅ PostgreSQL schema created successfully!');
  } catch (error) {
    console.error('❌ Error creating schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

createTables();
```

### Run Schema Creation

```bash
cd Backend
node createPostgreSQLSchema.js
```

---

## Step 6: Import Data

### Create Import Script

Create `Backend/importDataToPostgreSQL.js`:

```javascript
const { pool } = require('./config/db');
const fs = require('fs');
const path = require('path');

const importData = async () => {
  console.log('📥 Importing data to PostgreSQL...\n');

  try {
    // Read exported data
    const exportPath = path.join(__dirname, 'sqlite_export.json');
    const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));

    // Import agencies first (referenced by users)
    if (data.agencies && data.agencies.length > 0) {
      console.log(`Importing ${data.agencies.length} agencies...`);
      for (const agency of data.agencies) {
        await pool.query(
          'INSERT INTO agencies (id, name, logo_path, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [agency.id, agency.name, agency.logo_path, agency.created_at]
        );
      }
      // Reset sequence
      await pool.query(`SELECT setval('agencies_id_seq', (SELECT MAX(id) FROM agencies))`);
      console.log('✅ Agencies imported');
    }

    // Import users
    if (data.users && data.users.length > 0) {
      console.log(`Importing ${data.users.length} users...`);
      for (const user of data.users) {
        await pool.query(
          `INSERT INTO users (id, name, email, password_hash, role, agency_id, agency_name, status, reset_token, reset_token_expiry, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (email) DO NOTHING`,
          [
            user.id,
            user.name,
            user.email,
            user.password_hash,
            user.role,
            user.agency_id,
            user.agency_name,
            user.status || 'active',
            user.reset_token,
            user.reset_token_expiry,
            user.created_at
          ]
        );
      }
      await pool.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`);
      console.log('✅ Users imported');
    }

    // Import payslips
    if (data.payslips && data.payslips.length > 0) {
      console.log(`Importing ${data.payslips.length} payslips...`);
      for (const payslip of data.payslips) {
        await pool.query(
          `INSERT INTO payslips (id, user_id, month, year, file_path, gross_pay, net_pay, tax, ni, pension, other_deductions, uploaded_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            payslip.id,
            payslip.user_id,
            payslip.month,
            payslip.year,
            payslip.file_path,
            payslip.gross_pay,
            payslip.net_pay,
            payslip.tax,
            payslip.ni,
            payslip.pension,
            payslip.other_deductions,
            payslip.uploaded_at
          ]
        );
      }
      await pool.query(`SELECT setval('payslips_id_seq', (SELECT MAX(id) FROM payslips))`);
      console.log('✅ Payslips imported');
    }

    // Import documents
    if (data.documents && data.documents.length > 0) {
      console.log(`Importing ${data.documents.length} documents...`);
      for (const doc of data.documents) {
        await pool.query(
          `INSERT INTO documents (id, user_id, document_type, file_path, expiry_date, status, uploaded_at, reviewed_at, reviewed_by, rejection_reason, reminder_sent, last_reminder_date) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            doc.id,
            doc.user_id,
            doc.document_type,
            doc.file_path,
            doc.expiry_date,
            doc.status,
            doc.uploaded_at,
            doc.reviewed_at,
            doc.reviewed_by,
            doc.rejection_reason,
            doc.reminder_sent,
            doc.last_reminder_date
          ]
        );
      }
      await pool.query(`SELECT setval('documents_id_seq', (SELECT MAX(id) FROM documents))`);
      console.log('✅ Documents imported');
    }

    // Import FAQs
    if (data.faqs && data.faqs.length > 0) {
      console.log(`Importing ${data.faqs.length} FAQs...`);
      for (const faq of data.faqs) {
        await pool.query(
          `INSERT INTO faqs (id, question, answer, category, keywords, helpful_count, not_helpful_count, view_count, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            faq.id,
            faq.question,
            faq.answer,
            faq.category,
            faq.keywords,
            faq.helpful_count || 0,
            faq.not_helpful_count || 0,
            faq.view_count || 0,
            faq.created_at,
            faq.updated_at
          ]
        );
      }
      await pool.query(`SELECT setval('faqs_id_seq', (SELECT MAX(id) FROM faqs))`);
      console.log('✅ FAQs imported');
    }

    console.log('\n✅ All data imported successfully!');
    console.log('\n📊 Import Summary:');
    console.log(`   Agencies: ${data.agencies?.length || 0}`);
    console.log(`   Users: ${data.users?.length || 0}`);
    console.log(`   Payslips: ${data.payslips?.length || 0}`);
    console.log(`   Documents: ${data.documents?.length || 0}`);
    console.log(`   FAQs: ${data.faqs?.length || 0}`);

  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

importData();
```

### Run Import

```bash
node importDataToPostgreSQL.js
```

---

## Step 7: Test Migration

### Create Test Script

Create `Backend/testPostgreSQLConnection.js`:

```javascript
const { pool, query } = require('./config/db');

const testConnection = async () => {
  console.log('🧪 Testing PostgreSQL connection...\n');

  try {
    // Test basic connection
    const result = await query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log(`   Server time: ${result.rows[0].now}\n`);

    // Test users table
    const users = await query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users table: ${users.rows[0].count} records`);

    // Test agencies table
    const agencies = await query('SELECT COUNT(*) as count FROM agencies');
    console.log(`✅ Agencies table: ${agencies.rows[0].count} records`);

    // Test payslips table
    const payslips = await query('SELECT COUNT(*) as count FROM payslips');
    console.log(`✅ Payslips table: ${payslips.rows[0].count} records`);

    // Test documents table
    const documents = await query('SELECT COUNT(*) as count FROM documents');
    console.log(`✅ Documents table: ${documents.rows[0].count} records`);

    // Test FAQs table
    const faqs = await query('SELECT COUNT(*) as count FROM faqs');
    console.log(`✅ FAQs table: ${faqs.rows[0].count} records`);

    // Test a sample user query
    const sampleUser = await query('SELECT id, name, email, role FROM users LIMIT 1');
    if (sampleUser.rows.length > 0) {
      console.log('\n✅ Sample user query successful:');
      console.log(`   ${JSON.stringify(sampleUser.rows[0], null, 2)}`);
    }

    console.log('\n✅ All tests passed! PostgreSQL is ready to use.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
};

testConnection();
```

### Run Tests

```bash
node testPostgreSQLConnection.js
```

### Test Server Startup

```bash
node server.js
```

**Expected Output:**
```
✅ Connected to PostgreSQL database
✅ Server running on port 5003
🔌 Socket.IO ready for connections
📅 Document reminder service active
🔔 Notification service initialized
💬 FAQ/Chatbot service ready
📋 Timesheet bulk upload ready
```

---

## Step 8: Update Dependencies

### Update package.json

Ensure PostgreSQL driver is listed:

```json
{
  "dependencies": {
    "pg": "^8.11.0",
    ...
  }
}
```

### Install/Update

```bash
npm install
```

---

## Troubleshooting

### Issue 1: Connection Refused

**Error:** `ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
# Windows:
Get-Service -Name postgresql*

# Mac:
brew services list

# Linux:
sudo systemctl status postgresql

# Start if not running
# Windows: Start from Services app
# Mac: brew services start postgresql@15
# Linux: sudo systemctl start postgresql
```

### Issue 2: Authentication Failed

**Error:** `password authentication failed for user "postgres"`

**Solution:**
1. Reset PostgreSQL password:
```bash
# Windows: Use pgAdmin or:
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';

# Update .env file with correct password
```

### Issue 3: Database Does Not Exist

**Error:** `database "payroll_db" does not exist`

**Solution:**
```bash
psql -U postgres
CREATE DATABASE payroll_db;
\q
```

### Issue 4: Parameter Mismatch

**Error:** `bind message supplies 3 parameters, but prepared statement "" requires 5`

**Solution:**
- Check that all `?` are replaced with `$1, $2, $3...`
- Verify parameter count matches placeholders
- Review the specific query in the error message

### Issue 5: Foreign Key Constraint

**Error:** `violates foreign key constraint`

**Solution:**
- Import tables in correct order (agencies → users → payslips/documents)
- Ensure referenced IDs exist before inserting

---

## Verification Checklist

After migration, verify:

- [ ] Server starts without errors
- [ ] Can login with existing users
- [ ] Can view agencies list
- [ ] Can upload/view payslips
- [ ] Can upload/view documents
- [ ] Can create new users
- [ ] Email notifications work
- [ ] File uploads work
- [ ] All API endpoints respond correctly

---

## Rollback Plan

If migration fails:

1. **
