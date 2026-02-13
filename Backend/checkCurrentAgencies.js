const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'payroll.db'));

console.log('📊 Checking current agency assignments...\n');

db.all(
  'SELECT id, name, email, role, agency_name FROM users WHERE role IN ("contractor", "agency_admin") ORDER BY role, id',
  [],
  (err, rows) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log('Users with agency assignments:');
      console.log(JSON.stringify(rows, null, 2));
      
      console.log('\n📋 Summary:');
      const contractors = rows.filter(u => u.role === 'contractor');
      const agencyAdmins = rows.filter(u => u.role === 'agency_admin');
      
      console.log(`\nContractors (${contractors.length}):`);
      contractors.forEach(c => {
        console.log(`  - ${c.name} (${c.email}): ${c.agency_name || 'NO AGENCY'}`);
      });
      
      console.log(`\nAgency Admins (${agencyAdmins.length}):`);
      agencyAdmins.forEach(a => {
        console.log(`  - ${a.name} (${a.email}): ${a.agency_name || 'NO AGENCY'}`);
      });
    }
    db.close();
  }
);
