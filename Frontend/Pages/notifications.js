import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../Components/Navbar';
import api from '../utils/api';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: 1 } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payslip': return '💰';
      case 'document': return '📄';
      case 'contract': return '📝';
      case 'pension': return '🏦';
      case 'account': return 'ℹ️';
      default: return '🔔';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.container}>
      <Navbar />
      
      <div style={styles.content}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Notifications</h1>
            <p style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={styles.markAllButton}>
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          <button
            onClick={() => setFilter('all')}
            style={{
              ...styles.filterTab,
              ...(filter === 'all' ? styles.filterTabActive : {})
            }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={{
              ...styles.filterTab,
              ...(filter === 'unread' ? styles.filterTabActive : {})
            }}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            style={{
              ...styles.filterTab,
              ...(filter === 'read' ? styles.filterTabActive : {})
            }}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div style={styles.notificationsList}>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div style={styles.empty}>
              <span style={styles.emptyIcon}>🔔</span>
              <h3 style={styles.emptyTitle}>No notifications</h3>
              <p style={styles.emptyText}>
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : filter === 'read'
                  ? "No read notifications yet."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  ...styles.notificationCard,
                  ...(notification.read ? {} : styles.notificationCardUnread)
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={styles.notificationContent}>
                  <div style={styles.notificationHeader}>
                    <h3 style={styles.notificationTitle}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span style={styles.unreadDot}></span>
                    )}
                  </div>
                  <p style={styles.notificationMessage}>
                    {notification.message}
                  </p>
                  <div style={styles.notificationFooter}>
                    <span style={styles.notificationTime}>
                      {formatTime(notification.created_at)}
                    </span>
                    {notification.link && (
                      <span style={styles.notificationLink}>
                        View details →
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  style={styles.deleteButton}
                  aria-label="Delete notification"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  markAllButton: {
    padding: '10px 20px',
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #e5e7eb',
  },
  filterTab: {
    padding: '12px 24px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '15px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '-2px',
  },
  filterTabActive: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
    fontWeight: '600',
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
  },
  notificationCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '20px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  notificationCardUnread: {
    background: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  notificationIcon: {
    fontSize: '32px',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  notificationTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    background: '#2563eb',
    borderRadius: '50%',
    flexShrink: 0,
  },
  notificationMessage: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.5',
    margin: '0 0 12px 0',
  },
  notificationFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  notificationLink: {
    fontSize: '13px',
    color: '#2563eb',
    fontWeight: '500',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0',
    width: '28px',
    height: '28px',
    flexShrink: 0,
    lineHeight: '1',
    transition: 'color 0.2s',
  },
};
