const { run } = require('./config/db');
const bcrypt = require('bcryptjs');

async function createAgencyAdmin() {
  try {
    // Hash the password
    const password = 'agencyadmin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create agency admin user
    await run(
      `INSERT INTO users (name, email, password_hash, role, agency_name, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'Agency Admin User',
        'agencyadmin@test.com',
        hashedPassword,
        'agency_admin',
        'Test Agency',
        'active'
      ]
    );

    console.log('✅ Agency Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    agencyadmin@test.com');
    console.log('Password: agencyadmin123');
    console.log('Role:     Agency Admin');
    console.log('Agency:   Test Agency');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 To login:');
    console.log('1. Go to the login page');
    console.log('2. Select "Agency Admin" role');
    console.log('3. Enter the email and password above');
    console.log('4. You will be redirected to /agency-admin\n');

  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log('⚠️  Agency admin user already exists!');
      console.log('\n📋 Existing Login Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:    agencyadmin@test.com');
      console.log('Password: agencyadmin123');
      console.log('Role:     Agency Admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error('❌ Error creating agency admin user:', error);
    }
  }
}

createAgencyAdmin();
