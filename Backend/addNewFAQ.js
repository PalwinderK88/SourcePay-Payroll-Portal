const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

/**
 * Add a new FAQ to the database
 * 
 * Usage: node addNewFAQ.js
 * Then follow the prompts or edit the FAQ details below
 */

// ============================================
// EDIT YOUR FAQ DETAILS HERE
// ============================================

const newFAQ = {
  category: 'CIS',  // Options: 'CIS', 'Umbrella', 'PAYE', 'EOR', 'General'
  question: 'What is the CIS deduction rate?',
  answer: 'The standard CIS deduction rate is 20% for registered subcontractors and 30% for unregistered subcontractors. This is deducted from your gross payment and paid to HMRC on your behalf.',
  keywords: 'CIS, deduction, rate, percentage, tax'  // Comma-separated keywords for search
};

// ============================================
// DO NOT EDIT BELOW THIS LINE
// ============================================

function addFAQ(faq) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO faqs (category, question, answer, keywords, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;

    db.run(sql, [faq.category, faq.question, faq.answer, faq.keywords], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          ...faq
        });
      }
    });
  });
}

// Main execution
console.log('📝 Adding new FAQ to database...\n');
console.log('Category:', newFAQ.category);
console.log('Question:', newFAQ.question);
console.log('Answer:', newFAQ.answer.substring(0, 100) + '...');
console.log('Keywords:', newFAQ.keywords);
console.log('\n');

addFAQ(newFAQ)
  .then((result) => {
    console.log('✅ FAQ added successfully!');
    console.log('FAQ ID:', result.id);
    console.log('\nThe FAQ is now available in:');
    console.log('- Chatbot search results');
    console.log('- FAQ page (/faq)');
    console.log('- Category:', result.category);
    db.close();
  })
  .catch((err) => {
    console.error('❌ Error adding FAQ:', err.message);
    db.close();
  });
