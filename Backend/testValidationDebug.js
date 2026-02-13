const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5003';

async function testValidation() {
  console.log('========================================');
  console.log('  VALIDATION DEBUG TEST');
  console.log('========================================\n');

  try {
    // Login
    console.log('Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'agencyadmin@test.com',
      password: 'agencyadmin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Create test CSV with empty filename
    console.log('Creating test CSV...');
    const csvContent = `contractor_id,contractor_name,period_type,week_number,month,year,filename
2,Pal,weekly,1,,2024,
2,Pal,monthly,,January,2024,`;
    
    const csvPath = path.join(__dirname, 'test_validation.csv');
    fs.writeFileSync(csvPath, csvContent);
    console.log('CSV Content:');
    console.log(csvContent);
    console.log('\n');

    // Upload
    console.log('Uploading CSV...');
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

      console.log('✅ SUCCESS!');
      console.log(JSON.stringify(uploadResponse.data, null, 2));
    } catch (uploadError) {
      console.log('❌ FAILED');
      console.log('Status:', uploadError.response?.status);
      console.log('Response:', JSON.stringify(uploadError.response?.data, null, 2));
    }

    // Cleanup
    fs.unlinkSync(csvPath);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testValidation();
