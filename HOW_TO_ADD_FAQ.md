# 📚 How to Add/Manage FAQs

This guide explains how to add, edit, and manage FAQs in the Payroll Portal chatbot system.

---

## 🚀 METHOD 1: Using the Script (EASIEST)

### Step 1: Edit the FAQ Details

1. Open the file: `Backend/addNewFAQ.js`
2. Find the section that says "EDIT YOUR FAQ DETAILS HERE"
3. Modify the FAQ details:

```javascript
const newFAQ = {
  category: 'CIS',  // Choose: 'CIS', 'Umbrella', 'PAYE', 'EOR', 'General'
  question: 'Your question here?',
  answer: 'Your detailed answer here. You can make this as long as needed.',
  keywords: 'keyword1, keyword2, keyword3'  // For search functionality
};
```

### Step 2: Run the Script

Open terminal in the Backend folder and run:

```bash
cd Backend
node addNewFAQ.js
```

### Step 3: Verify

You should see:
```
✅ FAQ added successfully!
FAQ ID: 25
The FAQ is now available in:
- Chatbot search results
- FAQ page (/faq)
- Category: CIS
```

The FAQ is now live! No server restart needed.

---

## 💾 METHOD 2: Direct Database Insert (ADVANCED)

If you prefer to add FAQs directly to the database:

### Using SQLite Command Line:

```bash
cd Backend
sqlite3 payroll.db
```

Then run:

```sql
INSERT INTO faqs (category, question, answer, keywords, created_at)
VALUES (
  'CIS',
  'What is CIS?',
  'CIS stands for Construction Industry Scheme...',
  'CIS, construction, scheme, tax',
  datetime('now')
);
```

Exit with: `.exit`

---

## 📝 FAQ CATEGORIES

Choose one of these categories for your FAQ:

| Category | Description | Example Questions |
|----------|-------------|-------------------|
| **CIS** | Construction Industry Scheme | CIS rates, deductions, registration |
| **Umbrella** | Umbrella company services | How umbrella works, fees, benefits |
| **PAYE** | Pay As You Earn | PAYE vs CIS, tax codes, deductions |
| **EOR** | Employer of Record | EOR services, compliance, contracts |
| **General** | General payroll questions | Payslips, timesheets, payments |

---

## 🔍 KEYWORDS FOR SEARCH

Keywords help the chatbot find relevant FAQs when users ask questions.

### Good Keywords:
- Main terms from the question
- Synonyms and related terms
- Common misspellings
- Abbreviations

### Example:

**Question:** "What is the CIS deduction rate?"

**Good Keywords:** `CIS, deduction, rate, percentage, tax, construction, scheme, 20%, 30%`

**Why:** Users might search for "CIS rate", "CIS percentage", "CIS tax", etc.

---

## ✏️ WRITING GOOD FAQ ANSWERS

### Best Practices:

1. **Be Clear and Concise**
   - Start with a direct answer
   - Then provide details
   - Use simple language

2. **Use Examples**
   ```
   Example: If you earn £1000 and you're a registered CIS subcontractor, 
   £200 (20%) will be deducted for tax.
   ```

3. **Break Up Long Answers**
   - Use paragraphs
   - Use bullet points
   - Use numbered lists

4. **Include Relevant Links** (if needed)
   ```
   For more information, visit: https://www.gov.uk/cis
   ```

### Example of a Well-Written FAQ:

```javascript
{
  category: 'CIS',
  question: 'What is the CIS deduction rate?',
  answer: `The CIS deduction rate depends on your registration status:

• Registered subcontractors: 20%
• Unregistered subcontractors: 30%
• Gross payment status: 0%

Example: If you earn £1000 as a registered subcontractor, £200 will be deducted and paid to HMRC on your behalf.

The deduction appears on your payslip and counts towards your annual tax bill. You can claim it back when you file your Self Assessment tax return.`,
  keywords: 'CIS, deduction, rate, percentage, tax, 20%, 30%, registered, unregistered'
}
```

---

## 🔄 UPDATING EXISTING FAQs

### Method 1: Using SQLite

```bash
cd Backend
sqlite3 payroll.db
```

Update an FAQ:

```sql
UPDATE faqs 
SET answer = 'Your new answer here',
    keywords = 'updated, keywords, here'
WHERE id = 5;
```

### Method 2: Create an Update Script

Create `Backend/updateFAQ.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

// Edit these values
const faqId = 5;  // The ID of the FAQ to update
const newAnswer = 'Your updated answer here';
const newKeywords = 'updated, keywords';

const sql = `UPDATE faqs SET answer = ?, keywords = ? WHERE id = ?`;

db.run(sql, [newAnswer, newKeywords, faqId], function(err) {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log('✅ FAQ updated successfully!');
    console.log('Rows affected:', this.changes);
  }
  db.close();
});
```

Run with: `node updateFAQ.js`

---

## 🗑️ DELETING FAQs

### Using SQLite:

```bash
cd Backend
sqlite3 payroll.db
```

Delete an FAQ:

```sql
DELETE FROM faqs WHERE id = 5;
```

---

## 📊 VIEWING ALL FAQs

### Method 1: Using SQLite

```bash
cd Backend
sqlite3 payroll.db
```

View all FAQs:

```sql
SELECT id, category, question FROM faqs ORDER BY category, id;
```

View a specific FAQ:

```sql
SELECT * FROM faqs WHERE id = 5;
```

### Method 2: Create a View Script

Create `Backend/viewFAQs.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM faqs ORDER BY category, id', [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log('\n📚 All FAQs:\n');
    rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Category: ${row.category}`);
      console.log(`Question: ${row.question}`);
      console.log(`Answer: ${row.answer.substring(0, 100)}...`);
      console.log(`Keywords: ${row.keywords}`);
      console.log('---\n');
    });
    console.log(`Total FAQs: ${rows.length}`);
  }
  db.close();
});
```

Run with: `node viewFAQs.js`

---

## 🎯 QUICK REFERENCE

### Add New FAQ:
```bash
cd Backend
# Edit addNewFAQ.js first
node addNewFAQ.js
```

### View All FAQs:
```bash
cd Backend
sqlite3 payroll.db
SELECT id, category, question FROM faqs;
.exit
```

### Update FAQ:
```bash
cd Backend
sqlite3 payroll.db
UPDATE faqs SET answer = 'new answer' WHERE id = 5;
.exit
```

### Delete FAQ:
```bash
cd Backend
sqlite3 payroll.db
DELETE FROM faqs WHERE id = 5;
.exit
```

---

## 💡 TIPS

1. **Test Your FAQs**
   - After adding, test in the chatbot
   - Try different search terms
   - Make sure keywords work

2. **Keep Answers Updated**
   - Review FAQs regularly
   - Update when regulations change
   - Remove outdated information

3. **Monitor Usage**
   - Check which FAQs are most helpful
   - Add more FAQs for common questions
   - Improve answers based on feedback

4. **Organize by Category**
   - Keep related FAQs in the same category
   - Use consistent terminology
   - Cross-reference related FAQs

---

## 🆘 TROUBLESHOOTING

### FAQ Not Showing in Chatbot?

1. **Check the database:**
   ```bash
   cd Backend
   sqlite3 payroll.db
   SELECT * FROM faqs WHERE id = [your_faq_id];
   ```

2. **Restart the backend server:**
   - Stop the server (Ctrl+C)
   - Start again: `npm start`

3. **Clear browser cache:**
   - Hard refresh: Ctrl + Shift + R

### Keywords Not Working?

- Make sure keywords are comma-separated
- Include variations of terms
- Test with different search phrases

---

## 📞 NEED HELP?

If you need assistance:
1. Check the FAQ table structure: `Backend/migrations/addFAQTable.js`
2. Review existing FAQs: `Backend/seedFAQs.js`
3. Test the chatbot service: `Backend/services/chatbotService.js`

---

**Last Updated:** January 2025
