const { query } = require('./config/db');

async function checkAgencyAdmins() {
  try {
    console.log('📊 Users Table Structure:\n');
    
    // Get table structure
    const tableInfo = await query('PRAGMA table_info(users)');
    console.log('Columns:');
    tableInfo.rows.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
    
    console.log('\n👥 All Agency Admins:\n');
    
    // Get all agency admins
    const admins = await query(
      'SELECT id, name, email, role, agency_id, agency_name, status FROM users WHERE role = ?',
      ['agency_admin']
    );
    
    if (admins.rows.length === 0) {
      console.log('❌ No agency admins found in the database.');
      console.log('\n💡 To create an agency admin, you can use:');
      console.log('   - The signup endpoint with role="agency_admin"');
      console.log('   - Or run a script to create one manually');
    } else {
      console.log(`Found ${admins.rows.length} agency admin(s):\n`);
      admins.rows.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Agency ID: ${admin.agency_id || 'Not assigned'}`);
        console.log(`   Agency Name: ${admin.agency_name || 'Not assigned'}`);
        console.log(`   Status: ${admin.status || 'active'}`);
        console.log('');
      });
    }
    
    console.log('\n📋 All Users Summary:\n');
    const allUsers = await query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    allUsers.rows.forEach(row => {
      console.log(`  ${row.role}: ${row.count}`);
    });
    
    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

checkAgencyAdmins();
