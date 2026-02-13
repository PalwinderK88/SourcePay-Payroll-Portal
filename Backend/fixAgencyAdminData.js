const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('========================================');
console.log('  FIXING AGENCY ADMIN DATA');
console.log('========================================\n');

db.serialize(() => {
  // Step 1: Check agency admin user
  console.log('Step 1: Checking agency admin user...');
  db.get("SELECT id, name, email, role, agency_id, agency_name FROM users WHERE email = 'agencyadmin@test.com'", (err, user) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    if (!user) {
      console.log('❌ Agency admin user not found!');
      console.log('Creating agency admin user...\n');
      
      // Create agency admin with agency_id = 1
      const bcrypt = require('bcryptjs');
      const password = 'agencyadmin123';
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          return;
        }
        
        db.run(
          `INSERT INTO users (name, email, password_hash, role, agency_id, agency_name, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['Agency Admin', 'agencyadmin@test.com', hash, 'agency_admin', 1, 'Test Agency', 'active'],
          function(err) {
            if (err) {
              console.error('Error creating user:', err);
              return;
            }
            console.log('✅ Agency admin created with ID:', this.lastID);
            console.log('   Email: agencyadmin@test.com');
            console.log('   Password: agencyadmin123');
            console.log('   Agency ID: 1');
            console.log('   Agency Name: Test Agency\n');
            
            continueWithFix();
          }
        );
      });
    } else {
      console.log('Current user data:');
      console.log(JSON.stringify(user, null, 2));
      console.log('\n');
      
      if (!user.agency_id) {
        console.log('⚠️  User has no agency_id, updating...');
        db.run(
          'UPDATE users SET agency_id = 1, agency_name = ? WHERE id = ?',
          ['Test Agency', user.id],
          (err) => {
            if (err) {
              console.error('Error updating user:', err);
              return;
            }
            console.log('✅ User updated with agency_id = 1\n');
            continueWithFix();
          }
        );
      } else {
        console.log('✅ User already has agency_id\n');
        continueWithFix();
      }
    }
  });
});

function continueWithFix() {
  // Step 2: Ensure agency exists
  console.log('Step 2: Checking if agency exists...');
  db.get("SELECT * FROM agencies WHERE id = 1", (err, agency) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }
    
    if (!agency) {
      console.log('Creating Test Agency...');
      db.run(
        'INSERT INTO agencies (id, name, contact_email, contact_phone, address, status) VALUES (?, ?, ?, ?, ?, ?)',
        [1, 'Test Agency', 'test@agency.com', '1234567890', '123 Test St', 'active'],
        (err) => {
          if (err) {
            console.error('Error creating agency:', err);
            db.close();
            return;
          }
          console.log('✅ Test Agency created\n');
          finishUp();
        }
      );
    } else {
      console.log('✅ Agency exists:', agency.name, '\n');
      finishUp();
    }
  });
}

function finishUp() {
  console.log('========================================');
  console.log('  FIX COMPLETE!');
  console.log('========================================');
  console.log('Agency admin is ready for bulk upload\n');
  db.close();
}
