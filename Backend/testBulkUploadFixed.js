const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5003';

async function testBulkUpload() {
  console.log('========================================');
  console.log('  TESTING BULK UPLOAD FUNCTIONALITY');
  console.log('========================================\n');

  try {
    // Step 1: Login as agency admin
    console.log('Step 1: Logging in as agency admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'agencyadmin@test.com',
      password: 'agencyadmin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Create a test CSV file
    console.log('Step 2: Creating test CSV file...');
    const csvContent = `contractor_id,contractor_name,period_type,week_number,month,year,filename
5,Test Contractor,weekly,1,,2024,
5,Test Contractor,monthly,,January,2024,`;
    
    const csvPath = path.join(__dirname, 'test_bulk_upload.csv');
    fs.writeFileSync(csvPath, csvContent);
    console.log('✅ Test CSV created\n');

    // Step 3: Test CSV-only upload (no PDFs)
    console.log('Step 3: Testing CSV-only upload (no PDFs)...');
    const formData = new FormData();
    formData.append('csv', fs.createReadStream(csvPath));

    try {
      const uploadResponse = await axios.post(
        `${API_URL}/api/timesheets/bulk-upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('✅ Upload Response:');
      console.log(JSON.stringify(uploadResponse.data, null, 2));
      console.log('\n');

      if (uploadResponse.data.successCount > 0) {
        console.log('✅ SUCCESS: CSV-only upload works!');
        console.log(`   ${uploadResponse.data.successCount} timesheets uploaded successfully`);
      } else {
        console.log('⚠️  WARNING: Upload completed but no timesheets were successful');
        console.log('   Errors:', uploadResponse.data.validationErrors);
      }
    } catch (uploadError) {
      console.log('❌ Upload failed:');
      console.log('   Status:', uploadError.response?.status);
      console.log('   Message:', uploadError.response?.data?.message);
      console.log('   Errors:', uploadError.response?.data?.errors);
      console.log('   Validation Errors:', uploadError.response?.data?.validationErrors);
    }

    // Cleanup
    fs.unlinkSync(csvPath);
    console.log('\n✅ Test CSV file cleaned up');

    console.log('\n========================================');
    console.log('  TEST COMPLETE');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testBulkUpload();
