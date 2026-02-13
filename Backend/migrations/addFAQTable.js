const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Creating FAQ table...\n');

db.serialize(() => {
  // Create FAQ table
  db.run(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      keywords TEXT,
      helpful_count INTEGER DEFAULT 0,
      not_helpful_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating faqs table:', err);
    } else {
      console.log('✅ faqs table created successfully');
    }
  });

  // Create FAQ feedback table
  db.run(`
    CREATE TABLE IF NOT EXISTS faq_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      faq_id INTEGER NOT NULL,
      user_id INTEGER,
      helpful INTEGER NOT NULL,
      feedback_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (faq_id) REFERENCES faqs(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating faq_feedback table:', err);
    } else {
      console.log('✅ faq_feedback table created successfully');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ Error closing database:', err);
  } else {
    console.log('\n✅ FAQ tables created successfully!');
    console.log('📝 Next step: Run seedFAQs.js to populate with content');
  }
});
