const Notification = require('../Models/Notification');

// Get all notifications for logged-in user
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.getByUser(req.user.id);
    res.json(notifications);
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get unread notifications for logged-in user
exports.getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.getUnreadByUser(req.user.id);
    res.json(notifications);
  } catch (err) {
    console.error('❌ Error fetching unread notifications:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (err) {
    console.error('❌ Error fetching unread count:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id, req.user.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('❌ Error marking notification as read:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('❌ Error marking all notifications as read:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.delete(id, req.user.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    console.error('❌ Error deleting notification:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
  try {
    const preferences = await Notification.getPreferences(req.user.id);
    res.json(preferences);
  } catch (err) {
    console.error('❌ Error fetching preferences:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    await Notification.updatePreferences(req.user.id, req.body);
    res.json({ success: true, message: 'Preferences updated successfully' });
  } catch (err) {
    console.error('❌ Error updating preferences:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
