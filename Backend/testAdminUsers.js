const axios = require('axios');

async function testAdminAccess() {
  try {
    // Step 1: Login as admin
    console.log('🔐 Step 1: Logging in as admin...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', loginRes.data.token.substring(0, 20) + '...');
    console.log('User:', loginRes.data.user);
    
    const token = loginRes.data.token;
    
    // Step 2: Fetch all users
    console.log('\n👥 Step 2: Fetching all users...');
    const usersRes = await axios.get('http://localhost:5001/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Users fetched successfully!');
    console.log('Total users:', usersRes.data.length);
    console.log('\nUsers list:');
    console.table(usersRes.data.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role
    })));
    
    // Step 3: Check if Pal is in the list
    const pal = usersRes.data.find(u => u.email === 'it@sourcepay.co.uk');
    if (pal) {
      console.log('\n✅ Found contractor "Pal" (it@sourcepay.co.uk)');
      console.log('Details:', pal);
    } else {
      console.log('\n❌ Contractor "Pal" not found in users list');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

testAdminAccess();
