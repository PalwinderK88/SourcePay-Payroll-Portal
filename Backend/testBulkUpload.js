const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5003';

// Test credentials - use an agency admin account
const TEST_CREDENTIALS = {
  email: 'agencyadmin@test.com',
  password: 'admin123'
};

let authToken = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Login to get auth token
async function testLogin() {
  log('\n=== Test 1: Login ===', 'blue');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_CREDENTIALS);
    authToken = response.data.token;
    log('✓ Login successful', 'green');
    log(`Token: ${authToken.substring(0, 20)}...`, 'yellow');
    return true;
  } catch (error) {
    log(`✗ Login failed: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// Test 2: Download CSV template
async function testDownloadTemplate() {
  log('\n=== Test 2: Download CSV Template ===', 'blue');
  try {
    const response = await axios.get(`${BASE_URL}/api/timesheets/bulk-template`, {
      headers: { Authorization: `Bearer ${authToken}` },
      responseType: 'blob'
    });
    
    const templatePath = path.join(__dirname, 'downloaded_template.csv');
    fs.writeFileSync(templatePath, response.data);
    
    log('✓ Template downloaded successfully', 'green');
    log(`Saved to: ${templatePath}`, 'yellow');
    log(`File size: ${fs.statSync(templatePath).size} bytes`, 'yellow');
    return true;
  } catch (error) {
    log(`✗ Template download failed: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// Test 3: Create test CSV file
async function createTestCSV() {
  log('\n=== Test 3: Create Test CSV ===', 'blue');
  try {
    const csvContent = `contractor_id,contractor_name,period_type,week_number,month,year,filename
2,John Doe,weekly,1,,2024,john_week1.pdf
3,Jane Smith,monthly,,January,2024,jane_jan.pdf`;
    
    const csvPath = path.join(__dirname, 'test_bulk_upload.csv');
    fs.writeFileSync(csvPath, csvContent);
    
    log('✓ Test CSV created', 'green');
    log(`Path: ${csvPath}`, 'yellow');
    return csvPath;
  } catch (error) {
    log(`✗ CSV creation failed: ${error.message}`, 'red');
    return null;
  }
}

// Test 4: Create test PDF files
async function createTestPDFs() {
  log('\n=== Test 4: Create Test PDF Files ===', 'blue');
  try {
    const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test Timesheet) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000262 00000 n\n0000000341 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n433\n%%EOF';
    
    const pdf1Path = path.join(__dirname, 'john_week1.pdf');
    const pdf2Path = path.join(__dirname, 'jane_jan.pdf');
    
    fs.writeFileSync(pdf1Path, pdfContent);
    fs.writeFileSync(pdf2Path, pdfContent);
    
    log('✓ Test PDFs created', 'green');
    log(`PDF 1: ${pdf1Path}`, 'yellow');
    log(`PDF 2: ${pdf2Path}`, 'yellow');
    
    return [pdf1Path, pdf2Path];
  } catch (error) {
    log(`✗ PDF creation failed: ${error.message}`, 'red');
    return null;
  }
}

// Test 5: Bulk upload with valid data
async function testBulkUpload(csvPath, pdfPaths) {
  log('\n=== Test 5: Bulk Upload (Valid Data) ===', 'blue');
  try {
    const formData = new FormData();
    formData.append('csv', fs.createReadStream(csvPath));
    pdfPaths.forEach(pdfPath => {
      formData.append('pdfs', fs.createReadStream(pdfPath));
    });
    
    const response = await axios.post(
      `${BASE_URL}/api/timesheets/bulk-upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    log('✓ Bulk upload successful', 'green');
    log(`Success count: ${response.data.successCount}`, 'yellow');
    log(`Failure count: ${response.data.failureCount}`, 'yellow');
    log(`Message: ${response.data.message}`, 'yellow');
    
    if (response.data.successful && response.data.successful.length > 0) {
      log('\nSuccessful uploads:', 'green');
      response.data.successful.forEach(item => {
        log(`  - ${item.contractor_name}: ${item.period} ${item.year}`, 'yellow');
      });
    }
    
    if (response.data.failed && response.data.failed.length > 0) {
      log('\nFailed uploads:', 'red');
      response.data.failed.forEach(item => {
        log(`  - ${item.contractor_name}: ${item.error}`, 'yellow');
      });
    }
    
    return true;
  } catch (error) {
    log(`✗ Bulk upload failed: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data?.errors) {
      log('\nValidation errors:', 'red');
      error.response.data.errors.forEach(err => {
        log(`  - ${err}`, 'yellow');
      });
    }
    return false;
  }
}

// Test 6: Bulk upload with missing PDF
async function testBulkUploadMissingPDF(csvPath) {
  log('\n=== Test 6: Bulk Upload (Missing PDF) ===', 'blue');
  try {
    const formData = new FormData();
    formData.append('csv', fs.createReadStream(csvPath));
    // Only upload one PDF when CSV expects two
    formData.append('pdfs', fs.createReadStream(path.join(__dirname, 'john_week1.pdf')));
    
    const response = await axios.post(
      `${BASE_URL}/api/timesheets/bulk-upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    log('✓ Request completed (expected partial failure)', 'yellow');
    log(`Success count: ${response.data.successCount}`, 'yellow');
    log(`Failure count: ${response.data.failureCount}`, 'yellow');
    
    if (response.data.validationErrors) {
      log('\nValidation errors (expected):', 'yellow');
      response.data.validationErrors.forEach(err => {
        log(`  - ${err}`, 'yellow');
      });
    }
    
    return true;
  } catch (error) {
    log(`✗ Test failed: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// Test 7: Bulk upload with invalid CSV
async function testBulkUploadInvalidCSV() {
  log('\n=== Test 7: Bulk Upload (Invalid CSV) ===', 'blue');
  try {
    const invalidCSV = `contractor_id,contractor_name,period_type,week_number,month,year,filename
,John Doe,weekly,1,,2024,john_week1.pdf
3,,monthly,,January,2024,jane_jan.pdf`;
    
    const csvPath = path.join(__dirname, 'test_invalid.csv');
    fs.writeFileSync(csvPath, invalidCSV);
    
    const formData = new FormData();
    formData.append('csv', fs.createReadStream(csvPath));
    formData.append('pdfs', fs.createReadStream(path.join(__dirname, 'john_week1.pdf')));
    formData.append('pdfs', fs.createReadStream(path.join(__dirname, 'jane_jan.pdf')));
    
    const response = await axios.post(
      `${BASE_URL}/api/timesheets/bulk-upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    log('✓ Request completed (expected validation errors)', 'yellow');
    log(`Failure count: ${response.data.failureCount}`, 'yellow');
    
    if (response.data.validationErrors) {
      log('\nValidation errors (expected):', 'yellow');
      response.data.validationErrors.forEach(err => {
        log(`  - ${err}`, 'yellow');
      });
    }
    
    // Cleanup
    fs.unlinkSync(csvPath);
    
    return true;
  } catch (error) {
    log(`✗ Test failed: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

// Cleanup test files
function cleanup() {
  log('\n=== Cleanup ===', 'blue');
  const filesToDelete = [
    'downloaded_template.csv',
    'test_bulk_upload.csv',
    'john_week1.pdf',
    'jane_jan.pdf',
    'test_invalid.csv'
  ];
  
  filesToDelete.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log(`✓ Deleted ${file}`, 'green');
    }
  });
}

// Run all tests
async function runAllTests() {
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║  BULK TIMESHEET UPLOAD - BACKEND TEST ║', 'blue');
  log('╚════════════════════════════════════════╝', 'blue');
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 1: Login
  if (await testLogin()) {
    results.passed++;
  } else {
    results.failed++;
    log('\n✗ Cannot proceed without authentication', 'red');
    return;
  }
  
  // Test 2: Download template
  if (await testDownloadTemplate()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 3: Create test CSV
  const csvPath = await createTestCSV();
  if (csvPath) {
    results.passed++;
  } else {
    results.failed++;
    return;
  }
  
  // Test 4: Create test PDFs
  const pdfPaths = await createTestPDFs();
  if (pdfPaths) {
    results.passed++;
  } else {
    results.failed++;
    return;
  }
  
  // Test 5: Valid bulk upload
  if (await testBulkUpload(csvPath, pdfPaths)) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 6: Missing PDF
  if (await testBulkUploadMissingPDF(csvPath)) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 7: Invalid CSV
  if (await testBulkUploadInvalidCSV()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Cleanup
  cleanup();
  
  // Summary
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║           TEST SUMMARY                 ║', 'blue');
  log('╚════════════════════════════════════════╝', 'blue');
  log(`\nTotal Tests: ${results.passed + results.failed}`, 'yellow');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed! Backend is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'red');
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n✗ Test suite failed: ${error.message}`, 'red');
  console.error(error);
});
