require('dotenv').config();
const { run, query } = require('./config/db');

async function addResetTokenColumns() {
  try {
    console.log('📝 Adding reset token columns to users table...\n');

    // Check if columns already exist
    const tableInfo = await query('PRAGMA table_info(users)');
    const columns = tableInfo.rows.map(row => row.name);
    
    if (columns.includes('reset_token')) {
      console.log('✓ reset_token column already exists');
    } else {
      await run('ALTER TABLE users ADD COLUMN reset_token TEXT');
      console.log('✓ Added reset_token column');
    }

    if (columns.includes('reset_token_expiry')) {
      console.log('✓ reset_token_expiry column already exists');
    } else {
      await run('ALTER TABLE users ADD COLUMN reset_token_expiry INTEGER');
      console.log('✓ Added reset_token_expiry column');
    }

    // Verify the changes
    const updatedTableInfo = await query('PRAGMA table_info(users)');
    console.log('\n📋 Updated users table structure:');
    updatedTableInfo.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.type})`);
    });

    console.log('\n✅ Reset token columns added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

addResetTokenColumns();
