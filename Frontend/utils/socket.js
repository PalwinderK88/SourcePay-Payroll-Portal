import io from 'socket.io-client';
import { toast } from 'react-toastify';

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io('http://localhost:5003', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      this.isConnected = true;
      
      // Join user-specific room
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for notifications
    this.socket.on('notification', (notification) => {
      console.log('🔔 New notification received:', notification);
      
      // Show toast notification
      this.showToast(notification);
      
      // Trigger custom event for NotificationCenter to update
      window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
    });
  }

  showToast(notification) {
    const getIcon = (type) => {
      switch (type) {
        case 'payslip': return '💰';
        case 'document': return '📄';
        case 'contract': return '📝';
        case 'pension': return '🏦';
        default: return '🔔';
      }
    };

    toast.info(
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>{getIcon(notification.type)}</span>
        <div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            {notification.title}
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            {notification.message}
          </div>
        </div>
      </div>,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;
