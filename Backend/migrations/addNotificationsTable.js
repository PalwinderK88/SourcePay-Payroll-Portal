const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Creating notifications table...\n');

db.serialize(() => {
  // Create notifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating notifications table:', err);
    } else {
      console.log('✅ notifications table created successfully');
    }
  });

  // Create notification_preferences table
  db.run(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      email_notifications INTEGER DEFAULT 1,
      push_notifications INTEGER DEFAULT 1,
      payslip_notifications INTEGER DEFAULT 1,
      document_notifications INTEGER DEFAULT 1,
      contract_notifications INTEGER DEFAULT 1,
      pension_notifications INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating notification_preferences table:', err);
    } else {
      console.log('✅ notification_preferences table created successfully');
    }
  });
});

// Close database after operations
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
    } else {
      console.log('\n✅ Notifications tables migration completed!');
    }
  });
}, 2000);
