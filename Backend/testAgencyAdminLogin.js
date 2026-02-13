const axios = require('axios');

async function testLogin() {
  console.log('🧪 Testing Agency Admin Login...\n');
  
  try {
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'agencyadmin@test.com',
      password: 'agencyadmin123'
    });

    console.log('✅ Login Successful!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Token:', response.data.token ? 'Generated ✓' : 'Missing ✗');
    console.log('User Data:');
    console.log(JSON.stringify(response.data.user, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (response.data.user.role === 'agency_admin') {
      console.log('✅ Role is correct: agency_admin');
      console.log('✅ Should redirect to: /agency-admin\n');
    } else {
      console.log('⚠️  Role mismatch:', response.data.user.role);
    }

  } catch (error) {
    console.log('❌ Login Failed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.message || error.response.data);
    } else if (error.request) {
      console.log('No response from server');
      console.log('Is the backend running on http://localhost:5001?');
    } else {
      console.log('Error:', error.message);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

console.log('📋 Test Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Backend URL: http://localhost:5001');
console.log('Endpoint: /api/auth/login');
console.log('Email: agencyadmin@test.com');
console.log('Password: agencyadmin123');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

testLogin();
