const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payroll.db');

db.all('PRAGMA table_info(users)', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Users table structure:');
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
