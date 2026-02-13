const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'payroll.db'));

console.log('🔄 Adding optional fields to payslips table...\n');

// Add holiday_pay column
db.run('ALTER TABLE payslips ADD COLUMN holiday_pay REAL', (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error('❌ Error adding holiday_pay:', err.message);
  } else {
    console.log('✅ Added holiday_pay column');
  }
  
  // Add sick_pay column
  db.run('ALTER TABLE payslips ADD COLUMN sick_pay REAL', (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Error adding sick_pay:', err.message);
    } else {
      console.log('✅ Added sick_pay column');
    }
    
    // Add expenses column
    db.run('ALTER TABLE payslips ADD COLUMN expenses REAL', (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('❌ Error adding expenses:', err.message);
      } else {
        console.log('✅ Added expenses column');
      }
      
      // Verify the changes
      db.all("PRAGMA table_info(payslips)", [], (err, columns) => {
        if (err) {
          console.error('❌ Error verifying:', err);
        } else {
          console.log('\n📊 Updated payslips table structure:');
          columns.forEach(col => {
            console.log(`  - ${col.name} (${col.type})`);
          });
        }
        db.close();
      });
    });
  });
});
