const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payroll.db');

async function testLogin() {
  console.log('🔍 Testing admin@test.com login...\n');
  
  // Get user from database
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
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Status:', user.status);
    console.log('   Password hash:', user.password_hash);
    console.log('   Hash length:', user.password_hash.length);
    console.log();
    
    // Test common passwords
    const testPasswords = ['admin', 'admin123', 'password', 'test123', '123456', 'Admin@123'];
    
    console.log('🔐 Testing common passwords:\n');
    
    for (const password of testPasswords) {
      try {
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (isMatch) {
          console.log(`✅ PASSWORD FOUND: "${password}"`);
        } else {
          console.log(`❌ "${password}" - no match`);
        }
      } catch (error) {
        console.log(`❌ "${password}" - error:`, error.message);
      }
    }
    
    console.log('\n💡 If none of the above passwords work, you may need to reset the password.');
    console.log('   You can use the forgot password feature or manually update the password hash.');
    
    db.close();
  });
}

