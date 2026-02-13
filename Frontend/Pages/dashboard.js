import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import DocumentStatus from '../Components/DocumentStatus';

// Document Upload Form Component
function DocumentUploadForm({ onUploadSuccess }) {
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const documentTypes = [
    'Passport',
    'ID Card',
    'Driving License',
    'Proof of Address',
    'Bank Statement',
    'Tax Document',
    'Contract',
    'Right to Work',
    'Insurance Certificate',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !docType) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('doc_type', docType);
    formData.append('file', file);
    if (expiryDate) {
      formData.append('expiry_date', expiryDate);
    }
    formData.append('is_required', isRequired ? '1' : '0');

    try {
      await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Document uploaded successfully!');
      setDocType('');
      setFile(null);
      setExpiryDate('');
      setIsRequired(false);
      setShowForm(false);
      e.target.reset();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Error uploading document:', err);
      alert(err.response?.data?.message || 'Error uploading document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(44, 62, 46, 0.2)',
            transition: 'all 0.3s'
          }}
        >
          📤 Upload New Document
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{
          background: '#f9fafb',
          padding: '24px',
          borderRadius: '10px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2C3E2E', margin: 0 }}>
              Upload Document
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6B7C5D'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#2C3E2E', marginBottom: '8px' }}>
                Document Type *
              </label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">-- Select Document Type --</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#2C3E2E', marginBottom: '8px' }}>
                File (PDF, JPG, PNG) *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setFile(e.target.files[0])}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
              {file && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: '#6B7C5D' }}>
                  Selected: {file.name}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#2C3E2E', marginBottom: '8px' }}>
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#6B7C5D' }}>
                💡 Set an expiry date to receive automatic reminders
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="isRequired"
                checked={isRequired}
                onChange={e => setIsRequired(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="isRequired" style={{ fontSize: '14px', color: '#2C3E2E', cursor: 'pointer' }}>
                Mark as required document
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '12px 24px',
                  background: '#ffffff',
                  color: '#6B7C5D',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Fetch user info
        const userRes = await api.get('/api/users/me');
        setUser(userRes.data);

        // Fetch payslips
        const payslipsRes = await api.get('/api/payslips/');
        setPayslips(payslipsRes.data);

        // Fetch documents
        const docsRes = await api.get('/api/documents/');
        setDocuments(docsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <p style={styles.loadingText}>Loading your dashboard...</p>
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
        {/* Welcome Banner */}
        <div style={styles.welcomeBanner}>
          <h1 style={styles.welcomeTitle}>Welcome back, {user.name}! 👋</h1>
          <p style={styles.welcomeSubtitle}>
            Here's what's happening with your account today
          </p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#e8f5e9'}}>
              📄
            </div>
            <div>
              <div style={styles.statValue}>{payslips.length}</div>
              <div style={styles.statLabel}>Total Payslips</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#e3f2fd'}}>
              📋
            </div>
            <div>
              <div style={styles.statValue}>{documents.length}</div>
              <div style={styles.statLabel}>Documents</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#fff3e0'}}>
              ✓
            </div>
            <div>
              <div style={styles.statValue}>Active</div>
              <div style={styles.statLabel}>Account Status</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <div style={styles.tabsList}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                ...styles.tab,
                ...(activeTab === 'overview' ? styles.tabActive : {})
              }}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('payslips')}
              style={{
                ...styles.tab,
                ...(activeTab === 'payslips' ? styles.tabActive : {})
              }}
            >
              💰 Payslips
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              style={{
                ...styles.tab,
                ...(activeTab === 'documents' ? styles.tabActive : {})
              }}
            >
              📁 Documents
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                style={styles.tab}
              >
                ⚙️ Admin Panel
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div style={styles.tabContent}>
            {activeTab === 'overview' && (
              <div style={styles.overviewContent}>
                <h2 style={styles.sectionTitle}>Quick Overview</h2>
                <div style={styles.overviewGrid}>
                  <div style={styles.overviewCard}>
                    <h3 style={styles.overviewCardTitle}>Recent Activity</h3>
                    <div style={styles.activityList}>
                      {payslips.length > 0 ? (
                        payslips.slice(0, 3).map((payslip, index) => (
                          <div key={index} style={styles.activityItem}>
                            <span style={styles.activityIcon}>📄</span>
                            <div>
                              <div style={styles.activityTitle}>
                                Payslip for {payslip.month} {payslip.year}
                              </div>
                              <div style={styles.activityDate}>
                                {new Date(payslip.uploaded_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={styles.emptyState}>No recent payslips</p>
                      )}
                    </div>
                  </div>
                  <div style={styles.overviewCard}>
                    <h3 style={styles.overviewCardTitle}>Quick Actions</h3>
                    <div style={styles.actionsList}>
                      <button
                        onClick={() => setActiveTab('payslips')}
                        style={styles.actionButton}
                      >
                        <span style={styles.actionIcon}>💰</span>
                        View All Payslips
                      </button>
                      <button
                        onClick={() => setActiveTab('documents')}
                        style={styles.actionButton}
                      >
                        <span style={styles.actionIcon}>📁</span>
                        View Documents
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => router.push('/admin')}
                          style={styles.actionButton}
                        >
                          <span style={styles.actionIcon}>⚙️</span>
                          Admin Panel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payslips' && (
              <div>
                <h2 style={styles.sectionTitle}>My Payslips</h2>
                {payslips.length > 0 ? (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.th}>Period</th>
                          <th style={styles.th}>Uploaded Date</th>
                          <th style={styles.th}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payslips.map((payslip, index) => (
                          <tr key={index} style={styles.tableRow}>
                            <td style={styles.td}>
                              {payslip.month} {payslip.year}
                              {payslip.amount && ` - $${parseFloat(payslip.amount).toFixed(2)}`}
                            </td>
                            <td style={styles.td}>
                              {new Date(payslip.uploaded_at).toLocaleDateString()}
                            </td>
                            <td style={styles.td}>
                              <a
                                href={`http://localhost:5001${payslip.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.downloadButton}
                              >
                                Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={styles.emptyStateCard}>
                    <div style={styles.emptyStateIcon}>📄</div>
                    <h3 style={styles.emptyStateTitle}>No Payslips Yet</h3>
                    <p style={styles.emptyStateText}>
                      Your payslips will appear here once they are uploaded
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h2 style={styles.sectionTitle}>My Documents</h2>
                
                {/* Document Status Component */}
                <DocumentStatus userId={user.id} />
                
                {/* Upload Form for Contractors */}
                <DocumentUploadForm onUploadSuccess={() => {
                  // Refresh documents list
                  api.get('/api/documents/').then(res => setDocuments(res.data));
                }} />

                {/* Documents List */}
                {documents.length > 0 ? (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.th}>Document Type</th>
                          <th style={styles.th}>File Name</th>
                          <th style={styles.th}>Uploaded Date</th>
                          <th style={styles.th}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc, index) => (
                          <tr key={index} style={styles.tableRow}>
                            <td style={styles.td}>{doc.doc_type}</td>
                            <td style={styles.td}>{doc.file_name}</td>
                            <td style={styles.td}>
                              {new Date(doc.uploaded_at).toLocaleDateString()}
                            </td>
                            <td style={styles.td}>
                              <a
                                href={`http://localhost:5001${doc.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.downloadButton}
                              >
                                Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={styles.emptyStateCard}>
                    <div style={styles.emptyStateIcon}>📁</div>
                    <h3 style={styles.emptyStateTitle}>No Documents Yet</h3>
                    <p style={styles.emptyStateText}>
                      Upload your documents using the form above
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f7fa',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
    padding: '24px 40px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
    gap: '16px',
  },
  logoImage: {
    width: '160px',
    height: 'auto',
    filter: 'brightness(0) invert(1)',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  logoSourcePay: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '-1px',
    lineHeight: '1',
  },
  logoInternational: {
    fontSize: '10px',
    fontWeight: '300',
    color: '#6B7C5D',
    letterSpacing: '4px',
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
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px',
  },
  welcomeBanner: {
    marginBottom: '30px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2C3E2E',
    marginBottom: '8px',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#6B7C5D',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2C3E2E',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7C5D',
  },
  tabsContainer: {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  tabsList: {
    display: 'flex',
    borderBottom: '2px solid #f0f0f0',
    padding: '0 20px',
  },
  tab: {
    padding: '16px 24px',
    background: 'none',
    border: 'none',
    fontSize: '15px',
    fontWeight: '500',
    color: '#6B7C5D',
    cursor: 'pointer',
    transition: 'all 0.3s',
    borderBottom: '3px solid transparent',
    marginBottom: '-2px',
  },
  tabActive: {
    color: '#2C3E2E',
    borderBottomColor: '#6B7C5D',
    fontWeight: '600',
  },
  tabContent: {
    padding: '30px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2C3E2E',
    marginBottom: '20px',
  },
  overviewContent: {},
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  overviewCard: {
    background: '#f9fafb',
    padding: '24px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
  },
  overviewCardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '16px',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#ffffff',
    borderRadius: '8px',
  },
  activityIcon: {
    fontSize: '24px',
  },
  activityTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2C3E2E',
  },
  activityDate: {
    fontSize: '12px',
    color: '#6B7C5D',
  },
  actionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2C3E2E',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textAlign: 'left',
  },
  actionIcon: {
    fontSize: '20px',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: '#f9fafb',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C3E2E',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#4b5563',
  },
  downloadButton: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
    color: '#ffffff',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s',
    boxShadow: '0 2px 6px rgba(44, 62, 46, 0.2)',
  },
  emptyState: {
    textAlign: 'center',
    color: '#6B7C5D',
    fontSize: '14px',
    padding: '20px',
  },
  emptyStateCard: {
    textAlign: 'center',
    padding: '60px 20px',
    background: '#f9fafb',
    borderRadius: '10px',
  },
  emptyStateIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyStateTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '8px',
  },
  emptyStateText: {
    fontSize: '14px',
    color: '#6B7C5D',
  },
};
