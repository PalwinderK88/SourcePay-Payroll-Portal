const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('📚 Fetching all FAQs from database...\n');

db.all('SELECT * FROM faqs ORDER BY category, id', [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
    db.close();
    return;
  }

  if (rows.length === 0) {
    console.log('No FAQs found in database.');
    db.close();
    return;
  }

  // Group by category
  const categories = {};
  rows.forEach(row => {
    if (!categories[row.category]) {
      categories[row.category] = [];
    }
    categories[row.category].push(row);
  });

  // Display by category
  Object.keys(categories).sort().forEach(category => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📂 CATEGORY: ${category}`);
    console.log(`${'='.repeat(60)}\n`);

    categories[category].forEach(faq => {
      console.log(`ID: ${faq.id}`);
      console.log(`❓ Question: ${faq.question}`);
      console.log(`💬 Answer: ${faq.answer.substring(0, 150)}${faq.answer.length > 150 ? '...' : ''}`);
      console.log(`🔍 Keywords: ${faq.keywords}`);
      console.log(`📅 Created: ${faq.created_at}`);
      console.log(`👍 Helpful Count: ${faq.helpful_count || 0}`);
      console.log('-'.repeat(60) + '\n');
    });
  });

  console.log(`\n✅ Total FAQs: ${rows.length}`);
  console.log(`📊 Categories: ${Object.keys(categories).join(', ')}`);
  
  db.close();
});
