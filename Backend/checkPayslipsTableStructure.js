const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'payroll.db'));

console.log('📊 Checking payslips table structure...\n');

db.all("PRAGMA table_info(payslips)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('Current columns in payslips table:');
    columns.forEach(col => {
      console.log(`  - ${col.name} (${col.type})`);
    });
  }
  db.close();
});
