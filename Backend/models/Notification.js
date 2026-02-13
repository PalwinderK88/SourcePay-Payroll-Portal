const { query, run } = require('../config/db');

class Notification {
  // Create a new notification
  static async create(user_id, type, title, message, link = null) {
    const result = await run(
      'INSERT INTO notifications(user_id, type, title, message, link) VALUES(?, ?, ?, ?, ?)',
      [user_id, type, title, message, link]
    );
    return {
      id: result.lastID,
      user_id,
      type,
      title,
      message,
      link,
      read: 0,
      created_at: new Date().toISOString()
    };
  }

  // Get all notifications for a user
  static async getByUser(user_id, limit = 50) {
    const result = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [user_id, limit]
    );
    return result.rows;
  }

  // Get unread notifications for a user
  static async getUnreadByUser(user_id) {
    const result = await query(
      'SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC',
      [user_id]
    );
    return result.rows;
  }

  // Get unread count for a user
  static async getUnreadCount(user_id) {
    const result = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
      [user_id]
    );
    return result.rows[0]?.count || 0;
  }

  // Mark notification as read
  static async markAsRead(id, user_id) {
    await run(
      'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    return { success: true };
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(user_id) {
    await run(
      'UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0',
      [user_id]
    );
    return { success: true };
  }

  // Delete a notification
  static async delete(id, user_id) {
    await run(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    return { success: true };
  }

  // Delete old notifications (older than 30 days)
  static async deleteOld() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await run(
      'DELETE FROM notifications WHERE created_at < ? AND read = 1',
      [thirtyDaysAgo.toISOString()]
    );
    return { success: true };
  }

  // Get user notification preferences
  static async getPreferences(user_id) {
    const result = await query(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [user_id]
    );
    
    // If no preferences exist, create default ones
    if (result.rows.length === 0) {
      await run(
        `INSERT INTO notification_preferences(user_id) VALUES(?)`,
        [user_id]
      );
      return {
        user_id,
        email_notifications: 1,
        push_notifications: 1,
        payslip_notifications: 1,
        document_notifications: 1,
        contract_notifications: 1,
        pension_notifications: 1
      };
    }
    
    return result.rows[0];
  }

  // Update user notification preferences
  static async updatePreferences(user_id, preferences) {
    const {
      email_notifications,
      push_notifications,
      payslip_notifications,
      document_notifications,
      contract_notifications,
      pension_notifications
    } = preferences;

    await run(
      `UPDATE notification_preferences 
       SET email_notifications = ?,
           push_notifications = ?,
           payslip_notifications = ?,
           document_notifications = ?,
           contract_notifications = ?,
           pension_notifications = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        email_notifications,
        push_notifications,
        payslip_notifications,
        document_notifications,
        contract_notifications,
        pension_notifications,
        user_id
      ]
    );

    return { success: true };
  }
}

module.exports = Notification;
