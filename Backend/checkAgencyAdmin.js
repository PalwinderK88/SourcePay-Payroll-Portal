const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

async function checkAgencyAdmin() {
  const db = new sqlite3.Database(path.join(__dirname, 'payroll.db'));
  
  try {
    console.log('🔍 Checking agency admin user...\n');
    
    // Check if user exists
    const users = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, name, email, role, agency_name, status FROM users WHERE email = ?`,
        ['agencyadmin@test.com'],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (users.length === 0) {
      console.log('❌ Agency admin user NOT found!');
      console.log('Run: node Backend/createAgencyAdmin.js\n');
      return;
    }

    const user = users[0];
    console.log('✅ User found in database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ID:          ${user.id}`);
    console.log(`Name:        ${user.name}`);
    console.log(`Email:       ${user.email}`);
    console.log(`Role:        ${user.role}`);
    console.log(`Agency:      ${user.agency_name}`);
    console.log(`Status:      ${user.status}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test password
    const userWithPassword = await new Promise((resolve, reject) => {
      db.all(
        `SELECT password_hash FROM users WHERE email = ?`,
        ['agencyadmin@test.com'],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const testPassword = 'agencyadmin123';
    const isPasswordValid = await bcrypt.compare(testPassword, userWithPassword[0].password_hash);

    if (isPasswordValid) {
      console.log('✅ Password verification: SUCCESS');
      console.log(`   Test password "${testPassword}" is correct\n`);
    } else {
      console.log('❌ Password verification: FAILED');
      console.log(`   Test password "${testPassword}" does not match\n`);
    }

    // Check login requirements
    console.log('📋 Login Requirements Check:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const checks = [
      { name: 'Email exists', pass: !!user.email },
      { name: 'Password hash exists', pass: !!userWithPassword[0].password_hash },
      { name: 'Role is agency_admin', pass: user.role === 'agency_admin' },
      { name: 'Status is active', pass: user.status === 'active' },
      { name: 'Agency name set', pass: !!user.agency_name },
      { name: 'Password is correct', pass: isPasswordValid }
    ];

    checks.forEach(check => {
      console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (checks.every(c => c.pass)) {
      console.log('🎉 All checks passed! Login should work.\n');
      console.log('📝 Login Instructions:');
      console.log('1. Go to login page');
      console.log('2. Select "Agency Admin" role');
      console.log('3. Email: agencyadmin@test.com');
      console.log('4. Password: agencyadmin123');
      console.log('5. Click Sign In\n');
    } else {
      console.log('⚠️  Some checks failed. Login may not work.\n');
    }

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    db.close();
  }
}

checkAgencyAdmin();
