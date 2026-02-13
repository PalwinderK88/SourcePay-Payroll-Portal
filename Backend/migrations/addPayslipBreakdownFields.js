const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Adding payslip breakdown fields to database...\n');

db.serialize(() => {
  // Add breakdown fields to payslips table
  const fields = [
    'gross_pay REAL',
    'tax_amount REAL',
    'national_insurance REAL',
    'cis_deduction REAL',
    'pension_contribution REAL',
    'admin_fee REAL',
    'net_pay REAL',
    'breakdown_notes TEXT'
  ];

  fields.forEach((field) => {
    const fieldName = field.split(' ')[0];
    db.run(`ALTER TABLE payslips ADD COLUMN ${field}`, (err) => {
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
});

// Close database after a delay to ensure all operations complete
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
    } else {
      console.log('\n✅ Payslip breakdown fields migration completed!');
    }
  });
}, 2000);
