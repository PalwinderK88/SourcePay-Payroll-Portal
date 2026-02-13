const { run, query } = require('./config/db');

async function fixAgenciesTable() {
  try {
    console.log('🔧 Fixing agencies table...\n');

    // Get all existing agencies
    const existingAgencies = await query('SELECT name FROM agencies');
    console.log(`Found ${existingAgencies.rows.length} agencies to preserve`);

    // Drop the old table
    await run('DROP TABLE IF EXISTS agencies');
    console.log('✅ Dropped old agencies table');

    // Create new table with proper structure
    await run(`
      CREATE TABLE agencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        logo_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created new agencies table with logo_path column');

    // Re-insert all agencies
    console.log('\n📝 Re-inserting agencies...');
    for (const agency of existingAgencies.rows) {
      await run('INSERT INTO agencies (name) VALUES (?)', [agency.name]);
      console.log(`  ✓ ${agency.name}`);
    }

    // Verify the fix
    const agencies = await query('SELECT id, name, logo_path FROM agencies ORDER BY id');
    console.log('\n✅ Agencies table fixed! Current agencies:');
    agencies.rows.forEach(a => {
      console.log(`  ID: ${a.id}, Name: ${a.name}, Logo: ${a.logo_path || 'none'}`);
    });

    // Find XTP Recruitment Ltd
    const xtp = agencies.rows.find(a => a.name === 'XTP Recruitment Ltd');
    if (xtp) {
      console.log(`\n🎯 XTP Recruitment Ltd has ID: ${xtp.id}`);
      console.log(`   Agency admin should be updated to use agency_id: ${xtp.id}`);
      
      // Update the agency admin user
      await run('UPDATE users SET agency_id = ? WHERE email = ?', [xtp.id, 'agencyadmin@test.com']);
      console.log('✅ Updated agency admin user with correct agency_id');
    }

    console.log('\n✅ Fix complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing agencies table:', err);
    process.exit(1);
  }
}

fixAgenciesTable();
