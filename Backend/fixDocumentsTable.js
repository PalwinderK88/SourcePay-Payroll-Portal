const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'payroll.db'));

console.log('🔄 Fixing documents table structure...\n');

// Check if doc_type column exists
db.all("PRAGMA table_info(documents)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }

  const hasDocType = columns.some(col => col.name === 'doc_type');
  const hasTitle = columns.some(col => col.name === 'title');

  if (hasTitle && !hasDocType) {
    console.log('📝 Renaming "title" column to "doc_type"...');
    
    // SQLite doesn't support RENAME COLUMN directly in older versions
    // We need to recreate the table
    db.serialize(() => {
      // Create new table with correct structure
      db.run(`
        CREATE TABLE documents_new (
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
          console.error('❌ Error creating new table:', err);
          db.close();
          return;
        }
        console.log('✅ Created new table structure');

        // Copy data from old table to new table
        db.run(`
          INSERT INTO documents_new (id, user_id, doc_type, file_name, file_path, uploaded_at)
          SELECT id, user_id, title, file_name, file_path, uploaded_at FROM documents
        `, (err) => {
          if (err) {
            console.error('❌ Error copying data:', err);
            db.close();
            return;
          }
          console.log('✅ Copied existing data');

          // Drop old table
          db.run('DROP TABLE documents', (err) => {
            if (err) {
              console.error('❌ Error dropping old table:', err);
              db.close();
              return;
            }
            console.log('✅ Dropped old table');

            // Rename new table to documents
            db.run('ALTER TABLE documents_new RENAME TO documents', (err) => {
              if (err) {
                console.error('❌ Error renaming table:', err);
              } else {
                console.log('✅ Renamed table to documents');
                
                // Verify the changes
                db.all("PRAGMA table_info(documents)", [], (err, columns) => {
                  if (err) {
                    console.error('❌ Error verifying:', err);
                  } else {
                    console.log('\n📊 Updated table structure:');
                    columns.forEach(col => {
                      console.log(`  - ${col.name} (${col.type})`);
                    });
                  }
                  db.close();
                });
              }
            });
          });
        });
      });
    });
  } else if (hasDocType) {
    console.log('✅ Table already has doc_type column - no changes needed');
    db.close();
  } else {
    console.log('⚠️ Unexpected table structure');
    db.close();
  }
});
