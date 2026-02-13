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

async function insertAgencies() {
  console.log('📝 Inserting agencies directly...\n');
  
  let successCount = 0;
  
  for (const agency of agencies) {
    try {
      const result = await run('INSERT OR IGNORE INTO agencies (name) VALUES (?)', [agency]);
      if (result.changes > 0) {
        console.log(`✓ Added: ${agency}`);
        successCount++;
      } else {
        console.log(`- Skipped (exists): ${agency}`);
      }
    } catch (err) {
      console.log(`✗ Error with ${agency}: ${err.message}`);
    }
  }
  
  // Verify
  const result = await query('SELECT COUNT(*) as count FROM agencies');
  console.log(`\n✅ Total agencies in database: ${result.rows[0].count}`);
  console.log(`✅ New agencies added: ${successCount}`);
  
  // Show all agencies
  const allAgencies = await query('SELECT * FROM agencies ORDER BY id');
  console.log('\n📋 All agencies:');
  allAgencies.rows.forEach((agency, index) => {
    console.log(`${index + 1}. ${agency.name} (ID: ${agency.id})`);
  });
  
  process.exit(0);
}

insertAgencies().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
