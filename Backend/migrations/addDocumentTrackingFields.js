const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Adding document tracking fields to database...\n');

db.serialize(() => {
  // Add tracking fields to documents table
  const fields = [
    'expiry_date DATE',
    'status TEXT DEFAULT "active"',
    'reminder_sent INTEGER DEFAULT 0',
    'is_required INTEGER DEFAULT 0',
    'last_reminder_date DATE'
  ];

  fields.forEach((field) => {
    const fieldName = field.split(' ')[0];
    db.run(`ALTER TABLE documents ADD COLUMN ${field}`, (err) => {
      if (err) {
        if (err.message.includes('duplicate column name')) {
          console.log(`⚠️  Column ${fieldName} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding ${fieldName}:`, err.message);
        }
      } else {
        console.log(`✅ Added column: ${fieldName}`);
      }
    });
  });

  // Create document_requirements table
  db.run(`
    CREATE TABLE IF NOT EXISTS document_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      doc_type TEXT NOT NULL,
      is_required INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, doc_type)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating document_requirements table:', err.message);
    } else {
      console.log('✅ Created document_requirements table');
    }
  });
});

// Close database after a delay to ensure all operations complete
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
    } else {
      console.log('\n✅ Document tracking fields migration completed!');
    }
  });
}, 2000);
