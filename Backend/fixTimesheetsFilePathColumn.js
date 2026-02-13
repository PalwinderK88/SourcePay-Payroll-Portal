const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('========================================');
console.log('  FIXING TIMESHEETS TABLE');
console.log('========================================\n');

db.serialize(() => {
  // Check current schema
  console.log('Step 1: Checking current schema...');
  db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='timesheets'", (err, row) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('Current schema:');
    console.log(row.sql);
    console.log('\n');
  });

  // Create new table with file_path allowing NULL
  console.log('Step 2: Creating new table structure...');
  db.run(`
    CREATE TABLE IF NOT EXISTS timesheets_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agency_id INTEGER NOT NULL,
      agency_name TEXT NOT NULL,
      contractor_id INTEGER NOT NULL,
      contractor_name TEXT NOT NULL,
      period_type TEXT NOT NULL CHECK(period_type IN ('weekly', 'monthly')),
      week_number INTEGER,
      month TEXT,
      year INTEGER NOT NULL,
      file_path TEXT,
      uploaded_by INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agency_id) REFERENCES agencies(id),
      FOREIGN KEY (contractor_id) REFERENCES users(id),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating new table:', err);
      return;
    }
    console.log('✅ New table structure created\n');

    // Copy data from old table
    console.log('Step 3: Copying existing data...');
    db.run(`
      INSERT INTO timesheets_new 
      SELECT * FROM timesheets
    `, (err) => {
      if (err) {
        console.error('Error copying data:', err);
        return;
      }
      console.log('✅ Data copied\n');

      // Drop old table
      console.log('Step 4: Dropping old table...');
      db.run('DROP TABLE timesheets', (err) => {
        if (err) {
          console.error('Error dropping old table:', err);
          return;
        }
        console.log('✅ Old table dropped\n');

        // Rename new table
        console.log('Step 5: Renaming new table...');
        db.run('ALTER TABLE timesheets_new RENAME TO timesheets', (err) => {
          if (err) {
            console.error('Error renaming table:', err);
            return;
          }
          console.log('✅ Table renamed\n');

          // Verify new schema
          console.log('Step 6: Verifying new schema...');
          db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='timesheets'", (err, row) => {
            if (err) {
              console.error('Error:', err);
              return;
            }
            console.log('New schema:');
            console.log(row.sql);
            console.log('\n');

            console.log('========================================');
            console.log('  FIX COMPLETE!');
            console.log('========================================');
            console.log('file_path column now allows NULL values');
            console.log('CSV-only uploads will now work!\n');

            db.close();
          });
        });
      });
    });
  });
});
