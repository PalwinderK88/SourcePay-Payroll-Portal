const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payroll.db');

console.log('Adding agency_name column to users table...');

db.run('ALTER TABLE users ADD COLUMN agency_name TEXT', (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✅ Column agency_name already exists');
    } else {
      console.error('❌ Error adding column:', err.message);
    }
  } else {
    console.log('✅ Successfully added agency_name column to users table');
  }
  
  // Verify the change
  db.all('PRAGMA table_info(users)', (err, rows) => {
    if (err) {
      console.error('Error checking table:', err);
    } else {
      console.log('\n📋 Updated users table structure:');
      rows.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
      });
    }
    db.close();
  });
});
