import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function DocumentStatus({ userId }) {
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [expiredDocs, setExpiredDocs] = useState([]);
  const [missingDocs, setMissingDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentStatus();
  }, [userId]);

  const fetchDocumentStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch expiring documents
      const expiringRes = await api.get('/api/documents/expiring');
      setExpiringDocs(expiringRes.data || []);

      // Fetch expired documents
      const expiredRes = await api.get('/api/documents/expired');
      setExpiredDocs(expiredRes.data || []);

      // Fetch missing required documents (if userId provided)
      if (userId) {
        const missingRes = await api.get(`/api/documents/missing/${userId}`);
        setMissingDocs(missingRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching document status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 0) return '#dc2626'; // Red - Expired
    if (daysUntilExpiry <= 7) return '#ea580c'; // Orange - Very urgent
    if (daysUntilExpiry <= 14) return '#f59e0b'; // Amber - Urgent
    return '#3b82f6'; // Blue - Warning
  };

  const getUrgencyLabel = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 0) return 'EXPIRED';
    if (daysUntilExpiry <= 7) return 'URGENT';
    if (daysUntilExpiry <= 14) return 'ATTENTION NEEDED';
    return 'EXPIRING SOON';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading document status...</p>
      </div>
    );
  }

  const totalIssues = expiringDocs.length + expiredDocs.length + missingDocs.length;

  if (totalIssues === 0) {
    return (
      <div style={styles.successCard}>
        <div style={styles.successIcon}>✅</div>
        <h3 style={styles.successTitle}>All Documents Up to Date</h3>
        <p style={styles.successText}>
          You have no expiring, expired, or missing documents. Great job!
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📋 Document Status</h2>
        <div style={styles.badge}>
          {totalIssues} {totalIssues === 1 ? 'Issue' : 'Issues'}
        </div>
      </div>

      {/* Expired Documents */}
      {expiredDocs.length > 0 && (
        <div style={styles.section}>
          <div style={{...styles.sectionHeader, background: '#fee2e2'}}>
            <span style={styles.sectionIcon}>🚨</span>
            <h3 style={{...styles.sectionTitle, color: '#dc2626'}}>
              Expired Documents ({expiredDocs.length})
            </h3>
          </div>
          <div style={styles.documentList}>
            {expiredDocs.map((doc) => (
              <div key={doc.id} style={{...styles.documentCard, borderLeft: '4px solid #dc2626'}}>
                <div style={styles.documentHeader}>
                  <span style={styles.documentType}>{doc.doc_type}</span>
                  <span style={{...styles.urgencyBadge, background: '#dc2626'}}>
                    EXPIRED
                  </span>
                </div>
                <div style={styles.documentDetails}>
                  <p style={styles.documentInfo}>
                    <strong>Expired:</strong> {formatDate(doc.expiry_date)}
                  </p>
                  <p style={styles.documentInfo}>
                    <strong>File:</strong> {doc.file_name}
                  </p>
                </div>
                <div style={styles.documentActions}>
                  <button style={{...styles.actionButton, background: '#dc2626'}}>
                    Upload New Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Soon Documents */}
      {expiringDocs.length > 0 && (
        <div style={styles.section}>
          <div style={{...styles.sectionHeader, background: '#fef3c7'}}>
            <span style={styles.sectionIcon}>⚠️</span>
            <h3 style={{...styles.sectionTitle, color: '#f59e0b'}}>
              Expiring Soon ({expiringDocs.length})
            </h3>
          </div>
          <div style={styles.documentList}>
            {expiringDocs.map((doc) => {
              const daysUntilExpiry = Math.ceil(
                (new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div 
                  key={doc.id} 
                  style={{
                    ...styles.documentCard, 
                    borderLeft: `4px solid ${getUrgencyColor(daysUntilExpiry)}`
                  }}
                >
                  <div style={styles.documentHeader}>
                    <span style={styles.documentType}>{doc.doc_type}</span>
                    <span 
                      style={{
                        ...styles.urgencyBadge, 
                        background: getUrgencyColor(daysUntilExpiry)
                      }}
                    >
                      {daysUntilExpiry} {daysUntilExpiry === 1 ? 'DAY' : 'DAYS'} LEFT
                    </span>
                  </div>
                  <div style={styles.documentDetails}>
                    <p style={styles.documentInfo}>
                      <strong>Expires:</strong> {formatDate(doc.expiry_date)}
                    </p>
                    <p style={styles.documentInfo}>
                      <strong>File:</strong> {doc.file_name}
                    </p>
                  </div>
                  <div style={styles.documentActions}>
                    <button style={{...styles.actionButton, background: '#f59e0b'}}>
                      Renew Document
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Required Documents */}
      {missingDocs.length > 0 && (
        <div style={styles.section}>
          <div style={{...styles.sectionHeader, background: '#dbeafe'}}>
            <span style={styles.sectionIcon}>📄</span>
            <h3 style={{...styles.sectionTitle, color: '#2563eb'}}>
              Missing Required Documents ({missingDocs.length})
            </h3>
          </div>
          <div style={styles.documentList}>
            {missingDocs.map((docType, index) => (
              <div 
                key={index} 
                style={{...styles.documentCard, borderLeft: '4px solid #2563eb'}}
              >
                <div style={styles.documentHeader}>
                  <span style={styles.documentType}>{docType}</span>
                  <span style={{...styles.urgencyBadge, background: '#2563eb'}}>
                    REQUIRED
                  </span>
                </div>
                <div style={styles.documentDetails}>
                  <p style={styles.documentInfo}>
                    This document is required for compliance and must be uploaded.
                  </p>
                </div>
                <div style={styles.documentActions}>
                  <button style={{...styles.actionButton, background: '#2563eb'}}>
                    Upload Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f3f4f6',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },
  badge: {
    background: '#dc2626',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  sectionIcon: {
    fontSize: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  documentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  documentCard: {
    background: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  documentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  documentType: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  },
  urgencyBadge: {
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  documentDetails: {
    marginBottom: '12px',
  },
  documentInfo: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '4px 0',
  },
  documentActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    padding: '8px 16px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    color: '#6b7280',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  successCard: {
    background: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#166534',
    marginBottom: '8px',
  },
  successText: {
    fontSize: '14px',
    color: '#15803d',
    margin: 0,
  },
};
