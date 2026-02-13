const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Checking payslips table structure...\n');

db.all('PRAGMA table_info(payslips)', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('✅ Payslips table columns:');
    console.table(rows);
  }
  
  db.close();
});
