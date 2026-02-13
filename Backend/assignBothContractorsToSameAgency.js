const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'payroll.db'));

const agencyName = 'XTP Recruitment Ltd';

console.log(`🔄 Assigning ALL contractors to: ${agencyName}\n`);

db.run(
  'UPDATE users SET agency_name = ? WHERE role = ?',
  [agencyName, 'contractor'],
  function(err) {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log(`✅ Updated ${this.changes} contractor(s)`);
      console.log(`\n📝 All contractors are now assigned to: ${agencyName}`);
      console.log('\n✅ Agency admin will now see ALL contractors after they logout and login again!');
    }
    db.close();
  }
);
