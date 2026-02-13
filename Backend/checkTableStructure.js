const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Checking users table structure...\n');

db.all('PRAGMA table_info(users)', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('✅ Users table columns:');
    console.table(rows);
    
    // Check if created_at column exists
    const hasCreatedAt = rows.some(col => col.name === 'created_at');
    
    if (!hasCreatedAt) {
      console.log('\n⚠️  WARNING: created_at column does NOT exist!');
      console.log('This is causing the "Server error" when fetching users.');
    } else {
      console.log('\n✅ created_at column exists');
    }
  }
  
  db.close();
});
