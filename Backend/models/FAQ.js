const { query, run } = require('../config/db');

class FAQ {
  // Get all FAQs
  static async getAll() {
    const result = await query('SELECT * FROM faqs ORDER BY category, id');
    return result.rows;
  }

  // Get FAQs by category
  static async getByCategory(category) {
    const result = await query(
      'SELECT * FROM faqs WHERE category = ? ORDER BY id',
      [category]
    );
    return result.rows;
  }

  // Search FAQs by keyword
  static async search(searchTerm) {
    const searchPattern = `%${searchTerm}%`;
    const result = await query(
      `SELECT * FROM faqs 
       WHERE question LIKE ? 
       OR answer LIKE ? 
       OR keywords LIKE ?
       ORDER BY 
         CASE 
           WHEN question LIKE ? THEN 1
           WHEN keywords LIKE ? THEN 2
           ELSE 3
         END,
         helpful_count DESC`,
      [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
    );
    return result.rows;
  }

  // Get FAQ by ID
  static async getById(id) {
    const result = await query('SELECT * FROM faqs WHERE id = ?', [id]);
    return result.rows[0];
  }

  // Get popular FAQs (most helpful)
  static async getPopular(limit = 10) {
    const result = await query(
      'SELECT * FROM faqs ORDER BY helpful_count DESC LIMIT ?',
      [limit]
    );
    return result.rows;
  }

  // Get FAQs by multiple categories
  static async getByCategories(categories) {
    const placeholders = categories.map(() => '?').join(',');
    const result = await query(
      `SELECT * FROM faqs WHERE category IN (${placeholders}) ORDER BY category, id`,
      categories
    );
    return result.rows;
  }

  // Mark FAQ as helpful
  static async markHelpful(faqId, userId = null) {
    // Update FAQ helpful count
    await run(
      'UPDATE faqs SET helpful_count = helpful_count + 1 WHERE id = ?',
      [faqId]
    );

    // Record feedback
    if (userId) {
      await run(
        'INSERT INTO faq_feedback (faq_id, user_id, helpful) VALUES (?, ?, 1)',
        [faqId, userId]
      );
    }

    return { success: true };
  }

  // Mark FAQ as not helpful
  static async markNotHelpful(faqId, userId = null, feedbackText = null) {
    // Update FAQ not helpful count
    await run(
      'UPDATE faqs SET not_helpful_count = not_helpful_count + 1 WHERE id = ?',
      [faqId]
    );

    // Record feedback
    if (userId) {
      await run(
        'INSERT INTO faq_feedback (faq_id, user_id, helpful, feedback_text) VALUES (?, ?, 0, ?)',
        [faqId, userId, feedbackText]
      );
    }

    return { success: true };
  }

  // Get all categories
  static async getCategories() {
    const result = await query(
      'SELECT DISTINCT category FROM faqs ORDER BY category'
    );
    return result.rows.map(row => row.category);
  }

  // Get FAQ statistics
  static async getStats() {
    const totalResult = await query('SELECT COUNT(*) as total FROM faqs');
    const categoriesResult = await query('SELECT COUNT(DISTINCT category) as count FROM faqs');
    const helpfulResult = await query('SELECT SUM(helpful_count) as total FROM faqs');
    const notHelpfulResult = await query('SELECT SUM(not_helpful_count) as total FROM faqs');

    return {
      totalFAQs: totalResult.rows[0].total,
      totalCategories: categoriesResult.rows[0].count,
      totalHelpful: helpfulResult.rows[0].total || 0,
      totalNotHelpful: notHelpfulResult.rows[0].total || 0
    };
  }

  // Create new FAQ (admin only)
  static async create(category, question, answer, keywords = '') {
    const result = await run(
      'INSERT INTO faqs (category, question, answer, keywords) VALUES (?, ?, ?, ?)',
      [category, question, answer, keywords]
    );
    return {
      id: result.lastID,
      category,
      question,
      answer,
      keywords,
      helpful_count: 0,
      not_helpful_count: 0
    };
  }

  // Update FAQ (admin only)
  static async update(id, category, question, answer, keywords) {
    await run(
      'UPDATE faqs SET category = ?, question = ?, answer = ?, keywords = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [category, question, answer, keywords, id]
    );
    return await FAQ.getById(id);
  }

  // Delete FAQ (admin only)
  static async delete(id) {
    await run('DELETE FROM faq_feedback WHERE faq_id = ?', [id]);
    await run('DELETE FROM faqs WHERE id = ?', [id]);
    return { success: true };
  }
}

module.exports = FAQ;
