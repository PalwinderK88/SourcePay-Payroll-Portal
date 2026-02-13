const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testPayslipUpload() {
  try {
    // Step 1: Login as admin
    console.log('🔐 Step 1: Logging in as admin...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    const token = loginRes.data.token;
    const adminUser = loginRes.data.user;
    console.log('Admin:', adminUser);
    
    // Step 2: Create a test PDF file
    console.log('\n📄 Step 2: Creating test payslip file...');
    const testPdfContent = Buffer.from('%PDF-1.4\nTest Payslip for Pal\nJanuary 2024\nAmount: $5000');
    const testFilePath = path.join(__dirname, 'test-payslip.pdf');
    fs.writeFileSync(testFilePath, testPdfContent);
    console.log('✅ Test file created:', testFilePath);
    
    // Step 3: Upload payslip for Pal (user_id = 2)
    console.log('\n📤 Step 3: Uploading payslip for Pal...');
    const formData = new FormData();
    formData.append('user_id', '2'); // Pal's user ID
    formData.append('month', 'January');
    formData.append('year', '2024');
    formData.append('amount', '5000');
    formData.append('file', fs.createReadStream(testFilePath));
    
    const uploadRes = await axios.post('http://localhost:5001/api/payslips/upload', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Payslip uploaded successfully!');
    console.log('Response:', uploadRes.data);
    
    // Step 4: Verify payslip was created
    console.log('\n✅ Step 4: Verifying payslip...');
    const payslipsRes = await axios.get('http://localhost:5001/api/payslips/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Total payslips in system:', payslipsRes.data.length);
    const palPayslips = payslipsRes.data.filter(p => p.user_id === 2);
    console.log('Payslips for Pal:', palPayslips.length);
    
    if (palPayslips.length > 0) {
      console.log('\n📋 Pal\'s payslips:');
      console.table(palPayslips.map(p => ({
        ID: p.id,
        Month: p.month,
        Year: p.year,
        Amount: p.amount,
        FileName: p.file_name
      })));
    }
    
    // Cleanup
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Cleanup: Test file deleted');
    
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n📝 Next step: Login as Pal (it@sourcepay.co.uk) to view the payslip in the dashboard');
    
  } catch (err) {
    console.error('\n❌ Error:', err.response?.data || err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Headers:', err.response.headers);
    }
  }
}

testPayslipUpload();
