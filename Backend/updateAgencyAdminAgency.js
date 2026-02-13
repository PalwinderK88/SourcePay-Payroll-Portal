const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'payroll.db'));

// Update agency admin to match one of the contractor agencies
const newAgencyName = 'XTP Recruitment Ltd'; // Change this to the agency you want

console.log(`🔄 Updating Agency Admin to: ${newAgencyName}\n`);

db.run(
  'UPDATE users SET agency_name = ? WHERE email = ?',
  [newAgencyName, 'agencyadmin@test.com'],
  function(err) {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log(`✅ Updated ${this.changes} user(s)`);
      console.log(`\n📝 Agency Admin is now assigned to: ${newAgencyName}`);
      console.log('\n⚠️ IMPORTANT: Agency admin must LOGOUT and LOGIN again to see the contractors!');
    }
    db.close();
  }
);
