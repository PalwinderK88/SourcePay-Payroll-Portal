// Plain-English explanations for payslip breakdown items

export const payslipExplanations = {
  gross_pay: {
    title: "Gross Pay",
    shortDesc: "Your total earnings before any deductions",
    fullDesc: "This is the total amount you've earned for this pay period before any taxes, insurance, or other deductions are taken out. It includes your basic pay, overtime, bonuses, and any other earnings.",
    icon: "💰"
  },
  
  tax_amount: {
    title: "Income Tax",
    shortDesc: "Tax paid to HMRC on your earnings",
    fullDesc: "Income tax is deducted from your pay and sent to HMRC (Her Majesty's Revenue and Customs). The amount depends on your tax code and how much you earn. Everyone has a tax-free personal allowance (currently £12,570 per year), and you only pay tax on earnings above this amount.",
    icon: "🏛️",
    learnMore: "https://www.gov.uk/income-tax-rates"
  },
  
  national_insurance: {
    title: "National Insurance (NI)",
    shortDesc: "Contributions for state benefits and pension",
    fullDesc: "National Insurance contributions go towards your state pension and other benefits like the NHS. If you're employed, both you and your employer pay NI. The amount depends on how much you earn - you start paying when you earn over £242 per week (2024/25 rates).",
    icon: "🏥",
    learnMore: "https://www.gov.uk/national-insurance"
  },
  
  cis_deduction: {
    title: "CIS Deduction",
    shortDesc: "Construction Industry Scheme tax deduction",
    fullDesc: "If you work in construction, your contractor deducts money from your pay and sends it to HMRC under the Construction Industry Scheme (CIS). This counts as advance payment towards your tax and National Insurance bill. The standard rate is 20%, or 30% if you're not registered with CIS. You can claim this back when you file your Self Assessment tax return.",
    icon: "🏗️",
    learnMore: "https://www.gov.uk/what-is-the-construction-industry-scheme"
  },
  
  pension_contribution: {
    title: "Pension Contribution",
    shortDesc: "Money saved for your retirement",
    fullDesc: "This is money automatically saved into your workplace pension for when you retire. By law, your employer must contribute too (minimum 3% of your qualifying earnings). Your contributions are taken before tax, which means you get tax relief - so if you pay 20% tax, a £100 contribution only costs you £80. You can usually increase your contribution percentage if you want to save more.",
    icon: "🏦",
    learnMore: "https://www.gov.uk/workplace-pensions"
  },
  
  admin_fee: {
    title: "Administration Fee",
    shortDesc: "Fee for payroll and admin services",
    fullDesc: "This is the fee charged by your umbrella company or payroll provider for processing your pay, handling your tax, and managing your employment paperwork. This fee covers services like calculating your tax, submitting returns to HMRC, providing payslips, and maintaining your employment records. The fee amount should be clearly stated in your contract.",
    icon: "📋"
  },
  
  holiday_pay: {
    title: "Holiday Pay",
    shortDesc: "Paid time off included in this payment",
    fullDesc: "Holiday pay is your entitlement to paid time off. By law, you're entitled to 5.6 weeks (28 days for full-time workers) of paid holiday per year. Some employers include holiday pay in each payment (rolled up), while others pay it when you take time off. This amount shows any holiday pay included in this payslip.",
    icon: "🏖️",
    learnMore: "https://www.gov.uk/holiday-entitlement-rights"
  },
  
  sick_pay: {
    title: "Sick Pay",
    shortDesc: "Payment for time off due to illness",
    fullDesc: "Statutory Sick Pay (SSP) is what you can get if you're too ill to work. You can get £109.40 per week for up to 28 weeks (2024/25 rates). You must be off work for at least 4 days in a row and earn at least £123 per week. Some employers offer enhanced sick pay above the statutory minimum.",
    icon: "🤒",
    learnMore: "https://www.gov.uk/statutory-sick-pay"
  },
  
  expenses: {
    title: "Expenses",
    shortDesc: "Reimbursement for work-related costs",
    fullDesc: "Expenses are reimbursements for money you've spent on work-related items like travel, accommodation, or equipment. These are paid back to you tax-free as long as they're genuine business expenses. Keep all receipts and make sure expenses are approved by your employer or agency.",
    icon: "🧾"
  },
  
  net_pay: {
    title: "Net Pay (Take Home)",
    shortDesc: "The amount paid into your bank account",
    fullDesc: "This is your 'take home pay' - the actual amount that will be paid into your bank account after all deductions. This is what you have available to spend. Net Pay = Gross Pay - (Tax + NI + Pension + Fees + Other Deductions) + (Holiday Pay + Expenses).",
    icon: "💵"
  }
};

// Get explanation by field name
export const getExplanation = (fieldName) => {
  return payslipExplanations[fieldName] || {
    title: fieldName,
    shortDesc: "Payslip item",
    fullDesc: "No detailed explanation available for this item.",
    icon: "📄"
  };
};

// Calculate breakdown summary
export const calculateBreakdownSummary = (payslip) => {
  const gross = parseFloat(payslip.gross_pay) || 0;
  const tax = parseFloat(payslip.tax_amount) || 0;
  const ni = parseFloat(payslip.national_insurance) || 0;
  const cis = parseFloat(payslip.cis_deduction) || 0;
  const pension = parseFloat(payslip.pension_contribution) || 0;
  const adminFee = parseFloat(payslip.admin_fee) || 0;
  const net = parseFloat(payslip.net_pay) || 0;
  
  const totalDeductions = tax + ni + cis + pension + adminFee;
  const deductionPercentage = gross > 0 ? (totalDeductions / gross) * 100 : 0;
  
  return {
    gross,
    totalDeductions,
    net,
    deductionPercentage: deductionPercentage.toFixed(1),
    breakdown: [
      { label: 'Income Tax', amount: tax, percentage: gross > 0 ? ((tax / gross) * 100).toFixed(1) : 0 },
      { label: 'National Insurance', amount: ni, percentage: gross > 0 ? ((ni / gross) * 100).toFixed(1) : 0 },
      { label: 'CIS Deduction', amount: cis, percentage: gross > 0 ? ((cis / gross) * 100).toFixed(1) : 0 },
      { label: 'Pension', amount: pension, percentage: gross > 0 ? ((pension / gross) * 100).toFixed(1) : 0 },
      { label: 'Admin Fee', amount: adminFee, percentage: gross > 0 ? ((adminFee / gross) * 100).toFixed(1) : 0 }
    ].filter(item => item.amount > 0)
  };
};

// Format currency
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '£0.00';
  return `£${parseFloat(amount).toFixed(2)}`;
};

// Common questions and answers
export const commonQuestions = [
  {
    question: "Why am I being charged CIS deductions?",
    answer: "If you work in construction, CIS deductions are required by law. Your contractor deducts 20% (or 30% if unregistered) and sends it to HMRC. This is an advance payment towards your tax bill, which you can claim back through your Self Assessment tax return."
  },
  {
    question: "Can I reduce my tax deductions?",
    answer: "Tax is calculated based on your tax code and earnings. If you think your tax code is wrong, contact HMRC. You can't choose to pay less tax, but you can increase pension contributions to reduce your taxable income."
  },
  {
    question: "What's the difference between gross and net pay?",
    answer: "Gross pay is your total earnings before deductions. Net pay (take home) is what you actually receive after tax, NI, pension, and other deductions are taken out."
  },
  {
    question: "Why is my admin fee charged?",
    answer: "The admin fee covers payroll processing, tax calculations, HMRC submissions, and employment administration. This should be clearly stated in your contract with your umbrella company or agency."
  },
  {
    question: "How do I claim back CIS deductions?",
    answer: "Register for Self Assessment with HMRC and file a tax return each year. Your CIS deductions will be credited against your tax bill, and you'll receive a refund if you've overpaid."
  }
];
