const { query, run } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create(name, email, password, role = 'employee', agency_id = null, agency_name = null) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users(name, email, password_hash, role, agency_id, agency_name) VALUES(?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, agency_id, agency_name]
    );
    return { id: result.lastID, name, email, role, agency_id, agency_name };
  }

  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = ?', [id]);
    return result.rows[0];
  }

  static async getAll() {
    const result = await query('SELECT id, name, email, role, agency_id, agency_name, status FROM users ORDER BY id DESC');
    return result.rows;
  }

  static async findPendingByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = ? AND status = ?',
      [email, 'pending']
    );
    return result.rows[0];
  }

  static async activateAccount(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await run(
      'UPDATE users SET password_hash = ?, status = ? WHERE email = ?',
      [hashedPassword, 'active', email]
    );
  }

  static async createPending(name, email, role = 'contractor', agency_name = null) {
    const result = await run(
      'INSERT INTO users(name, email, password_hash, role, agency_name, status) VALUES(?, ?, ?, ?, ?, ?)',
      [name, email, '', role, agency_name, 'pending']
    );
    return { id: result.lastID, name, email, role, agency_name, status: 'pending' };
  }

  static async saveResetToken(userId, tokenHash, expiry) {
    await run(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [tokenHash, expiry, userId]
    );
  }

  static async findByResetToken(tokenHash) {
    const result = await query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
      [tokenHash, Date.now()]
    );
    return result.rows[0];
  }

  static async updatePassword(userId, hashedPassword) {
    await run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId]
    );
  }

  static async clearResetToken(userId) {
    await run(
      'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [userId]
    );
  }

  static async updateAgency(userId, agencyName) {
    await run(
      'UPDATE users SET agency_name = ? WHERE id = ?',
      [agencyName, userId]
    );
  }
}

module.exports = User;
