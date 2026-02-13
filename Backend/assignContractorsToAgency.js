const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Assigning contractors to Test Agency...\n');

// Update contractors to have Test Agency
db.run(`
  UPDATE users 
  SET agency_name = 'Test Agency'
  WHERE role = 'contractor' AND (agency_name IS NULL OR agency_name = '')
`, function(err) {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }

  console.log(`✅ Updated ${this.changes} contractor(s)\n`);

  // Verify the update
  db.all('SELECT id, name, email, role, agency_name FROM users WHERE role = "contractor"', [], (err, contractors) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log('📋 Contractors after update:');
      console.table(contractors);
    }
    db.close();
  });
});
