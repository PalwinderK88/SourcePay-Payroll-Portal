const { query, run } = require('../config/db');

class Payslip {
  static async create(user_id, month, year, amount, file_name, file_path, holiday_pay = null, sick_pay = null, expenses = null, breakdown = {}) {
    const {
      gross_pay = null,
      tax_amount = null,
      national_insurance = null,
      cis_deduction = null,
      pension_contribution = null,
      admin_fee = null,
      net_pay = null,
      breakdown_notes = null
    } = breakdown;

    const result = await run(
      `INSERT INTO payslips(
        user_id, month, year, amount, file_name, file_path, 
        holiday_pay, sick_pay, expenses,
        gross_pay, tax_amount, national_insurance, cis_deduction, 
        pension_contribution, admin_fee, net_pay, breakdown_notes
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, month, year, amount, file_name, file_path, 
        holiday_pay, sick_pay, expenses,
        gross_pay, tax_amount, national_insurance, cis_deduction,
        pension_contribution, admin_fee, net_pay, breakdown_notes
      ]
    );
    return { 
      id: result.lastID, 
      user_id, 
      month, 
      year, 
      amount,
      holiday_pay,
      sick_pay,
      expenses,
      gross_pay,
      tax_amount,
      national_insurance,
      cis_deduction,
      pension_contribution,
      admin_fee,
      net_pay,
      breakdown_notes,
      file_name, 
      file_path, 
      uploaded_at: new Date().toISOString() 
    };
  }

  static async getByUser(user_id) {
    const result = await query(
      'SELECT * FROM payslips WHERE user_id = ? ORDER BY uploaded_at DESC',
      [user_id]
    );
    return result.rows;
  }

  static async getAll() {
    const result = await query('SELECT * FROM payslips ORDER BY uploaded_at DESC');
    return result.rows;
  }
}

module.exports = Payslip;
