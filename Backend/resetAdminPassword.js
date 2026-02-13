const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payroll.db');

async function resetPassword() {
  const newPassword = 'admin123';
  
  console.log('🔄 Resetting admin@test.com password...\n');
  
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hashed successfully');
    console.log('   New password:', newPassword);
    console.log('   Hash:', hashedPassword);
    console.log();
    
    // Update the password in database
    db.run(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, 'admin@test.com'],
      function(err) {
        if (err) {
          console.error('❌ Error updating password:', err);
        } else {
          console.log('✅ Password updated successfully!');
          console.log('   Rows affected:', this.changes);
          console.log();
          console.log('📧 Login credentials:');
          console.log('   Email: admin@test.com');
          console.log('   Password: admin123');
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
  }
}

resetPassword();
