const pool = require('./config/db');

async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
      );
    `);
    console.log('✅ users table created or already exists');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  } finally {
    process.exit();
  }
}

createTables();