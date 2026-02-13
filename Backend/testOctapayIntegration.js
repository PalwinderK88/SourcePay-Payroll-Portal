const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001';
const API_KEY = 'your-secure-api-key-here'; // Replace with your actual API key

console.log('🧪 Testing OctaPay Integration\n');

// Test 1: Health Check
async function testHealthCheck() {
  console.log('1️⃣ Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/api/octapay/health`);
    console.log('✅ Health Check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Upload Single Payslip (Mock)
async function testSingleUpload() {
  console.log('\n2️⃣ Testing Single Payslip Upload...');
  
  // Create a mock PDF file for testing
  const mockPdfPath = path.join(__dirname, 'test-payslip.pdf');
  if (!fs.existsSync(mockPdfPath)) {
    // Create a simple text file as mock PDF
    fs.writeFileSync(mockPdfPath, 'Mock PDF content for testing');
    console.log('📄 Created mock PDF file');
  }

  const form = new FormData();
  form.append('employee_email', 'it@sourcepay.co.uk'); // Use existing contractor email
  form.append('period_type', 'monthly');
  form.append('month', 'January');
  form.append('year', '2025');
  form.append('amount', '5000.00');
  form.append('holiday_pay', '500.00');
  form.append('sick_pay', '300.00');
  form.append('expenses', '150.00');
  form.append('file', fs.createReadStream(mockPdfPath));

  try {
    const response = await axios.post(
      `${BASE_URL}/api/octapay/upload-payslip`,
      form,
      {
        headers: {
          'X-API-Key': API_KEY,
          ...form.getHeaders()
        }
      }
    );
    console.log('✅ Upload Success:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Upload Failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 3: Test Invalid API Key
async function testInvalidApiKey() {
  console.log('\n3️⃣ Testing Invalid API Key...');
  
  const mockPdfPath = path.join(__dirname, 'test-payslip.pdf');
  const form = new FormData();
  form.append('employee_email', 'it@sourcepay.co.uk');
  form.append('period_type', 'monthly');
  form.append('month', 'February');
  form.append('year', '2025');
  form.append('file', fs.createReadStream(mockPdfPath));

  try {
    const response = await axios.post(
      `${BASE_URL}/api/octapay/upload-payslip`,
      form,
      {
        headers: {
          'X-API-Key': 'invalid-key',
          ...form.getHeaders()
        }
      }
    );
    console.log('❌ Should have failed with invalid key');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected invalid API key:', error.response.data);
      return true;
    }
    console.error('❌ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Test Non-existent Employee
async function testNonExistentEmployee() {
  console.log('\n4️⃣ Testing Non-existent Employee...');
  
  const mockPdfPath = path.join(__dirname, 'test-payslip.pdf');
  const form = new FormData();
  form.append('employee_email', 'nonexistent@example.com');
  form.append('period_type', 'monthly');
  form.append('month', 'March');
  form.append('year', '2025');
  form.append('file', fs.createReadStream(mockPdfPath));

  try {
    const response = await axios.post(
      `${BASE_URL}/api/octapay/upload-payslip`,
      form,
      {
        headers: {
          'X-API-Key': API_KEY,
          ...form.getHeaders()
        }
      }
    );
    console.log('❌ Should have failed with 404');
    return false;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Correctly returned 404 for non-existent employee:', error.response.data);
      return true;
    }
    console.error('❌ Unexpected error:', error.response?.data || error.message);
    return false;
  }
}

// Test 5: Test Bulk Upload
async function testBulkUpload() {
  console.log('\n5️⃣ Testing Bulk Upload...');
  
  // Create mock PDF as base64
  const mockPdfContent = Buffer.from('Mock PDF content for bulk testing').toString('base64');
  
  const payload = {
    payslips: [
      {
        employee_email: 'it@sourcepay.co.uk',
        period_type: 'monthly',
        month: 'April',
        year: 2025,
        amount: 4500.00,
        holiday_pay: 450.00,
        file_base64: mockPdfContent,
        file_name: 'april-payslip.pdf'
      },
      {
        employee_email: 'it@sourcepay.co.uk',
        period_type: 'weekly',
        week_number: 1,
        year: 2025,
        amount: 1200.00,
        file_base64: mockPdfContent,
        file_name: 'week1-payslip.pdf'
      }
    ]
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/api/octapay/bulk-upload`,
      payload,
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Bulk Upload Success:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Bulk Upload Failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════\n');
  
  const results = {
    healthCheck: await testHealthCheck(),
    singleUpload: await testSingleUpload(),
    invalidApiKey: await testInvalidApiKey(),
    nonExistentEmployee: await testNonExistentEmployee(),
    bulkUpload: await testBulkUpload()
  };

  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 Test Results Summary:\n');
  console.log(`Health Check:           ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Single Upload:          ${results.singleUpload ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Invalid API Key:        ${results.invalidApiKey ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Non-existent Employee:  ${results.nonExistentEmployee ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Bulk Upload:            ${results.bulkUpload ? '✅ PASS' : '❌ FAIL'}`);
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`Total: ${passedTests}/${totalTests} tests passed`);
  console.log('═══════════════════════════════════════════════════\n');

  // Cleanup
  const mockPdfPath = path.join(__dirname, 'test-payslip.pdf');
  if (fs.existsSync(mockPdfPath)) {
    fs.unlinkSync(mockPdfPath);
    console.log('🧹 Cleaned up mock PDF file');
  }
}

// Run tests
runAllTests().catch(console.error);
