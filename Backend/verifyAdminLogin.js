const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payroll.db');

async function verifyLogin() {
  console.log('🔍 Verifying admin@test.com login...\n');
  
  db.get('SELECT * FROM users WHERE email = ?', ['admin@test.com'], async (err, user) => {
    if (err) {
      console.error('❌ Database error:', err);
      db.close();
      return;
    }
    
    if (!user) {
      console.log('❌ User not found');
      db.close();
      return;
    }
    
    console.log('✅ User found:');
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Status:', user.status);
    console.log();
    
    // Test the password
    const testPassword = 'admin123';
    try {
      const isMatch = await bcrypt.compare(testPassword, user.password_hash);
      if (isMatch) {
        console.log('✅ Password verification SUCCESSFUL!');
        console.log();
        console.log('🎉 You can now login with:');
        console.log('   Email: admin@test.com');
        console.log('   Password: admin123');
      } else {
        console.log('❌ Password verification FAILED');
      }
    } catch (error) {
      console.log('❌ Error verifying password:', error.message);
    }
    
    db.close();
  });
}

verifyLogin();
