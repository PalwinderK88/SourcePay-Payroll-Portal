import { useState, useRef } from 'react';
import api from '../utils/api';

export default function BulkUploadSimple() {
  const [csvFile, setCsvFile] = useState(null);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  
  const csvInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/api/timesheets/bulk-template', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'timesheet_bulk_upload_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download template');
    }
  };

  const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      setError('');
      setResults(null);
    }
  };

  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files);
    setPdfFiles(files);
    setError('');
    setResults(null);
  };

  const handleUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    setUploading(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('csv', csvFile);
      pdfFiles.forEach(pdf => {
        formData.append('pdfs', pdf);
      });

      const response = await api.post('/api/timesheets/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResults(response.data);
      if (response.data.successCount > 0) {
        setCsvFile(null);
        setPdfFiles([]);
        if (csvInputRef.current) csvInputRef.current.value = '';
        if (pdfInputRef.current) pdfInputRef.current.value = '';
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
      if (error.response?.data) {
        setResults(error.response.data);
      }
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setCsvFile(null);
    setPdfFiles([]);
    setResults(null);
    setError('');
    if (csvInputRef.current) csvInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Bulk Timesheet Upload</h3>
      <p style={styles.subtitle}>Upload multiple timesheets using CSV/Excel file (PDFs optional)</p>

      {error && (
        <div style={styles.error}>⚠️ {error}</div>
      )}

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Step 1: Download Template</h4>
        <button onClick={downloadTemplate} style={styles.button} disabled={uploading}>
          📥 Download CSV Template
        </button>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Step 2: Upload CSV or Excel File</h4>
        <p style={styles.optionalNote}>📊 Accepts: .csv, .xlsx, or .xls files</p>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleCsvChange}
          style={styles.fileInput}
          disabled={uploading}
        />
        {csvFile && (
          <div style={styles.fileInfo}>✓ {csvFile.name}</div>
        )}
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Step 3: Upload PDF Files (Optional - {pdfFiles.length} selected)</h4>
        <p style={styles.optionalNote}>📝 PDF files are optional. You can upload just CSV data.</p>
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handlePdfChange}
          style={styles.fileInput}
          disabled={uploading}
        />
        {pdfFiles.length > 0 && (
          <div style={styles.fileList}>
            {pdfFiles.map((file, i) => (
              <div key={i} style={styles.fileInfo}>📄 {file.name}</div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <button
          onClick={handleUpload}
          style={{...styles.button, ...styles.uploadButton}}
          disabled={!csvFile || uploading}
        >
          {uploading ? '⏳ Uploading...' : '🚀 Upload Timesheets'}
        </button>
        <button onClick={reset} style={styles.resetButton} disabled={uploading}>
          🔄 Reset
        </button>
      </div>

      {results && (
        <div style={styles.results}>
          <h4 style={styles.resultsTitle}>
            {results.successCount > 0 ? '✅' : '❌'} Upload Results
          </h4>
          <div style={styles.summary}>
            <span style={styles.success}>✅ {results.successCount} successful</span>
            <span style={styles.failed}>❌ {results.failureCount} failed</span>
          </div>

          {results.successful && results.successful.length > 0 && (
            <div style={styles.successList}>
              <strong>Successful:</strong>
              {results.successful.map((item, i) => (
                <div key={i} style={styles.listItem}>
                  ✅ {item.contractor_name} - {item.period} {item.year}
                </div>
              ))}
            </div>
          )}

          {((results.failed && results.failed.length > 0) || 
            (results.validationErrors && results.validationErrors.length > 0)) && (
            <div style={styles.errorList}>
              <strong>Errors:</strong>
              {results.validationErrors && results.validationErrors.map((err, i) => (
                <div key={`val-${i}`} style={styles.listItem}>⚠️ {err}</div>
              ))}
              {results.failed && results.failed.map((item, i) => (
                <div key={`fail-${i}`} style={styles.listItem}>
                  ❌ {item.contractor_name}: {item.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2C3E2E',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7C5D',
    marginBottom: '20px',
  },
  error: {
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '20px',
    color: '#dc2626',
  },
  section: {
    marginBottom: '24px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '12px',
  },
  button: {
    background: '#2C3E2E',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  uploadButton: {
    background: '#2C3E2E',
  },
  resetButton: {
    background: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  fileInput: {
    display: 'block',
    width: '100%',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
  },
  fileInfo: {
    marginTop: '8px',
    padding: '8px',
    background: '#f0fdf4',
    border: '1px solid #d1fae5',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#166534',
  },
  fileList: {
    marginTop: '8px',
    maxHeight: '150px',
    overflowY: 'auto',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
  results: {
    marginTop: '24px',
    padding: '16px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '12px',
  },
  summary: {
    display: 'flex',
    gap: '20px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '600',
  },
  success: {
    color: '#10b981',
  },
  failed: {
    color: '#dc2626',
  },
  successList: {
    marginBottom: '16px',
    fontSize: '14px',
  },
  errorList: {
    fontSize: '14px',
  },
  listItem: {
    padding: '6px 0',
    borderBottom: '1px solid #e5e7eb',
  },
  optionalNote: {
    fontSize: '13px',
    color: '#6B7C5D',
    marginBottom: '8px',
    fontStyle: 'italic',
  },
};
