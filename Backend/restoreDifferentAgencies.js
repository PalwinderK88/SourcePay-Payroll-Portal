const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'payroll.db'));

console.log('🔄 Restoring contractors to different agencies...\n');

// Assign Pal to XTP Recruitment Ltd
db.run(
  'UPDATE users SET agency_name = ? WHERE email = ?',
  ['XTP Recruitment Ltd', 'it@sourcepay.co.uk'],
  function(err) {
    if (err) {
      console.error('❌ Error updating Pal:', err);
    } else {
      console.log('✅ Pal → XTP Recruitment Ltd');
    }
    
    // Assign Palwinder to 360 Connections Group Ltd
    db.run(
      'UPDATE users SET agency_name = ? WHERE email = ?',
      ['360 Connections Group Ltd', 'it@pjn-group.com'],
      function(err) {
        if (err) {
          console.error('❌ Error updating Palwinder:', err);
        } else {
          console.log('✅ Palwinder Kaur → 360 Connections Group Ltd');
        }
        
        // Keep Agency Admin with XTP Recruitment Ltd
        console.log('✅ Agency Admin → XTP Recruitment Ltd (unchanged)');
        console.log('\n📊 Result:');
        console.log('  - Agency Admin will see: 1 contractor (Pal)');
        console.log('  - Palwinder is in a different agency (360 Connections Group Ltd)');
        console.log('\n⚠️ Agency admin must LOGOUT and LOGIN to see the change!');
        
        db.close();
      }
    );
  }
);
