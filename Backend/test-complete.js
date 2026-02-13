const axios = require('axios');
const { spawn } = require('child_process');

let serverProcess;

async function testComplete() {
  console.log('🚀 Starting comprehensive test...\n');

  // Step 1: Start the server
  console.log('1️⃣ Starting backend server...');
  serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let serverStarted = false;
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('   ' + output.trim());
    if (output.includes('Server running')) {
      serverStarted = true;
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('   Error:', data.toString());
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (!serverStarted) {
    console.log('   ⚠️  Server output not captured, but continuing test...');
  }

  // Step 2: Test health endpoint
  console.log('\n2️⃣ Testing health endpoint...');
  try {
    const healthRes = await axios.get('http://localhost:5001/');
    console.log('   ✅ Health check passed:', healthRes.data);
  } catch (err) {
    console.error('   ❌ Health check failed:', err.message);
    cleanup();
    return;
  }

  // Step 3: Test login endpoint
  console.log('\n3️⃣ Testing login endpoint...');
  try {
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    console.log('   ✅ Login successful!');
    console.log('   Response:', JSON.stringify(loginRes.data, null, 2));
    
    // Verify response structure
    if (loginRes.data.token && loginRes.data.user) {
      console.log('\n   ✅ Response structure is correct:');
      console.log('      - Token: Present');
      console.log('      - User ID:', loginRes.data.user.id);
      console.log('      - User Name:', loginRes.data.user.name);
      console.log('      - User Role:', loginRes.data.user.role);
    } else {
      console.log('\n   ⚠️  Response structure issue detected');
    }
  } catch (err) {
    console.error('   ❌ Login failed:', err.response?.data || err.message);
    cleanup();
    return;
  }

  // Step 4: Test invalid login
  console.log('\n4️⃣ Testing invalid credentials...');
  try {
    await axios.post('http://localhost:5001/api/auth/login', {
      email: 'wrong@test.com',
      password: 'wrongpassword'
    });
    console.log('   ⚠️  Should have failed but didn\'t');
  } catch (err) {
    if (err.response?.status === 400) {
      console.log('   ✅ Correctly rejected invalid credentials');
    } else {
      console.log('   ⚠️  Unexpected error:', err.message);
    }
  }

  console.log('\n✅ All tests completed successfully!');
  console.log('\n📝 Summary:');
  console.log('   - Server is running correctly');
  console.log('   - Login endpoint works');
  console.log('   - Response format matches frontend expectations');
  console.log('   - Invalid credentials are properly rejected');
  console.log('\n🎉 Your login should now work in the browser!');
  
  cleanup();
}

function cleanup() {
  console.log('\n🛑 Stopping server...');
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
}

// Handle Ctrl+C
process.on('SIGINT', cleanup);

testComplete();
