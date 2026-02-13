const { run } = require('./config/db');

async function createTimesheetsTable() {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS timesheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agency_id INTEGER,
        agency_name TEXT,
        contractor_id INTEGER,
        contractor_name TEXT,
        period_type TEXT DEFAULT 'weekly',
        week_number INTEGER,
        month TEXT,
        year INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_by INTEGER NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agency_id) REFERENCES agencies(id),
        FOREIGN KEY (contractor_id) REFERENCES users(id),
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )
    `);
    
    console.log('✅ Timesheets table created successfully');
  } catch (error) {
    console.error('❌ Error creating timesheets table:', error);
  }
}

createTimesheetsTable();
