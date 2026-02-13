const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('🌱 Seeding FAQ database with content...\n');

const faqs = [
  // CIS (Construction Industry Scheme) FAQs
  {
    category: 'CIS',
    question: 'What is CIS and who does it apply to?',
    answer: 'The Construction Industry Scheme (CIS) is a tax deduction scheme for contractors and subcontractors in the construction industry. If you work in construction, your contractor must register with CIS and deduct tax from your payments before paying you. The deductions count as advance payments towards your tax and National Insurance.',
    keywords: 'CIS, construction, tax deduction, subcontractor, contractor, scheme'
  },
  {
    category: 'CIS',
    question: 'How much tax is deducted under CIS?',
    answer: 'The standard CIS deduction rate is 20% for registered subcontractors and 30% for unregistered subcontractors. If you have gross payment status, no deductions are made. These deductions are taken from your payment before you receive it and count towards your annual tax bill.',
    keywords: 'CIS rate, 20%, 30%, deduction, gross payment, tax'
  },
  {
    category: 'CIS',
    question: 'How do I register for CIS?',
    answer: 'You can register for CIS online through the HMRC website or by calling the CIS helpline on 0300 200 3210. You\'ll need your National Insurance number and Unique Taxpayer Reference (UTR). Registration is free and helps reduce your deduction rate from 30% to 20%.',
    keywords: 'register CIS, HMRC, UTR, National Insurance, registration'
  },
  {
    category: 'CIS',
    question: 'Can I claim back CIS deductions?',
    answer: 'Yes, CIS deductions are advance payments towards your tax bill. When you complete your Self Assessment tax return, HMRC will calculate your actual tax liability. If too much has been deducted, you\'ll receive a refund. If not enough, you\'ll need to pay the difference.',
    keywords: 'CIS refund, claim back, Self Assessment, tax return, HMRC'
  },
  {
    category: 'CIS',
    question: 'What is gross payment status?',
    answer: 'Gross payment status allows you to be paid without CIS deductions. To qualify, you must pass HMRC\'s compliance and turnover tests, including having a good tax payment record and meeting minimum turnover requirements. This status must be renewed every 12 months.',
    keywords: 'gross payment, no deduction, CIS status, HMRC, compliance'
  },

  // Umbrella Company FAQs
  {
    category: 'Umbrella',
    question: 'What is an umbrella company?',
    answer: 'An umbrella company employs temporary workers and contractors who work on assignments for recruitment agencies or end clients. You become an employee of the umbrella company, which handles your payroll, tax, and National Insurance. This is a popular solution for contractors who don\'t want to run their own limited company.',
    keywords: 'umbrella company, employment, payroll, contractor, temporary worker'
  },
  {
    category: 'Umbrella',
    question: 'How does umbrella company payment work?',
    answer: 'Your recruitment agency or client pays the umbrella company your assignment rate. The umbrella company then deducts employer costs (Employer\'s NI, Apprenticeship Levy), their margin/fee, your tax and National Insurance, and pays you the remainder as your net salary. You receive a payslip showing all deductions.',
    keywords: 'umbrella payment, payslip, deductions, salary, net pay, fees'
  },
  {
    category: 'Umbrella',
    question: 'What are the benefits of using an umbrella company?',
    answer: 'Benefits include: simple administration (no company accounts or tax returns), statutory employment rights (holiday pay, sick pay, maternity/paternity pay), ability to claim business expenses, IR35 compliance, and professional indemnity insurance. It\'s ideal if you work on short-term contracts.',
    keywords: 'umbrella benefits, holiday pay, sick pay, expenses, IR35, insurance'
  },
  {
    category: 'Umbrella',
    question: 'What fees do umbrella companies charge?',
    answer: 'Umbrella companies typically charge between £15-£30 per week or £60-£130 per month. Some charge a percentage of your income. Always check what\'s included in the fee - it should cover payroll processing, tax compliance, insurance, and support. Avoid companies with hidden charges.',
    keywords: 'umbrella fees, charges, cost, weekly fee, monthly fee, pricing'
  },
  {
    category: 'Umbrella',
    question: 'Can I claim expenses through an umbrella company?',
    answer: 'You can claim legitimate business expenses like travel, accommodation, and professional fees, but only if you meet HMRC\'s Supervision, Direction and Control (SDC) rules. Most umbrella workers cannot claim expenses due to SDC restrictions. Your umbrella company will advise on what you can claim.',
    keywords: 'expenses, claims, SDC, travel, accommodation, HMRC rules'
  },

  // PAYE (Pay As You Earn) FAQs
  {
    category: 'PAYE',
    question: 'What is PAYE?',
    answer: 'PAYE (Pay As You Earn) is the system HMRC uses to collect Income Tax and National Insurance from employment income. Your employer deducts tax and NI from your wages before paying you. The amount deducted depends on your tax code and earnings. PAYE ensures you pay tax throughout the year rather than in one lump sum.',
    keywords: 'PAYE, Pay As You Earn, tax, National Insurance, employment, HMRC'
  },
  {
    category: 'PAYE',
    question: 'How is my PAYE tax calculated?',
    answer: 'Your tax is calculated using your tax code, which tells your employer how much tax-free income you get. For 2024/25, the standard Personal Allowance is £12,570. You pay 20% on income between £12,571-£50,270, 40% on £50,271-£125,140, and 45% above £125,140. National Insurance is also deducted.',
    keywords: 'PAYE calculation, tax code, Personal Allowance, tax rates, 20%, 40%, 45%'
  },
  {
    category: 'PAYE',
    question: 'What is a tax code and what does mine mean?',
    answer: 'Your tax code tells your employer how much tax to deduct. The most common code is 1257L (for 2024/25), meaning you can earn £12,570 tax-free. The number shows your tax-free amount divided by 10. Letters indicate your situation: L (standard allowance), M (Marriage Allowance), BR (basic rate), K (deductions exceed allowances).',
    keywords: 'tax code, 1257L, Personal Allowance, BR, K code, M code, HMRC'
  },
  {
    category: 'PAYE',
    question: 'What is National Insurance and how much do I pay?',
    answer: 'National Insurance (NI) is a tax on earnings that funds state benefits like the State Pension and NHS. For 2024/25, you pay 12% on earnings between £12,570-£50,270, and 2% on earnings above £50,270. Your employer also pays Employer\'s NI (13.8%) on your behalf, which doesn\'t come from your salary.',
    keywords: 'National Insurance, NI, 12%, 2%, contributions, State Pension, NHS'
  },
  {
    category: 'PAYE',
    question: 'Why has my tax code changed?',
    answer: 'Tax codes change for various reasons: change in Personal Allowance, starting/stopping benefits (company car, medical insurance), owing tax from previous years, receiving state benefits, or HMRC correcting errors. Check your tax code notice from HMRC. If it\'s wrong, contact HMRC on 0300 200 3300 to correct it.',
    keywords: 'tax code change, HMRC, Personal Allowance, benefits, correction'
  },

  // EOR (Employer of Record) FAQs
  {
    category: 'EOR',
    question: 'What is an Employer of Record (EOR)?',
    answer: 'An Employer of Record (EOR) is a third-party organization that becomes the legal employer of workers on behalf of another company. The EOR handles all employment responsibilities including payroll, tax compliance, benefits, and HR administration, while the worker performs services for the client company.',
    keywords: 'EOR, Employer of Record, legal employer, payroll, compliance, HR'
  },
  {
    category: 'EOR',
    question: 'How is EOR different from an umbrella company?',
    answer: 'While both employ workers on behalf of others, EOR services are typically used for international employment or complex compliance situations. EORs handle full employment lifecycle including contracts, benefits, and termination. Umbrella companies focus on UK temporary workers and contractors. EORs often provide more comprehensive HR support.',
    keywords: 'EOR vs umbrella, difference, international, compliance, HR support'
  },
  {
    category: 'EOR',
    question: 'What are the benefits of using an EOR?',
    answer: 'Benefits include: rapid market entry without setting up a legal entity, full compliance with local employment laws, reduced administrative burden, access to local benefits and insurance, protection from employment liability, and flexibility to scale workforce up or down. Ideal for international expansion or complex employment situations.',
    keywords: 'EOR benefits, compliance, international, legal entity, liability, flexibility'
  },
  {
    category: 'EOR',
    question: 'How much does an EOR service cost?',
    answer: 'EOR services typically charge a percentage of gross salary (usually 8-15%) or a flat monthly fee per employee (£200-£500). Costs vary based on country, complexity, and services included. While more expensive than umbrella companies, EORs provide comprehensive employment management and compliance, especially valuable for international workers.',
    keywords: 'EOR cost, fees, pricing, percentage, monthly fee, charges'
  },
  {
    category: 'EOR',
    question: 'Am I an employee if I work through an EOR?',
    answer: 'Yes, you are a legal employee of the EOR company, with all associated employment rights and protections. You receive a formal employment contract, payslips, and statutory benefits. However, you perform work for the EOR\'s client company. This arrangement provides employment security while allowing flexibility for the end client.',
    keywords: 'EOR employment, employee rights, contract, benefits, legal status'
  },

  // General Payroll FAQs
  {
    category: 'General',
    question: 'When will I receive my payslip?',
    answer: 'Payslips are typically issued on or before your payment date. You\'ll receive a notification when your payslip is ready to view in the portal. If you haven\'t received your payslip within 24 hours of your payment date, please contact our support team.',
    keywords: 'payslip, payment date, notification, when, receive'
  },
  {
    category: 'General',
    question: 'How do I update my bank details?',
    answer: 'To update your bank details, log into the portal, go to Settings > Personal Information > Bank Details. You\'ll need to provide your account number, sort code, and account holder name. Changes take effect from the next payment cycle. Always verify your details are correct to avoid payment delays.',
    keywords: 'bank details, update, account number, sort code, payment, settings'
  },
  {
    category: 'General',
    question: 'What should I do if my payment is incorrect?',
    answer: 'First, check your payslip for any deductions or adjustments. If you believe there\'s an error, contact our payroll team immediately with details of the discrepancy. We\'ll investigate and correct any errors in the next payment cycle. Keep all payslips and timesheets as evidence.',
    keywords: 'incorrect payment, error, payslip, deductions, payroll team, dispute'
  },
  {
    category: 'General',
    question: 'How do I access my P60?',
    answer: 'Your P60 (end of year tax certificate) is available in the portal after the tax year ends (April 5th). Go to Documents > Tax Documents > P60. You need this for tax returns, benefit claims, or proof of income. Download and save it securely as you may need it for several years.',
    keywords: 'P60, tax certificate, end of year, tax return, documents, download'
  },
  {
    category: 'General',
    question: 'What documents do I need to provide for onboarding?',
    answer: 'You typically need: proof of identity (passport or driving license), proof of address (utility bill or bank statement within 3 months), proof of right to work in the UK, National Insurance number, bank details, and P45 from previous employer (if applicable). Upload these through the Documents section.',
    keywords: 'onboarding, documents, ID, proof of address, right to work, P45, upload'
  },
  {
    category: 'General',
    question: 'How do I report sickness or absence?',
    answer: 'Report sickness or absence as soon as possible through the portal or by contacting your agency/manager. For statutory sick pay (SSP), you may need a fit note from your doctor after 7 days. Keep records of all absence and medical certificates. Your entitlement depends on your employment type.',
    keywords: 'sickness, absence, SSP, sick pay, fit note, report, medical certificate'
  },
  {
    category: 'General',
    question: 'Am I entitled to holiday pay?',
    answer: 'If you\'re employed through an umbrella company or EOR, you\'re entitled to 5.6 weeks (28 days for full-time) paid holiday per year. This may be paid as you go (accrued with each payment) or taken as time off. CIS workers and limited company contractors typically aren\'t entitled to holiday pay.',
    keywords: 'holiday pay, annual leave, entitlement, 28 days, 5.6 weeks, umbrella, EOR'
  },
  {
    category: 'General',
    question: 'What is IR35 and does it affect me?',
    answer: 'IR35 is tax legislation to ensure workers who would be employees if hired directly pay similar tax to employees. It mainly affects limited company contractors. If you work through an umbrella company, PAYE, or EOR, you\'re already taxed as an employee so IR35 doesn\'t apply. Your client determines IR35 status for contract roles.',
    keywords: 'IR35, tax legislation, contractor, limited company, employment status, HMRC'
  }
];

console.log(`📝 Inserting ${faqs.length} FAQs into database...\n`);

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO faqs (category, question, answer, keywords)
    VALUES (?, ?, ?, ?)
  `);

  let inserted = 0;
  let errors = 0;

  faqs.forEach((faq, index) => {
    stmt.run([faq.category, faq.question, faq.answer, faq.keywords], (err) => {
      if (err) {
        console.error(`❌ Error inserting FAQ ${index + 1}:`, err);
        errors++;
      } else {
        inserted++;
        console.log(`✅ Inserted: ${faq.category} - ${faq.question.substring(0, 50)}...`);
      }
    });
  });

  stmt.finalize(() => {
    console.log(`\n📊 Summary:`);
    console.log(`   Total FAQs: ${faqs.length}`);
    console.log(`   Successfully inserted: ${inserted}`);
    console.log(`   Errors: ${errors}`);
    console.log('\n✅ FAQ database seeded successfully!');
    console.log('📝 Categories: CIS, Umbrella, PAYE, EOR, General');
    
    db.close();
  });
});
