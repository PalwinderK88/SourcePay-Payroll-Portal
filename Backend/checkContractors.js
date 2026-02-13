const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking contractors in database...\n');

// Check all users
db.all('SELECT id, name, email, role, agency_id, agency_name FROM users', [], (err, users) => {
  if (err) {
    console.error('❌ Error:', err);
    return;
  }

  console.log('📋 All Users:');
  console.table(users);

  // Filter contractors
  const contractors = users.filter(u => u.role === 'contractor');
  console.log('\n👥 Contractors only:');
  console.table(contractors);

  // Check agency admin
  const agencyAdmin = users.find(u => u.email === 'agencyadmin@test.com');
  if (agencyAdmin) {
    console.log('\n🔑 Agency Admin Details:');
    console.log('Name:', agencyAdmin.name);
    console.log('Email:', agencyAdmin.email);
    console.log('Agency Name:', agencyAdmin.agency_name);
    console.log('Agency ID:', agencyAdmin.agency_id);

    // Find contractors with same agency
    const sameAgencyContractors = contractors.filter(c => 
      c.agency_name === agencyAdmin.agency_name || c.agency_id === agencyAdmin.agency_id
    );
    console.log('\n✅ Contractors in same agency:');
    console.table(sameAgencyContractors);
  }

  db.close();
});
