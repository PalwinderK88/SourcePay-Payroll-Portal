import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import UploadPayslip from '../Components/UploadPayslip';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [newAgencyName, setNewAgencyName] = useState('');
  const [editingAgency, setEditingAgency] = useState(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserAgency, setNewUserAgency] = useState('');
  const [editingUserAgency, setEditingUserAgency] = useState(null);
  const [selectedAgencyForUser, setSelectedAgencyForUser] = useState('');
  const [timesheets, setTimesheets] = useState([]);
  const [uploadingLogoForAgency, setUploadingLogoForAgency] = useState(null);
  const [logoFiles, setLogoFiles] = useState({});
  const [logoError, setLogoError] = useState('');
  const [logoSuccess, setLogoSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Fetch current user info
        const userRes = await api.get('/api/users/me');
        setUser(userRes.data);

        // Check if user is admin
        if (userRes.data.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        // Fetch all users
        const usersRes = await api.get('/api/users');
        setUsers(usersRes.data);

        // Fetch all documents
        const docsRes = await api.get('/api/documents/all');
        setDocuments(docsRes.data);

        // Fetch all agencies
        const agenciesRes = await api.get('/api/agencies');
        setAgencies(agenciesRes.data);

        // Fetch all timesheets
        const timesheetsRes = await api.get('/api/timesheets/all');
        setTimesheets(timesheetsRes.data);
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

  const getAgencyName = (agencyId) => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency ? agency.name : 'N/A';
  };

  const handleAddAgency = async (e) => {
    e.preventDefault();
    if (!newAgencyName.trim()) return;

    try {
      await api.post('/api/agencies', { name: newAgencyName });
      const agenciesRes = await api.get('/api/agencies');
      setAgencies(agenciesRes.data);
      setNewAgencyName('');
      alert('Agency added successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding agency');
    }
  };

  const handleUpdateAgency = async (id, name) => {
    try {
      await api.put(`/api/agencies/${id}`, { name });
      const agenciesRes = await api.get('/api/agencies');
      setAgencies(agenciesRes.data);
      setEditingAgency(null);
      alert('Agency updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating agency');
    }
  };

  const handleDeleteAgency = async (id) => {
    if (!confirm('Are you sure you want to delete this agency?')) return;

    try {
      await api.delete(`/api/agencies/${id}`);
      const agenciesRes = await api.get('/api/agencies');
      setAgencies(agenciesRes.data);
      alert('Agency deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting agency');
    }
  };

  const handleLogoUpload = async (agencyId) => {
    const logoFile = logoFiles[agencyId];
    if (!logoFile) {
      setLogoError('Please select a logo file');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(logoFile.type)) {
      setLogoError('Invalid file type. Please upload JPG, PNG, SVG, or WEBP');
      return;
    }

    // Validate file size (5MB)
    if (logoFile.size > 5 * 1024 * 1024) {
      setLogoError('File size must be less than 5MB');
      return;
    }

    setUploadingLogoForAgency(agencyId);
    setLogoError('');
    setLogoSuccess('');

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      await api.post(`/api/agencies/${agencyId}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Refresh agencies list
      const agenciesRes = await api.get('/api/agencies');
      setAgencies(agenciesRes.data);
      
      // Clear the file input
      setLogoFiles(prev => {
        const updated = {...prev};
        delete updated[agencyId];
        return updated;
      });
      
      setLogoSuccess(`Logo uploaded successfully for agency ID ${agencyId}!`);
      setTimeout(() => setLogoSuccess(''), 3000);
    } catch (err) {
      setLogoError(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogoForAgency(null);
    }
  };

  const handleLogoDelete = async (agencyId) => {
    if (!confirm('Are you sure you want to delete this agency logo?')) return;

    setUploadingLogoForAgency(agencyId);
    setLogoError('');
    setLogoSuccess('');

    try {
      await api.delete(`/api/agencies/${agencyId}/logo`);
      
      // Refresh agencies list
      const agenciesRes = await api.get('/api/agencies');
      setAgencies(agenciesRes.data);
      
      setLogoSuccess(`Logo deleted successfully for agency ID ${agencyId}!`);
      setTimeout(() => setLogoSuccess(''), 3000);
    } catch (err) {
      setLogoError(err.response?.data?.message || 'Failed to delete logo');
    } finally {
      setUploadingLogoForAgency(null);
    }
  };

  const handlePreRegisterUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserAgency.trim()) return;

    try {
      await api.post('/api/auth/pre-register', {
        name: newUserName,
        email: newUserEmail,
        agency_name: newUserAgency
      });
      
      // Refresh users list
      const usersRes = await api.get('/api/users');
      setUsers(usersRes.data);
      
      // Clear form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserAgency('');
      
      alert('User pre-registered successfully! They can now activate their account.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error pre-registering user');
    }
  };

  const getPendingUsers = () => {
    return users.filter(u => u.status === 'pending');
  };

  const getActiveUsers = () => {
    return users.filter(u => u.status === 'active' || !u.status);
  };

  const handleUpdateUserAgency = async (userId, agencyName) => {
    try {
      await api.patch(`/api/users/${userId}/agency`, { agency_name: agencyName });
      
      // Refresh users list
      const usersRes = await api.get('/api/users');
      setUsers(usersRes.data);
      
      setEditingUserAgency(null);
      setSelectedAgencyForUser('');
      alert('User agency updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user agency');
    }
  };

  // Get list of all agencies from the agencies table
  const getAllAgencies = () => {
    return agencies.map(a => a.name).sort();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading admin panel...</p>
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
                <div style={styles.userRole}>
                  <span style={styles.adminBadge}>Admin</span>
                </div>
              </div>
            </div>
            <button onClick={() => router.push('/dashboard')} style={styles.dashboardButton}>
              Dashboard
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Admin Panel</h1>
            <p style={styles.pageSubtitle}>
              Manage payslips, documents, and user accounts
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#e8f5e9'}}>
              👥
            </div>
            <div>
              <div style={styles.statValue}>{users.length}</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#e3f2fd'}}>
              📤
            </div>
            <div>
              <div style={styles.statValue}>Upload</div>
              <div style={styles.statLabel}>Payslips & Docs</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#fff3e0'}}>
              ⚙️
            </div>
            <div>
              <div style={styles.statValue}>Manage</div>
              <div style={styles.statLabel}>System Settings</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <div style={styles.tabsList}>
            <button
              onClick={() => setActiveTab('upload')}
              style={{
                ...styles.tab,
                ...(activeTab === 'upload' ? styles.tabActive : {})
              }}
            >
              📤 Upload Payslips
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              style={{
                ...styles.tab,
                ...(activeTab === 'documents' ? styles.tabActive : {})
              }}
            >
              📁 All Documents
            </button>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                ...styles.tab,
                ...(activeTab === 'users' ? styles.tabActive : {})
              }}
            >
              👥 Manage Users
            </button>
            <button
              onClick={() => setActiveTab('preregister')}
              style={{
                ...styles.tab,
                ...(activeTab === 'preregister' ? styles.tabActive : {})
              }}
            >
              ➕ Pre-register Users
            </button>
            <button
              onClick={() => setActiveTab('timesheets')}
              style={{
                ...styles.tab,
                ...(activeTab === 'timesheets' ? styles.tabActive : {})
              }}
            >
              📋 All Timesheets
            </button>
            <button
              onClick={() => setActiveTab('agencies')}
              style={{
                ...styles.tab,
                ...(activeTab === 'agencies' ? styles.tabActive : {})
              }}
            >
              🏢 Manage Agencies
            </button>
          </div>

          {/* Tab Content */}
          <div style={styles.tabContent}>
            {activeTab === 'upload' && (
              <div>
                <h2 style={styles.sectionTitle}>Upload Payslips & Documents</h2>
                <p style={styles.sectionDescription}>
                  Select a user and upload their payslip or document files
                </p>
                <div style={styles.uploadSection}>
                  <UploadPayslip users={users} />
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h2 style={styles.sectionTitle}>All Contractor Documents</h2>
                <p style={styles.sectionDescription}>
                  View and download all documents uploaded by contractors
                </p>
                {documents.length > 0 ? (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.th}>Contractor</th>
                          <th style={styles.th}>Document Type</th>
                          <th style={styles.th}>File Name</th>
                          <th style={styles.th}>Uploaded Date</th>
                          <th style={styles.th}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc, index) => {
                          const docUser = users.find(u => u.id === doc.user_id);
                          return (
                            <tr key={index} style={styles.tableRow}>
                              <td style={styles.td}>
                                <div style={styles.userCell}>
                                  <div style={styles.userCellAvatar}>
                                    {docUser ? docUser.name.charAt(0).toUpperCase() : '?'}
                                  </div>
                                  <span>{docUser ? docUser.name : 'Unknown'}</span>
                                </div>
                              </td>
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={styles.emptyStateCard}>
                    <div style={styles.emptyStateIcon}>📁</div>
                    <h3 style={styles.emptyStateTitle}>No Documents Yet</h3>
                    <p style={styles.emptyStateText}>
                      Contractor documents will appear here once they upload them
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 style={styles.sectionTitle}>User Management</h2>
                <p style={styles.sectionDescription}>
                  View and manage all registered users
                </p>
                {users.length > 0 ? (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.th}>Name</th>
                          <th style={styles.th}>Email</th>
                          <th style={styles.th}>Role</th>
                          <th style={styles.th}>Agency</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, index) => (
                          <tr key={index} style={styles.tableRow}>
                            <td style={styles.td}>
                              <div style={styles.userCell}>
                                <div style={styles.userCellAvatar}>
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{u.name}</span>
                              </div>
                            </td>
                            <td style={styles.td}>{u.email}</td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.roleBadge,
                                ...(u.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeUser)
                              }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {editingUserAgency?.id === u.id ? (
                                <select
                                  value={selectedAgencyForUser}
                                  onChange={(e) => setSelectedAgencyForUser(e.target.value)}
                                  style={styles.editInput}
                                >
                                  <option value="">Select Agency</option>
                                  {getAllAgencies().map((agencyName, idx) => (
                                    <option key={idx} value={agencyName}>
                                      {agencyName}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                u.agency_name || 'N/A'
                              )}
                            </td>
                            <td style={styles.td}>
                              <span style={styles.statusBadge}>Active</span>
                            </td>
                            <td style={styles.td}>
                              {u.role === 'contractor' && (
                                <div style={styles.actionButtons}>
                                  {editingUserAgency?.id === u.id ? (
                                    <>
                                      <button
                                        onClick={() => handleUpdateUserAgency(u.id, selectedAgencyForUser)}
                                        style={{...styles.actionButton, ...styles.saveButton}}
                                        disabled={!selectedAgencyForUser}
                                      >
                                        ✓ Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingUserAgency(null);
                                          setSelectedAgencyForUser('');
                                        }}
                                        style={{...styles.actionButton, ...styles.cancelButton}}
                                      >
                                        ✕ Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingUserAgency(u);
                                        setSelectedAgencyForUser(u.agency_name || '');
                                      }}
                                      style={{...styles.actionButton, ...styles.editButton}}
                                    >
                                      ✎ Edit Agency
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={styles.emptyStateCard}>
                    <div style={styles.emptyStateIcon}>👥</div>
                    <h3 style={styles.emptyStateTitle}>No Users Found</h3>
                    <p style={styles.emptyStateText}>
                      No users are registered in the system yet
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preregister' && (
              <div>
                <h2 style={styles.sectionTitle}>Pre-register Users</h2>
                <p style={styles.sectionDescription}>
                  Pre-register contractors who can then activate their accounts
                </p>

                {/* Pre-register User Form */}
                <div style={styles.addAgencyForm}>
                  <h3 style={styles.formTitle}>Pre-register New User</h3>
                  <form onSubmit={handlePreRegisterUser} style={styles.preRegisterForm}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      style={styles.agencyInput}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      style={styles.agencyInput}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Agency Name"
                      value={newUserAgency}
                      onChange={(e) => setNewUserAgency(e.target.value)}
                      style={styles.agencyInput}
                      required
                    />
                    <button type="submit" style={styles.addButton}>
                      + Pre-register User
                    </button>
                  </form>
                </div>

                {/* Pending Users List */}
                {getPendingUsers().length > 0 ? (
                  <div>
                    <h3 style={styles.formTitle}>Pending Activations ({getPendingUsers().length})</h3>
                    <div style={styles.tableContainer}>
                      <table style={styles.table}>
                        <thead>
                          <tr style={styles.tableHeader}>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Agency</th>
                            <th style={styles.th}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getPendingUsers().map((u, index) => (
                            <tr key={index} style={styles.tableRow}>
                              <td style={styles.td}>
                                <div style={styles.userCell}>
                                  <div style={styles.userCellAvatar}>
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span>{u.name}</span>
                                </div>
                              </td>
                              <td style={styles.td}>{u.email}</td>
                              <td style={styles.td}>{u.agency_name || 'N/A'}</td>
                              <td style={styles.td}>
                                <span style={styles.pendingBadge}>⏳ Pending Activation</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div style={styles.emptyStateCard}>
                    <div style={styles.emptyStateIcon}>👤</div>
                    <h3 style={styles.emptyStateTitle}>No Pending Users</h3>
                    <p style={styles.emptyStateText}>
                      Pre-registered users waiting for activation will appear here
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'timesheets' && (
              <div>
                <h2 style={styles.sectionTitle}>All Timesheets</h2>
                <p style={styles.sectionDescription}>
                  View all timesheets uploaded by agency admins across all agencies
                </p>
                {timesheets.length > 0 ? (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.th}>Agency</th>
                          <th style={styles.th}>Contractor</th>
                          <th style={styles.th}>Period Type</th>
                          <th style={styles.th}>Period</th>
                          <th style={styles.th}>Year</th>
                          <th style={styles.th}>Uploaded Date</th>
                          <th style={styles.th}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timesheets.map((timesheet, index) => (
                          <tr key={index} style={styles.tableRow}>
                            <td style={styles.td}>
                              <span style={styles.agencyBadge}>
                                {timesheet.agency_name || 'N/A'}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={styles.userCell}>
                                <div style={styles.userCellAvatar}>
                                  {timesheet.contractor_name.charAt(0).toUpperCase()}
                                </div>
                                <span>{timesheet.contractor_name}</span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.periodTypeBadge}>
                                {timesheet.period_type}
                              </span>
                            </td>
                            <td style={styles.td}>
                              {timesheet.period_type === 'weekly' 
                                ? `Week ${timesheet.week_number}` 
                                : timesheet.month}
                            </td>
                            <td style={styles.td}>{timesheet.year}</td>
                            <td style={styles.td}>
                              {new Date(timesheet.created_at).toLocaleDateString()}
                            </td>
                            <td style={styles.td}>
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await api.get(`/api/timesheets/${timesheet.id}/download`, {
                                      responseType: 'blob'
                                    });
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `timesheet_${timesheet.contractor_name}_${timesheet.period_type}_${timesheet.year}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                  } catch (error) {
                                    alert('Error downloading timesheet');
                                  }
                                }}
                                style={styles.downloadButton}
                              >
                                📥 Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={styles.emptyStateCard}>
                    <div style={styles.emptyStateIcon}>📋</div>
                    <h3 style={styles.emptyStateTitle}>No Timesheets Yet</h3>
                    <p style={styles.emptyStateText}>
                      Timesheets uploaded by agency admins will appear here
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'agencies' && (
              <div>
                <h2 style={styles.sectionTitle}>Agency Management</h2>
                <p style={styles.sectionDescription}>
                  Add, edit, or remove agencies from the system, and manage their logos
                </p>

                {/* Logo Messages */}
                {logoError && (
                  <div style={styles.errorAlert}>
                    <span>❌ {logoError}</span>
                    <button onClick={() => setLogoError('')} style={styles.alertClose}>×</button>
                  </div>
                )}
                {logoSuccess && (
                  <div style={styles.successAlert}>
                    <span>✅ {logoSuccess}</span>
                    <button onClick={() => setLogoSuccess('')} style={styles.alertClose}>×</button>
                  </div>
                )}

                {/* Add New Agency Form */}
                <div style={styles.addAgencyForm}>
                  <h3 style={styles.formTitle}>Add New Agency</h3>
                  <form onSubmit={handleAddAgency} style={styles.agencyForm}>
                    <input
                      type="text"
                      placeholder="Enter agency name"
                      value={newAgencyName}
                      onChange={(e) => setNewAgencyName(e.target.value)}
                      style={styles.agencyInput}
                      required
                    />
                    <button type="submit" style={styles.addButton}>
                      + Add Agency
                    </button>
                  </form>
                </div>

                {/* Agencies List */}
                {agencies.length > 0 ? (
                  <div style={styles.agenciesGrid}>
                    {agencies.map((agency) => (
                      <div key={agency.id} style={styles.agencyCard}>
                        {/* Agency Header */}
                        <div style={styles.agencyCardHeader}>
                          <div style={styles.agencyCardTitle}>
                            {editingAgency?.id === agency.id ? (
                              <input
                                type="text"
                                value={editingAgency.name}
                                onChange={(e) => setEditingAgency({...editingAgency, name: e.target.value})}
                                style={styles.editInput}
                              />
                            ) : (
                              <>
                                <span style={styles.agencyIdBadge}>ID: {agency.id}</span>
                                <h3 style={styles.agencyName}>{agency.name}</h3>
                              </>
                            )}
                          </div>
                          <div style={styles.agencyActions}>
                            {editingAgency?.id === agency.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdateAgency(agency.id, editingAgency.name)}
                                  style={{...styles.actionButton, ...styles.saveButton}}
                                >
                                  ✓ Save
                                </button>
                                <button
                                  onClick={() => setEditingAgency(null)}
                                  style={{...styles.actionButton, ...styles.cancelButton}}
                                >
                                  ✕ Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingAgency(agency)}
                                  style={{...styles.actionButton, ...styles.editButton}}
                                >
                                  ✎ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteAgency(agency.id)}
                                  style={{...styles.actionButton, ...styles.deleteButton}}
                                >
                                  🗑 Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Logo Section */}
                        <div style={styles.logoSection}>
                          <div style={styles.logoPreview}>
                            {agency.logo_path ? (
                              <>
                                <img 
                                  src={`http://localhost:5003${agency.logo_path}`}
                                  alt={agency.name}
                                  style={styles.logoImage}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div style={{...styles.logoPlaceholder, display: 'none'}}>
                                  <span style={styles.logoPlaceholderIcon}>🏢</span>
                                  <span style={styles.logoPlaceholderText}>Logo not found</span>
                                </div>
                              </>
                            ) : (
                              <div style={styles.logoPlaceholder}>
                                <span style={styles.logoPlaceholderIcon}>🏢</span>
                                <span style={styles.logoPlaceholderText}>No logo</span>
                              </div>
                            )}
                          </div>

                          {/* Logo Upload/Delete */}
                          <div style={styles.logoControls}>
                            {agency.logo_path ? (
                              <button
                                onClick={() => handleLogoDelete(agency.id)}
                                disabled={uploadingLogoForAgency === agency.id}
                                style={{
                                  ...styles.logoButton,
                                  ...styles.logoDeleteButton,
                                  ...(uploadingLogoForAgency === agency.id ? styles.logoButtonDisabled : {})
                                }}
                              >
                                {uploadingLogoForAgency === agency.id ? 'Deleting...' : '🗑 Delete Logo'}
                              </button>
                            ) : null}
                            
                            <div style={styles.logoUploadContainer}>
                              <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    setLogoFiles(prev => ({...prev, [agency.id]: e.target.files[0]}));
                                  }
                                }}
                                style={styles.logoFileInput}
                                id={`logo-input-${agency.id}`}
                              />
                              <label htmlFor={`logo-input-${agency.id}`} style={styles.logoFileLabel}>
                                📎 Choose File
                              </label>
                              {logoFiles[agency.id] && (
                                <span style={styles.logoFileName}>
                                  {logoFiles[agency.id].name}
                                </span>
                              )}
                            </div>

                            {logoFiles[agency.id] && (
                              <button
                                onClick={() => handleLogoUpload(agency.id)}
                                disabled={uploadingLogoForAgency === agency.id}
                                style={{
                                  ...styles.logoButton,
                                  ...styles.logoUploadButton,
                                  ...(uploadingLogoForAgency === agency.id ? styles.logoButtonDisabled : {})
                                }}
                              >
                                {uploadingLogoForAgency === agency.id ? 'Uploading...' : '📤 Upload Logo'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Agency Info */}
                        <div style={styles.agencyInfo}>
                          <span style={styles.agencyInfoLabel}>Created:</span>
                          <span style={styles.agencyInfoValue}>
                            {new Date(agency.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyStateCard}>
                    <div style={styles.emptyStateIcon}>🏢</div>
                    <h3 style={styles.emptyStateTitle}>No Agencies Found</h3>
                    <p style={styles.emptyStateText}>
                      Add your first agency using the form above
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
    padding: '16px 40px',
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
    height: '28px',
    width: 'auto',
    filter: 'brightness(0) invert(1)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  adminBadge: {
    background: '#6B7C5D',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dashboardButton: {
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
  pageHeader: {
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#2C3E2E',
    marginBottom: '8px',
  },
  pageSubtitle: {
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
    transition: 'all 0.3s',
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
    marginBottom: '8px',
  },
  sectionDescription: {
    fontSize: '15px',
    color: '#6B7C5D',
    marginBottom: '24px',
  },
  uploadSection: {
    background: '#f9fafb',
    padding: '24px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
  },
  tableContainer: {
    overflowX: 'auto',
    background: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
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
    transition: 'background 0.2s',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#4b5563',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userCellAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#6B7C5D',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  roleBadgeAdmin: {
    background: '#2C3E2E',
    color: '#ffffff',
  },
  roleBadgeUser: {
    background: '#e8f5e9',
    color: '#2C3E2E',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#e8f5e9',
    color: '#2e7d32',
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
  addAgencyForm: {
    background: '#f9fafb',
    padding: '24px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '16px',
  },
  agencyForm: {
    display: 'flex',
    gap: '12px',
  },
  agencyInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s',
  },
  addButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  editInput: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '2px solid #6B7C5D',
    borderRadius: '6px',
    outline: 'none',
    width: '100%',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  editButton: {
    background: '#e3f2fd',
    color: '#1976d2',
  },
  deleteButton: {
    background: '#ffebee',
    color: '#d32f2f',
  },
  saveButton: {
    background: '#e8f5e9',
    color: '#2e7d32',
  },
  cancelButton: {
    background: '#f5f5f5',
    color: '#666',
  },
  preRegisterForm: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr auto',
    gap: '12px',
  },
  pendingBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#fff3e0',
    color: '#f57c00',
  },
  agencyBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#e3f2fd',
    color: '#1976d2',
  },
  periodTypeBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#f3e5f5',
    color: '#7b1fa2',
    textTransform: 'capitalize',
  },
  errorAlert: {
    padding: '16px 20px',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    color: '#dc2626',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '15px',
  },
  successAlert: {
    padding: '16px 20px',
    background: '#d1fae5',
    border: '1px solid #a7f3d0',
    borderRadius: '10px',
    color: '#059669',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '15px',
  },
  alertClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0 8px',
    color: 'inherit',
  },
  agenciesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px',
  },
  agencyCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.3s',
  },
  agencyCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f0f0f0',
  },
  agencyCardTitle: {
    flex: 1,
  },
  agencyIdBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    background: '#f3f4f6',
    color: '#6b7280',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  agencyName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2C3E2E',
    margin: 0,
  },
  agencyActions: {
    display: 'flex',
    gap: '8px',
  },
  logoSection: {
    marginBottom: '16px',
  },
  logoPreview: {
    width: '100%',
    height: '150px',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    overflow: 'hidden',
  },
  logoImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    padding: '10px',
  },
  logoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  logoPlaceholderIcon: {
    fontSize: '48px',
  },
  logoPlaceholderText: {
    fontSize: '13px',
    color: '#9ca3af',
    fontWeight: '500',
  },
  logoControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  logoUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoFileInput: {
    display: 'none',
  },
  logoFileLabel: {
    padding: '8px 16px',
    background: '#f3f4f6',
    color: '#374151',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: '1px solid #d1d5db',
  },
  logoFileName: {
    fontSize: '12px',
    color: '#6b7280',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  logoUploadButton: {
    background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
    color: '#ffffff',
  },
  logoDeleteButton: {
    background: '#ffebee',
    color: '#d32f2f',
  },
  logoButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  agencyInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #f0f0f0',
  },
  agencyInfoLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },
  agencyInfoValue: {
    fontSize: '12px',
    color: '#374151',
    fontWeight: '600',
  },
};
