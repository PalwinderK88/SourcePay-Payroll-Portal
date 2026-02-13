const { Client } = require('pg');

async function initDB() {
  console.log("🚀 Starting database initialization...");

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '10Password!?', // <-- replace this
    port: 5432,
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    await client.query(`CREATE DATABASE payroll`);
    console.log('✅ Database "payroll" created successfully');
  } catch (err) {
    console.error('❌ Error creating database:', err);
  } finally {
    await client.end();
    console.log('🏁 Database setup finished');
  }
}

initDB();