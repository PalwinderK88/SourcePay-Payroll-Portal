const db = require('../config/db');

class Agency {
  static async create(name) {
    const query = 'INSERT INTO agencies (name) VALUES (?) RETURNING *';
    const result = await db.query(query, [name]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM agencies ORDER BY name ASC';
    const result = await db.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM agencies WHERE id = ?';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, name) {
    const query = 'UPDATE agencies SET name = ? WHERE id = ?';
    const result = await db.run(query, [name, id]);
    // Fetch and return the updated agency
    return await this.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM agencies WHERE id = ?';
    await db.run(query, [id]);
  }

  // Update agency logo
  static async updateLogo(id, logoPath) {
    const query = 'UPDATE agencies SET logo_path = ? WHERE id = ?';
    await db.run(query, [logoPath, id]);
    return await this.findById(id);
  }

  // Get agency logo path
  static async getLogo(id) {
    const query = 'SELECT logo_path FROM agencies WHERE id = ?';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Remove agency logo
  static async removeLogo(id) {
    const query = 'UPDATE agencies SET logo_path = NULL WHERE id = ?';
    await db.run(query, [id]);
    return await this.findById(id);
  }
}

module.exports = Agency;
