require('dotenv').config();
const { query } = require('./config/db');

async function checkAgencies() {
  try {
    console.log('🔍 Checking agencies in database...\n');

    // Check if agencies table exists
    const tableCheck = await query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='agencies'
    `);

    if (tableCheck.rows.length === 0) {
      console.log('❌ Agencies table does not exist!');
      console.log('   Run: node setupAgencies.js');
      return;
    }

    console.log('✅ Agencies table exists');

    // Get all agencies
    const result = await query('SELECT * FROM agencies ORDER BY id');
    
    if (result.rows.length === 0) {
      console.log('❌ No agencies found in database!');
      console.log('   Run: node setupAgencies.js');
      return;
    }

    console.log(`✅ Found ${result.rows.length} agencies:\n`);
    result.rows.forEach((agency, index) => {
      console.log(`${index + 1}. ${agency.name} (ID: ${agency.id})`);
    });

    console.log('\n✅ Database is set up correctly!');
    console.log('\nNext steps:');
    console.log('1. Make sure backend server is running: node server.js');
    console.log('2. Check browser console for any errors');
    console.log('3. Verify the API endpoint: http://localhost:5001/api/agencies');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    process.exit();
  }
}

checkAgencies();
