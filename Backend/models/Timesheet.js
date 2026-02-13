const { query, run } = require('../config/db');

class Timesheet {
  static async create(data) {
    const {
      agency_id,
      agency_name,
      contractor_id,
      contractor_name,
      period_type,
      week_number,
      month,
      year,
      file_path,
      uploaded_by
    } = data;

    const result = await run(
      `INSERT INTO timesheets (
        agency_id, agency_name, contractor_id, contractor_name,
        period_type, week_number, month, year, file_path, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        agency_id,
        agency_name,
        contractor_id,
        contractor_name,
        period_type,
        week_number,
        month,
        year,
        file_path,
        uploaded_by
      ]
    );

    return {
      id: result.lastID,
      ...data
    };
  }

  static async findAll() {
    const result = await query(
      'SELECT * FROM timesheets ORDER BY uploaded_at DESC'
    );
    return result.rows;
  }

  static async findByAgency(agency_id) {
    const result = await query(
      'SELECT * FROM timesheets WHERE agency_id = ? ORDER BY uploaded_at DESC',
      [agency_id]
    );
    return result.rows;
  }

  static async findByAgencyName(agency_name) {
    const result = await query(
      'SELECT * FROM timesheets WHERE agency_name = ? ORDER BY uploaded_at DESC',
      [agency_name]
    );
    return result.rows;
  }

  static async findByContractor(contractor_id) {
    const result = await query(
      'SELECT * FROM timesheets WHERE contractor_id = ? ORDER BY uploaded_at DESC',
      [contractor_id]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      'SELECT * FROM timesheets WHERE id = ?',
      [id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await run('DELETE FROM timesheets WHERE id = ?', [id]);
  }

  static async findByPeriod(agency_id, contractor_id, period_type, week_number, month, year) {
    let sql = 'SELECT * FROM timesheets WHERE agency_id = ? AND contractor_id = ? AND period_type = ? AND year = ?';
    let params = [agency_id, contractor_id, period_type, year];

    if (period_type === 'weekly') {
      sql += ' AND week_number = ?';
      params.push(week_number);
    } else {
      sql += ' AND month = ?';
      params.push(month);
    }

    const result = await query(sql, params);
    return result.rows[0];
  }
}

module.exports = Timesheet;
