const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'payroll.db'));

console.log('📊 Checking documents table...\n');

// Check if table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='documents'", [], (err, row) => {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }
  
  if (!row) {
    console.log('❌ documents table does NOT exist!');
    console.log('\n💡 Creating documents table...\n');
    
    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        doc_type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err);
      } else {
        console.log('✅ documents table created successfully!');
      }
      db.close();
    });
  } else {
    console.log('✅ documents table exists');
    
    // Show table structure
    db.all("PRAGMA table_info(documents)", [], (err, columns) => {
      if (err) {
        console.error('❌ Error:', err);
      } else {
        console.log('\nTable structure:');
        columns.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
      }
      db.close();
    });
  }
});
