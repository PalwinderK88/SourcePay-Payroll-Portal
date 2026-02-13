const { query, run } = require('../config/db');

class Document {
  static async create(user_id, doc_type, file_name, file_path, expiry_date = null, is_required = 0) {
    const result = await run(
      `INSERT INTO documents(user_id, doc_type, file_name, file_path, expiry_date, is_required, status) 
       VALUES(?, ?, ?, ?, ?, ?, ?)`,
      [user_id, doc_type, file_name, file_path, expiry_date, is_required, 'active']
    );
    return { 
      id: result.lastID, 
      user_id, 
      doc_type, 
      file_name,
      file_path,
      expiry_date,
      is_required,
      status: 'active',
      uploaded_at: new Date().toISOString() 
    };
  }

  static async getByUser(user_id) {
    const result = await query(
      'SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC',
      [user_id]
    );
    return result.rows;
  }

  static async getAll() {
    const result = await query('SELECT * FROM documents ORDER BY uploaded_at DESC');
    return result.rows;
  }

  static async getExpiringSoon(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    const result = await query(
      `SELECT d.*, u.name as user_name, u.email as user_email 
       FROM documents d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.expiry_date IS NOT NULL 
       AND d.expiry_date <= ? 
       AND d.status = 'active'
       ORDER BY d.expiry_date ASC`,
      [futureDateStr]
    );
    return result.rows;
  }

  static async getExpired() {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await query(
      `SELECT d.*, u.name as user_name, u.email as user_email 
       FROM documents d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.expiry_date IS NOT NULL 
       AND d.expiry_date < ? 
       AND d.status = 'active'
       ORDER BY d.expiry_date DESC`,
      [today]
    );
    return result.rows;
  }

  static async updateStatus(id, status) {
    await run(
      'UPDATE documents SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async updateReminderSent(id) {
    const today = new Date().toISOString().split('T')[0];
    await run(
      'UPDATE documents SET reminder_sent = 1, last_reminder_date = ? WHERE id = ?',
      [today, id]
    );
  }

  static async getMissingRequiredDocuments(user_id) {
    const result = await query(
      `SELECT dr.doc_type, dr.status 
       FROM document_requirements dr 
       WHERE dr.user_id = ? 
       AND dr.is_required = 1 
       AND dr.status = 'pending'
       AND NOT EXISTS (
         SELECT 1 FROM documents d 
         WHERE d.user_id = dr.user_id 
         AND d.doc_type = dr.doc_type 
         AND d.status = 'active'
       )`,
      [user_id]
    );
    return result.rows;
  }

  static async setRequiredDocuments(user_id, docTypes) {
    // Insert or update required documents for user
    for (const docType of docTypes) {
      await run(
        `INSERT INTO document_requirements(user_id, doc_type, is_required, status) 
         VALUES(?, ?, 1, 'pending')
         ON CONFLICT(user_id, doc_type) DO UPDATE SET is_required = 1`,
        [user_id, docType]
      );
    }
  }
}

module.exports = Document;
