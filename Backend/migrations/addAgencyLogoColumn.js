const { query, run } = require('../config/db');

async function addAgencyLogoColumn() {
  try {
    console.log('🔧 Adding logo_path column to agencies table...\n');

    // Check if logo_path column already exists
    const tableInfo = await query('PRAGMA table_info(agencies)');
    const hasLogoPath = tableInfo.rows.some(col => col.name === 'logo_path');
    
    if (!hasLogoPath) {
      // Add logo_path column to agencies table
      await run('ALTER TABLE agencies ADD COLUMN logo_path TEXT');
      console.log('✅ Added logo_path column to agencies table');
    } else {
      console.log('✅ logo_path column already exists in agencies table');
    }

    // Verify the column was added
    const updatedTableInfo = await query('PRAGMA table_info(agencies)');
    console.log('\n📋 Current agencies table structure:');
    updatedTableInfo.rows.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding logo_path column:', err);
    process.exit(1);
  }
}

addAgencyLogoColumn();
