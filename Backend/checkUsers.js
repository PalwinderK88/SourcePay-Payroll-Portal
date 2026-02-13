const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payroll.db');

console.log('📊 Checking users in database...\n');

db.all('SELECT id, name, email, role FROM users', [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    if (rows.length === 0) {
      console.log('⚠️ No users found in database!');
    } else {
      console.log('✅ Users found:');
      console.table(rows);
    }
  }
  db.close();
});
