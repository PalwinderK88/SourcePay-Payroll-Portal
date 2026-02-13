const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');

const dbPath = path.join(__dirname, 'payroll.db');
const db = new sqlite3.Database(dbPath);

console.log('🧪 Testing Agency Admin Contractors Feature\n');

// Step 1: Check database
console.log('📊 Step 1: Checking database...');
db.all('SELECT id, name, email, role, agency_name FROM users', [], async (err, users) => {
  if (err) {
    console.error('❌ Database error:', err);
    db.close();
    return;
  }

  console.log('\n👥 All users in database:');
  console.table(users);

  const agencyAdmin = users.find(u => u.email === 'agencyadmin@test.com');
  const contractors = users.filter(u => u.role === 'contractor');

  console.log('\n🔑 Agency Admin:');
  console.log('  Name:', agencyAdmin?.name);
  console.log('  Agency:', agencyAdmin?.agency_name);

  console.log('\n👷 Contractors:');
  contractors.forEach(c => {
    console.log(`  - ${c.name} (${c.email}) - Agency: ${c.agency_name}`);
  });

  const matchingContractors = contractors.filter(c => c.agency_name === agencyAdmin?.agency_name);
  console.log('\n✅ Contractors matching agency admin agency:', matchingContractors.length);
  
  if (matchingContractors.length > 0) {
    console.log('   Expected contractors to show:', matchingContractors.map(c => c.name).join(', '));
  } else {
    console.log('   ⚠️  No contractors match! This is why they don\'t show up.');
  }

  // Step 2: Test API endpoint
  console.log('\n\n📡 Step 2: Testing API endpoint...');
  console.log('   Note: This requires the backend server to be running on port 5001');
  
  try {
    // First login to get token
    console.log('   Logging in as agency admin...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'agencyadmin@test.com',
      password: 'agencyadmin123'
    });
    
    const token = loginRes.data.token;
    console.log('   ✅ Login successful');

    // Then fetch users
    console.log('   Fetching /api/users with agency admin token...');
    const usersRes = await axios.get('http://localhost:5001/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n📋 API Response:');
    console.log('   Status:', usersRes.status);
    console.log('   Data:', JSON.stringify(usersRes.data, null, 2));
    console.log('\n   Number of users returned:', usersRes.data.length);
    
    const apiContractors = usersRes.data.filter(u => u.role === 'contractor');
    console.log('   Number of contractors:', apiContractors.length);
    
    if (apiContractors.length > 0) {
      console.log('   ✅ SUCCESS! API is returning contractors:');
      apiContractors.forEach(c => {
        console.log(`      - ${c.name} (${c.email})`);
      });
    } else {
      console.log('   ❌ PROBLEM! API is not returning any contractors');
    }

  } catch (apiErr) {
    if (apiErr.code === 'ECONNREFUSED') {
      console.log('   ⚠️  Backend server is not running on port 5001');
      console.log('   Please start it with: cd Backend && npm run dev');
    } else {
      console.log('   ❌ API Error:', apiErr.response?.data || apiErr.message);
    }
  }

  db.close();
  console.log('\n✅ Test complete!');
});
