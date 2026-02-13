const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Updating users table to add agency_name column...\n');

db.serialize(() => {
  // First, check if the column already exists
  db.all('PRAGMA table_info(users)', (err, columns) => {
    if (err) {
      console.error('❌ Error checking table structure:', err);
      db.close();
      return;
    }

    const hasAgencyName = columns.some(col => col.name === 'agency_name');
    
    if (hasAgencyName) {
      console.log('✅ Column agency_name already exists in users table');
      db.close();
      return;
    }

    // Add the agency_name column
    db.run('ALTER TABLE users ADD COLUMN agency_name TEXT', (err) => {
      if (err) {
        console.error('❌ Error adding agency_name column:', err.message);
      } else {
        console.log('✅ Successfully added agency_name column to users table');
      }
      
      // Verify the change
      db.all('PRAGMA table_info(users)', (err, rows) => {
        if (err) {
          console.error('❌ Error verifying table structure:', err);
        } else {
          console.log('\n📋 Updated users table structure:');
          rows.forEach(col => {
            console.log(`  - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}`);
          });
        }
        db.close();
        console.log('\n✅ Database update complete!');
      });
    });
  });
});
