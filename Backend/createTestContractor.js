const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

async function createTestContractor() {
  console.log('🔧 Creating test contractor user...\n');
  
  const email = 'contractor@test.com';
  const password = 'contractor123';
  const name = 'Test Contractor';
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Check if user already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('❌ Error checking user:', err);
      db.close();
      return;
    }
    
    if (row) {
      console.log('✅ Test contractor already exists:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   User ID: ${row.id}`);
      db.close();
      return;
    }
    
    // Create user
    db.run(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'contractor', 'active'],
      function(err) {
        if (err) {
          console.error('❌ Error creating user:', err);
        } else {
          console.log('✅ Test contractor created successfully!');
          console.log(`   Email: ${email}`);
          console.log(`   Password: ${password}`);
          console.log(`   User ID: ${this.lastID}`);
          console.log('\n📝 You can now use these credentials to login and test.');
        }
        db.close();
      }
    );
  });
}

createTestContractor();
