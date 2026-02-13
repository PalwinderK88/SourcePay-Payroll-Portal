const pool = require('./config/db');

async function diagnose() {
  console.log('🔍 Running diagnostics...\n');

  // Test 1: Database Connection
  console.log('1️⃣ Testing database connection...');
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    console.log('   Time from DB:', result.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('\n💡 Possible solutions:');
    console.log('   - Make sure PostgreSQL is running');
    console.log('   - Check your .env file for correct DB credentials');
    console.log('   - Verify DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT');
    process.exit(1);
  }

  // Test 2: Check if users table exists
  console.log('\n2️⃣ Checking if users table exists...');
  try {
    const result = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')");
    if (result.rows[0].exists) {
      console.log('✅ Users table exists');
    } else {
      console.log('❌ Users table does not exist');
      console.log('\n💡 Run: node createTables.js');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error checking table:', err.message);
    process.exit(1);
  }

  // Test 3: Check if there are any users
  console.log('\n3️⃣ Checking for users in database...');
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users');
    if (result.rows.length > 0) {
      console.log(`✅ Found ${result.rows.length} user(s):`);
      console.table(result.rows);
    } else {
      console.log('❌ No users found in database');
      console.log('\n💡 Run: node createuser.js');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error fetching users:', err.message);
    process.exit(1);
  }

  // Test 4: Check environment variables
  console.log('\n4️⃣ Checking environment variables...');
  const requiredEnvVars = ['JWT_SECRET'];
  let envIssues = false;
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`⚠️  ${varName} is not set (using default)`);
      envIssues = true;
    }
  });

  if (envIssues) {
    console.log('\n💡 Create a .env file in Backend directory with:');
    console.log('   JWT_SECRET=your_secret_key_here');
  }

  console.log('\n✅ All diagnostics passed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Start the server: node server.js');
  console.log('   2. Test login: node testLogin.js');
  console.log('   3. Or use the frontend at http://localhost:3000');
  
  process.exit(0);
}

diagnose();
