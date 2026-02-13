require('dotenv').config();
const User = require('./models/user');

async function createTestUser() {
  try {
    const user = await User.create('Admin', 'admin@test.com', 'password123', 'admin');
    console.log('✅ User created successfully:');
    console.log(user);
  } catch (err) {
    console.error('❌ Error creating user:', err);
  } finally {
    process.exit();
  }
}

createTestUser();