require('dotenv').config();
const { query, run } = require('./config/db');

const agencies = [
  '360 Connections Group Ltd',
  'Aberdare Constructions Limited',
  'CTRG Limited',
  'Fusion Group Global Ltd',
  'InterEx Group',
  'ITRS Group Limited',
  'ID Medical',
  'Khuda Technology Ltd',
  'Medacs Healthcare',
  'Medics Pro Ltd',
  'MOBILE TECHNICAL STAFF LTD',
  'Next Best Move',
  'Opus People Care Solutions',
  'Priority Talent Group Limited',
  'ReX Recruitment (Antal Sp. z o.o.)',
  'Quantum Sourcing Ltd',
  'SEND Inclusion Therapy Limited',
  'Twenty Four Seven Nursing',
  'Universal Search Group Limited',
  'VANGUARD MASONRY LIMITED',
  'XTP Recruitment Ltd',
  'Excel Resourcing'
];

async function setupAgencies() {
  try {
    console.log('🔧 Setting up agencies table...\n');

    // Create agencies table (SQLite syntax)
    await run(`
      CREATE TABLE IF NOT EXISTS agencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Agencies table created');

    // Check if agency_id column exists in users table
    const tableInfo = await query('PRAGMA table_info(users)');
    const hasAgencyId = tableInfo.rows.some(col => col.name === 'agency_id');
    
    if (!hasAgencyId) {
      await run('ALTER TABLE users ADD COLUMN agency_id INTEGER REFERENCES agencies(id)');
      console.log('✅ Added agency_id column to users table');
    } else {
      console.log('✅ agency_id column already exists in users table');
    }

    // Insert agencies
    console.log('\n📝 Inserting agencies...');
    for (const agency of agencies) {
      try {
        await run(
          'INSERT OR IGNORE INTO agencies (name) VALUES (?)',
          [agency]
        );
        console.log(`  ✓ ${agency}`);
      } catch (err) {
        console.log(`  ⚠ ${agency} (error: ${err.message})`);
      }
    }

    // Check total agencies
    const result = await query('SELECT COUNT(*) as count FROM agencies');
    console.log(`\n✅ Setup complete! Total agencies: ${result.rows[0].count}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error setting up agencies:', err);
    process.exit(1);
  }
}

setupAgencies();
