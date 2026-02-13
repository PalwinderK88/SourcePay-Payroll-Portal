const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding status column to users table...\n');

db.serialize(() => {
  // Check if the column already exists
  db.all('PRAGMA table_info(users)', (err, columns) => {
    if (err) {
      console.error('❌ Error checking table structure:', err);
      db.close();
      return;
    }

    const hasStatus = columns.some(col => col.name === 'status');
    
    if (hasStatus) {
      console.log('✅ Column status already exists in users table');
      db.close();
      return;
    }

    // Add the status column with default value 'active'
    db.run('ALTER TABLE users ADD COLUMN status TEXT DEFAULT "active"', (err) => {
      if (err) {
        console.error('❌ Error adding status column:', err.message);
      } else {
        console.log('✅ Successfully added status column to users table');
      }
      
      // Verify the change
      db.all('PRAGMA table_info(users)', (err, rows) => {
        if (err) {
          console.error('❌ Error verifying table structure:', err);
        } else {
          console.log('\n📋 Updated users table structure:');
          rows.forEach(col => {
            console.log(`  - ${col.name} (${col.type})${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
          });
        }
        db.close();
        console.log('\n✅ Database update complete!');
      });
    });
  });
});
