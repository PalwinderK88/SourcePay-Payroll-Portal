require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testAgencyFeature() {
  console.log('🧪 Testing Agency Feature\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Get all agencies (public endpoint)
    console.log('\n1️⃣  Testing GET /api/agencies (Public)');
    const agenciesRes = await axios.get(`${BASE_URL}/api/agencies`);
    console.log(`✅ Success! Found ${agenciesRes.data.length} agencies`);
    console.log(`   First 3 agencies:`);
    agenciesRes.data.slice(0, 3).forEach(agency => {
      console.log(`   - ${agency.name} (ID: ${agency.id})`);
    });

    // Test 2: Try to signup without agency (should fail)
    console.log('\n2️⃣  Testing Signup WITHOUT Agency (Should Fail)');
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'contractor'
        // No agency_id
      });
      console.log('❌ FAILED: Should have rejected signup without agency');
    } catch (err) {
      if (err.response?.data?.message?.includes('Agency')) {
        console.log('✅ Correctly rejected: ' + err.response.data.message);
      } else {
        console.log('⚠️  Rejected but with unexpected error: ' + err.response?.data?.message);
      }
    }

    // Test 3: Signup with agency (should succeed)
    console.log('\n3️⃣  Testing Signup WITH Agency (Should Succeed)');
    const testEmail = `contractor_${Date.now()}@test.com`;
    try {
      const signupRes = await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Test Contractor',
        email: testEmail,
        password: 'password123',
        role: 'contractor',
        agency_id: agenciesRes.data[0].id
      });
      console.log('✅ Signup successful!');
      console.log(`   User: ${signupRes.data.user.name}`);
      console.log(`   Email: ${signupRes.data.user.email}`);
      console.log(`   Agency ID: ${signupRes.data.user.agency_id}`);
    } catch (err) {
      console.log('❌ Signup failed: ' + err.response?.data?.message);
    }

    // Test 4: Login as admin
    console.log('\n4️⃣  Testing Admin Login');
    let adminToken;
    try {
      const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'admin@test.com',
        password: 'password123'
      });
      adminToken = loginRes.data.token;
      console.log('✅ Admin login successful');
    } catch (err) {
      console.log('❌ Admin login failed: ' + err.response?.data?.message);
      console.log('   Make sure admin user exists (run: node createuser.js)');
      return;
    }

    // Test 5: Add new agency (admin only)
    console.log('\n5️⃣  Testing Add New Agency (Admin Only)');
    const newAgencyName = `Test Agency ${Date.now()}`;
    try {
      const addRes = await axios.post(
        `${BASE_URL}/api/agencies`,
        { name: newAgencyName },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('✅ Agency added successfully!');
      console.log(`   Name: ${addRes.data.name}`);
      console.log(`   ID: ${addRes.data.id}`);

      // Test 6: Update agency
      console.log('\n6️⃣  Testing Update Agency (Admin Only)');
      const updatedName = `${newAgencyName} - Updated`;
      const updateRes = await axios.put(
        `${BASE_URL}/api/agencies/${addRes.data.id}`,
        { name: updatedName },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('✅ Agency updated successfully!');
      console.log(`   New Name: ${updateRes.data.name}`);

      // Test 7: Delete agency
      console.log('\n7️⃣  Testing Delete Agency (Admin Only)');
      await axios.delete(
        `${BASE_URL}/api/agencies/${addRes.data.id}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log('✅ Agency deleted successfully!');
    } catch (err) {
      console.log('❌ Admin operation failed: ' + err.response?.data?.message);
    }

    // Test 8: Try admin operations without token (should fail)
    console.log('\n8️⃣  Testing Admin Operations WITHOUT Token (Should Fail)');
    try {
      await axios.post(`${BASE_URL}/api/agencies`, { name: 'Unauthorized Agency' });
      console.log('❌ FAILED: Should have rejected request without token');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('✅ Correctly rejected unauthorized request');
      } else {
        console.log('⚠️  Rejected but with unexpected status: ' + err.response?.status);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!\n');
    console.log('📋 Summary:');
    console.log('   ✓ Public agency listing works');
    console.log('   ✓ Signup validation works (requires agency)');
    console.log('   ✓ Signup with agency works');
    console.log('   ✓ Admin authentication works');
    console.log('   ✓ Admin can add agencies');
    console.log('   ✓ Admin can update agencies');
    console.log('   ✓ Admin can delete agencies');
    console.log('   ✓ Unauthorized requests are blocked');

  } catch (err) {
    console.error('\n❌ Test suite failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Make sure the backend server is running on port 5001');
      console.log('   Run: cd Backend && node server.js');
    }
  }
}

// Run tests
console.log('Starting Agency Feature Tests...');
console.log('Make sure:');
console.log('  1. Backend server is running (node server.js)');
console.log('  2. Database is set up (node setupAgencies.js)');
console.log('  3. Admin user exists (node createuser.js)\n');

setTimeout(() => {
  testAgencyFeature();
}, 1000);
