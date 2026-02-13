import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await api.get('/api/users/me');
        setUser(res.data);
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <img 
              src="/logo.png" 
              alt="SourcePay International" 
              style={styles.logoImage}
            />
          </div>
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={styles.userName}>{user.name}</div>
                <div style={styles.userRole}>{user.role}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>Welcome back, {user.name}! 👋</h1>
          <p style={styles.welcomeSubtitle}>
            Access your payroll information and documents
          </p>
        </div>

        {/* Navigation Cards */}
        <div style={styles.cardsGrid}>
          <div 
            style={styles.card}
            onClick={() => router.push('/dashboard')}
          >
            <div style={styles.cardIcon}>📊</div>
            <h3 style={styles.cardTitle}>Dashboard</h3>
            <p style={styles.cardDescription}>
              View your payslips, documents, and account overview
            </p>
            <div style={styles.cardArrow}>→</div>
          </div>

          <div 
            style={styles.card}
            onClick={() => router.push('/documents')}
          >
            <div style={styles.cardIcon}>📁</div>
            <h3 style={styles.cardTitle}>Documents</h3>
            <p style={styles.cardDescription}>
              Access and download your employment documents
            </p>
            <div style={styles.cardArrow}>→</div>
          </div>

          {user.role === 'admin' && (
            <div 
              style={styles.card}
              onClick={() => router.push('/admin')}
            >
              <div style={styles.cardIcon}>⚙️</div>
              <h3 style={styles.cardTitle}>Admin Panel</h3>
              <p style={styles.cardDescription}>
                Manage users, upload payslips and documents
              </p>
              <div style={styles.cardArrow}>→</div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div style={styles.statsSection}>
          <h2 style={styles.statsTitle}>Quick Info</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>Account Status</div>
              <div style={styles.statValue}>Active</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>Role</div>
              <div style={styles.statValue}>{user.role}</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>Email</div>
              <div style={styles.statValue}>{user.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2024 SourcePay International. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f7fa',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f5f7fa',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #2C3E2E',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    color: '#6B7C5D',
    fontSize: '16px',
  },
  header: {
    background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
    padding: '20px 40px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
  },
  logoImage: {
    height: '50px',
    width: 'auto',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: '#6B7C5D',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
  },
  userName: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
  },
  userRole: {
    color: '#a8b5a1',
    fontSize: '13px',
    textTransform: 'capitalize',
  },
  logoutButton: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  mainContent: {
    flex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '60px 40px',
    width: '100%',
  },
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  welcomeTitle: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#2C3E2E',
    marginBottom: '12px',
  },
  welcomeSubtitle: {
    fontSize: '18px',
    color: '#6B7C5D',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginBottom: '60px',
  },
  card: {
    background: '#ffffff',
    padding: '40px 30px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
    border: '2px solid transparent',
  },
  cardIcon: {
    fontSize: '48px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2C3E2E',
    marginBottom: '12px',
  },
  cardDescription: {
    fontSize: '15px',
    color: '#6B7C5D',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  cardArrow: {
    fontSize: '24px',
    color: '#2C3E2E',
    position: 'absolute',
    bottom: '30px',
    right: '30px',
    transition: 'transform 0.3s',
  },
  statsSection: {
    background: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  statsTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2C3E2E',
    marginBottom: '30px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '30px',
  },
  statItem: {
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  statLabel: {
    fontSize: '13px',
    color: '#6B7C5D',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2C3E2E',
    textTransform: 'capitalize',
  },
  footer: {
    background: '#2C3E2E',
    padding: '30px 40px',
    textAlign: 'center',
  },
  footerText: {
    color: '#a8b5a1',
    fontSize: '14px',
    margin: 0,
  },
};
