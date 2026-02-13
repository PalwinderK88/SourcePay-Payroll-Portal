import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import BulkUploadSimple from '../Components/BulkUploadSimple';

export default function AgencyAdmin() {
  const [user, setUser] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  
  // Logo state
  const [agency, setAgency] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  
  // Upload form state
  const [contractorId, setContractorId] = useState('');
  const [periodType, setPeriodType] = useState('weekly');
  const [weekNumber, setWeekNumber] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [file, setFile] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      
      // Check if user is agency_admin or admin
      if (parsedUser.role !== 'agency_admin' && parsedUser.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setUser(parsedUser);

      try {
        // Fetch agency details including logo
        if (parsedUser.agency_id) {
          try {
            const agencyRes = await api.get(`/api/agencies/${parsedUser.agency_id}`);
            setAgency(agencyRes.data);
            console.log('✅ Agency loaded:', agencyRes.data);
          } catch (agencyErr) {
            console.error('❌ Failed to load agency:', agencyErr);
            setError(`Agency not found (ID: ${parsedUser.agency_id}). Please log out and log back in.`);
          }
        } else {
          setError('No agency_id found. Please log out and log back in.');
        }

        // Fetch all users and filter contractors for this agency
        console.log('🔍 Fetching users from /api/users...');
        const usersRes = await api.get('/api/users');
        const allUsers = usersRes.data;
        console.log('📋 All users:', allUsers);
        console.log('👤 Current user from localStorage:', parsedUser);
        console.log('👤 Current user agency:', parsedUser.agency_name);
        console.log('👤 Agency name type:', typeof parsedUser.agency_name);
        console.log('👤 Agency name value:', JSON.stringify(parsedUser.agency_name));
        
        // Log each user's agency_name for comparison
        allUsers.forEach(u => {
          console.log(`   User: ${u.name}, Role: ${u.role}, Agency: "${u.agency_name}" (type: ${typeof u.agency_name})`);
        });
        
        // Filter contractors for this agency
        const agencyContractors = allUsers.filter(u => {
          const isContractor = u.role === 'contractor';
          const agencyMatches = u.agency_name === parsedUser.agency_name;
          console.log(`   Checking ${u.name}: isContractor=${isContractor}, agencyMatches=${agencyMatches} ("${u.agency_name}" === "${parsedUser.agency_name}")`);
          return isContractor && agencyMatches;
        });
        console.log('✅ Filtered contractors:', agencyContractors);
        setContractors(agencyContractors);

        // Fetch timesheets (will be empty since routes are disabled)
        try {
          const timesheetsRes = await api.get('/api/timesheets/agency');
          setTimesheets(timesheetsRes.data);
        } catch (timesheetErr) {
          // Timesheet routes are disabled, so this will fail - that's okay
          console.log('Timesheet routes not available');
          setTimesheets([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load contractors');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) {
      setError('Please select a logo file');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(logoFile.type)) {
      setError('Invalid file type. Please upload JPG, PNG, SVG, or WEBP');
      return;
    }

    // Validate file size (5MB)
    if (logoFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setLogoUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await api.post(`/api/agencies/${user.agency_id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAgency(response.data.agency);
      setSuccess('Logo uploaded successfully!');
      setLogoFile(null);
      document.getElementById('logoInput').value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoDelete = async () => {
    if (!confirm('Are you sure you want to delete your agency logo?')) return;

    setLogoUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.delete(`/api/agencies/${user.agency_id}/logo`);
      setAgency(response.data.agency);
      setSuccess('Logo deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete logo');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!contractorId || !file || !year) {
      setError('Please fill in all required fields');
      return;
    }

    if (periodType === 'weekly' && !weekNumber) {
      setError('Please select a week number');
      return;
    }

    if (periodType === 'monthly' && !month) {
      setError('Please select a month');
      return;
    }

    setUploadLoading(true);

    try {
      const contractor = contractors.find(c => c.id === parseInt(contractorId));
      const formData = new FormData();
      formData.append('timesheet', file);
      formData.append('contractor_id', contractorId);
      formData.append('contractor_name', contractor.name);
      formData.append('period_type', periodType);
      formData.append('year', year);
      
      if (periodType === 'weekly') {
        formData.append('week_number', weekNumber);
      } else {
        formData.append('month', month);
      }

      await api.post('/api/timesheets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Timesheet uploaded successfully!');
      setContractorId('');
      setFile(null);
      setWeekNumber('');
      setMonth('');
      document.getElementById('fileInput').value = '';
      
      // Refresh timesheets
      const timesheetsRes = await api.get('/api/timesheets/agency');
      setTimesheets(timesheetsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload timesheet');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/api/timesheets/download/${id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timesheet_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download timesheet');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this timesheet?')) return;

    try {
      await api.delete(`/api/timesheets/${id}`);
      setSuccess('Timesheet deleted successfully');
      
      // Refresh timesheets
      const timesheetsRes = await api.get('/api/timesheets/agency');
      setTimesheets(timesheetsRes.data);
    } catch (err) {
      setError('Failed to delete timesheet');
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading agency admin panel...</p>
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
            {agency?.logo_path ? (
              <img 
                src={`http://localhost:5003${agency.logo_path}`}
                alt={agency.name}
                style={styles.agencyLogoImage}
                onError={(e) => {
                  e.target.src = '/logo.png';
                  e.target.style.filter = 'brightness(0) invert(1)';
                }}
              />
            ) : (
              <img 
                src="/logo.png" 
                alt="SourcePay International" 
                style={styles.logoImage}
              />
            )}
            <div style={styles.agencyNameHeader}>
              {user.agency_name || 'Agency Portal'}
            </div>
          </div>
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={styles.userName}>{user.name}</div>
                <div style={styles.userRole}>
                  <span style={styles.adminBadge}>Agency Admin</span>
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
            <h1 style={styles.pageTitle}>{user.agency_name}</h1>
            <p style={styles.pageSubtitle}>
              Manage timesheets and contractors
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
              <div style={styles.statValue}>{contractors.length}</div>
              <div style={styles.statLabel}>Contractors</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#e3f2fd'}}>
              📋
            </div>
            <div>
              <div style={styles.statValue}>{timesheets.length}</div>
              <div style={styles.statLabel}>Timesheets</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, background: '#fff3e0'}}>
              📤
            </div>
            <div>
              <div style={styles.statValue}>Upload</div>
              <div style={styles.statLabel}>New Timesheet</div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={styles.errorAlert}>
            <span>❌ {error}</span>
            <button onClick={() => setError('')} style={styles.alertClose}>×</button>
          </div>
        )}
        {success && (
          <div style={styles.successAlert}>
            <span>✅ {success}</span>
            <button onClick={() => setSuccess('')} style={styles.alertClose}>×</button>
          </div>
        )}

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
              📤 Upload Timesheet
            </button>
            <button
              onClick={() => setActiveTab('timesheets')}
              style={{
                ...styles.tab,
                ...(activeTab === 'timesheets' ? styles.tabActive : {})
              }}
            >
              📋 Timesheets
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              style={{
                ...styles.tab,
                ...(activeTab === 'bulk' ? styles.tabActive : {})
              }}
            >
              📦 Bulk Upload
            </button>
            <button
              onClick={() => setActiveTab('contractors')}
              style={{
                ...styles.tab,
                ...(activeTab === 'contractors' ? styles.tabActive : {})
              }}
            >
              👥 Contractors
            </button>
            <button
              onClick={() => setActiveTab('logo')}
              style={{
                ...styles.tab,
                ...(activeTab === 'logo' ? styles.tabActive : {})
              }}
            >
              🎨 Agency Logo
            </button>
          </div>

          {/* Tab Content */}
          <div style={styles.tabContent}>
            {activeTab === 'upload' && (
              <div>
                <h2 style={styles.sectionTitle}>Upload Timesheet</h2>
                <p style={styles.sectionDescription}>
                  Upload timesheet files for your contractors
                </p>
                <div style={styles.uploadSection}>
                  <form onSubmit={handleUpload} style={styles.form}>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          Contractor <span style={styles.required}>*</span>
                        </label>
                        <select
                          value={contractorId}
                          onChange={(e) => setContractorId(e.target.value)}
                          style={styles.select}
                          required
                        >
                          <option value="">Select Contractor</option>
                          {contractors.map(contractor => (
                            <option key={contractor.id} value={contractor.id}>
                              {contractor.name} ({contractor.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          Year <span style={styles.required}>*</span>
                        </label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          style={styles.select}
                          required
                        >
                          {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Period Type <span style={styles.required}>*</span>
                      </label>
                      <div style={styles.radioGroup}>
                        <label style={styles.radioLabel}>
                          <input
                            type="radio"
                            value="weekly"
                            checked={periodType === 'weekly'}
                            onChange={(e) => setPeriodType(e.target.value)}
                            style={styles.radio}
                          />
                          Weekly
                        </label>
                        <label style={styles.radioLabel}>
                          <input
                            type="radio"
                            value="monthly"
                            checked={periodType === 'monthly'}
                            onChange={(e) => setPeriodType(e.target.value)}
                            style={styles.radio}
                          />
                          Monthly
                        </label>
                      </div>
                    </div>

                    {periodType === 'weekly' ? (
                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          Week Number <span style={styles.required}>*</span>
                        </label>
                        <select
                          value={weekNumber}
                          onChange={(e) => setWeekNumber(e.target.value)}
                          style={styles.select}
                          required
                        >
                          <option value="">Select Week</option>
                          {weeks.map(week => (
                            <option key={week} value={week}>Week {week}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          Month <span style={styles.required}>*</span>
                        </label>
                        <select
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          style={styles.select}
                          required
                        >
                          <option value="">Select Month</option>
                          {months.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Timesheet File <span style={styles.required}>*</span>
                      </label>
                      <input
                        id="fileInput"
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => setFile(e.target.files[0])}
                        style={styles.fileInput}
                        required
                      />
                      <p style={styles.hint}>Accepted formats: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</p>
                    </div>

                    <button
                      type="submit"
                      disabled={uploadLoading}
                      style={{
                        ...styles.submitButton,
                        ...(uploadLoading ? styles.submitButtonDisabled : {})
                      }}
                    >
                      {uploadLoading ? 'Uploading...' : '📤 Upload Timesheet'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'timesheets' && (
              <div>
                <h2 style={styles.sectionTitle}>Uploaded Timesheets</h2>
                <p style={styles.sectionDescription}>
                  View and manage all uploaded timesheets
                </p>
                {timesheets.length > 0 ? (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.th}>Contractor</th>
                          <th style={styles.th}>Period</th>
                          <th style={styles.th}>Year</th>
                          <th style={styles.th}>Uploaded Date</th>
                          <th style={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timesheets.map((timesheet, index) => (
                          <tr key={index} style={styles.tableRow}>
                            <td style={styles.td}>
                              <div style={styles.userCell}>
                                <div style={styles.userCellAvatar}>
                                  {timesheet.contractor_name.charAt(0).toUpperCase()}
                                </div>
                                <span>{timesheet.contractor_name}</span>
                              </div>
                            </td>
                            <td style={styles.td}>
                              {timesheet.period_type === 'weekly' 
                                ? `Week ${timesheet.week_number}`
                                : timesheet.month
                              }
                            </td>
                            <td style={styles.td}>{timesheet.year}</td>
                            <td style={styles.td}>
                              {new Date(timesheet.uploaded_at).toLocaleDateString()}
                            </td>
                            <td style={styles.td}>
                              <div style={styles.actionButtons}>
                                <button
                                  onClick={() => handleDownload(timesheet.id)}
                                  style={{...styles.actionButton, ...styles.downloadButton}}
                                >
                                  ⬇️ Download
                                </button>
                                <button
                                  onClick={() => handleDelete(timesheet.id)}
                                  style={{...styles.actionButton, ...styles.deleteButton}}
                                >
                                  🗑 Delete
                                </button>
                              </div>
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
                      Upload your first timesheet using the Upload tab
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bulk' && (
              <div>
                <BulkUploadSimple />
              </div>
            )}

            {activeTab === 'contractors' && (
              <div>
                <h2 style={styles.sectionTitle}>Contractors</h2>
                <p style={styles.sectionDescription}>
                  View all contractors in your agency
                </p>
                {contractors.length > 0 ? (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeader}>
                          <th style={styles.th}>Name</th>
                          <th style={styles.th}>Email</th>
                          <th style={styles.th}>Agency</th>
                          <th style={styles.th}>Timesheets</th>
                          <th style={styles.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contractors.map((contractor, index) => (
                          <tr key={index} style={styles.tableRow}>
                            <td style={styles.td}>
                              <div style={styles.userCell}>
                                <div style={styles.userCellAvatar}>
                                  {contractor.name.charAt(0).toUpperCase()}
                                </div>
                                <span>{contractor.name}</span>
                              </div>
                            </td>
                            <td style={styles.td}>{contractor.email}</td>
                            <td style={styles.td}>{contractor.agency_name}</td>
                            <td style={styles.td}>
                              {timesheets.filter(t => t.contractor_id === contractor.id).length}
                            </td>
                            <td style={styles.td}>
                              <span style={styles.statusBadge}>Active</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={styles.emptyStateCard}>
                    <div style={styles.emptyStateIcon}>👥</div>
                    <h3 style={styles.emptyStateTitle}>No Contractors Found</h3>
                    <p style={styles.emptyStateText}>
                      No contractors are assigned to your agency yet
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logo' && (
              <div>
                <h2 style={styles.sectionTitle}>Agency Logo</h2>
                <p style={styles.sectionDescription}>
                  Upload and manage your agency logo for white labelling
                </p>
                
                <div style={styles.logoSection}>
                  {/* Current Logo Display */}
                  <div style={styles.logoPreviewCard}>
                    <h3 style={styles.logoPreviewTitle}>Current Logo</h3>
                    {agency?.logo_path ? (
                      <div style={styles.logoPreviewContainer}>
                        <img 
                          src={`http://localhost:5003${agency.logo_path}`}
                          alt={agency.name}
                          style={styles.logoPreviewImage}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{...styles.logoPlaceholder, display: 'none'}}>
                          <span style={styles.logoPlaceholderIcon}>🏢</span>
                          <span style={styles.logoPlaceholderText}>Logo not found</span>
                        </div>
                        <div style={styles.logoActions}>
                          <button
                            onClick={handleLogoDelete}
                            disabled={logoUploading}
                            style={{
                              ...styles.actionButton,
                              ...styles.deleteButton,
                              ...(logoUploading ? styles.submitButtonDisabled : {})
                            }}
                          >
                            {logoUploading ? 'Deleting...' : '🗑 Delete Logo'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.logoPlaceholder}>
                        <span style={styles.logoPlaceholderIcon}>🏢</span>
                        <span style={styles.logoPlaceholderText}>No logo uploaded yet</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Form */}
                  <div style={styles.logoUploadCard}>
                    <h3 style={styles.logoUploadTitle}>
                      {agency?.logo_path ? 'Update Logo' : 'Upload Logo'}
                    </h3>
                    <form onSubmit={handleLogoUpload} style={styles.logoForm}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>
                          Select Logo File <span style={styles.required}>*</span>
                        </label>
                        <input
                          id="logoInput"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                          onChange={(e) => setLogoFile(e.target.files[0])}
                          style={styles.fileInput}
                        />
                        <p style={styles.hint}>
                          Accepted formats: JPG, PNG, SVG, WEBP (Max 5MB)
                        </p>
                        {logoFile && (
                          <div style={styles.selectedFile}>
                            <span>📎 {logoFile.name}</span>
                            <span style={styles.fileSize}>
                              ({(logoFile.size / 1024).toFixed(2)} KB)
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={logoUploading || !logoFile}
                        style={{
                          ...styles.submitButton,
                          ...(logoUploading || !logoFile ? styles.submitButtonDisabled : {})
                        }}
                      >
                        {logoUploading ? 'Uploading...' : '📤 Upload Logo'}
                      </button>
                    </form>

                    {/* Info Box */}
                    <div style={styles.infoBox}>
                      <div style={styles.infoIcon}>ℹ️</div>
                      <div>
                        <h4 style={styles.infoTitle}>White Labelling</h4>
                        <p style={styles.infoText}>
                          Your agency logo will be displayed across the portal for your contractors,
                          providing a branded experience. The logo will appear on dashboards, documents,
                          and communications.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
    gap: '0px',
  },
  logoImage: {
    width: '160px',
    height: 'auto',
    filter: 'brightness(0) invert(1)',
  },
  agencyLogoImage: {
    height: '90px',
    width: 'auto',
    maxWidth: '300px',
    objectFit: 'contain',
  },
  agencyNameHeader: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '0.5px',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2C3E2E',
  },
  required: {
    color: '#dc2626',
  },
  select: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s',
    background: '#ffffff',
  },
  radioGroup: {
    display: 'flex',
    gap: '24px',
    padding: '12px 0',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    color: '#2C3E2E',
    cursor: 'pointer',
    fontWeight: '500',
  },
  radio: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#2C3E2E',
  },
  fileInput: {
    padding: '12px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    background: '#ffffff',
  },
  hint: {
    fontSize: '13px',
    color: '#6B7C5D',
    marginTop: '4px',
  },
  submitButton: {
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '10px',
    boxShadow: '0 2px 6px rgba(44, 62, 46, 0.2)',
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
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
  downloadButton: {
    background: '#e3f2fd',
    color: '#1976d2',
  },
  deleteButton: {
    background: '#ffebee',
    color: '#d32f2f',
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
  logoSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginTop: '24px',
  },
  logoPreviewCard: {
    background: '#f9fafb',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  logoPreviewTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '16px',
  },
  logoPreviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logoPreviewImage: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
    maxHeight: '300px',
    objectFit: 'contain',
    background: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
  },
  logoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    background: '#ffffff',
    borderRadius: '8px',
    border: '2px dashed #d1d5db',
  },
  logoPlaceholderIcon: {
    fontSize: '64px',
    marginBottom: '12px',
  },
  logoPlaceholderText: {
    fontSize: '14px',
    color: '#6B7C5D',
  },
  logoActions: {
    display: 'flex',
    gap: '12px',
  },
  logoUploadCard: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  logoUploadTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '16px',
  },
  logoForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  selectedFile: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#0369a1',
    marginTop: '8px',
  },
  fileSize: {
    fontSize: '12px',
    color: '#64748b',
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: '#eff6ff',
    border: '1px solid #dbeafe',
    borderRadius: '8px',
    marginTop: '20px',
  },
  infoIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '4px',
  },
  infoText: {
    fontSize: '13px',
    color: '#3b82f6',
    lineHeight: '1.5',
  },
};
