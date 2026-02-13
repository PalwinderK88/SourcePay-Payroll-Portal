const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    console.log('✅ Login response:', res.data);
  } catch (err) {
    console.error('❌ Login error:', err.response?.data || err.message);
  }
}

testLogin();
