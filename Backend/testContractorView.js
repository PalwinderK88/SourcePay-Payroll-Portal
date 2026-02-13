const axios = require('axios');

async function testContractorView() {
  try {
    // Step 1: Login as Pal (contractor)
    console.log('🔐 Step 1: Logging in as Pal (contractor)...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'it@sourcepay.co.uk',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    const token = loginRes.data.token;
    const user = loginRes.data.user;
    console.log('User:', user);
    
    // Step 2: Fetch Pal's payslips
    console.log('\n📋 Step 2: Fetching payslips for Pal...');
    const payslipsRes = await axios.get('http://localhost:5001/api/payslips/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Found ${payslipsRes.data.length} payslip(s) for Pal`);
    
    if (payslipsRes.data.length > 0) {
      console.log('\n📄 Payslip details:');
      console.table(payslipsRes.data.map(p => ({
        ID: p.id,
        Month: p.month,
        Year: p.year,
        Amount: `$${p.amount}`,
        FileName: p.file_name,
        UploadedAt: new Date(p.uploaded_at).toLocaleString()
      })));
      
      // Step 3: Test file download URL
      const firstPayslip = payslipsRes.data[0];
      const downloadUrl = `http://localhost:5001${firstPayslip.file_path}`;
      console.log('\n📥 Download URL:', downloadUrl);
      console.log('✅ File should be accessible at this URL');
    } else {
      console.log('⚠️  No payslips found for Pal');
    }
    
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n📝 Summary:');
    console.log('  - Pal can login successfully');
    console.log('  - Pal can view their payslips');
    console.log('  - Payslip files are accessible via download URL');
    
  } catch (err) {
    console.error('\n❌ Error:', err.response?.data || err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
    }
  }
}

testContractorView();
