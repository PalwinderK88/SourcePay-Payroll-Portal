require('dotenv').config();
const { sendWelcomeEmail } = require('./services/emailService');

async function testEmail() {
  console.log('🧪 Testing Email Service...\n');
  
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Email credentials not configured!');
    console.log('\nPlease set up your .env file with:');
    console.log('  EMAIL_HOST=smtp.gmail.com');
    console.log('  EMAIL_PORT=587');
    console.log('  EMAIL_USER=your-email@gmail.com');
    console.log('  EMAIL_PASSWORD=your-app-password');
    console.log('\nSee EMAIL_SETUP.md for detailed instructions.');
    process.exit(1);
  }

  console.log('📧 Email Configuration:');
  console.log(`  Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
  console.log(`  Port: ${process.env.EMAIL_PORT || '587'}`);
  console.log(`  User: ${process.env.EMAIL_USER}`);
  console.log(`  Password: ${process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET'}`);
  console.log('');

  // Test email
  const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
  const testName = 'Test User';

  console.log(`📤 Sending test welcome email to: ${testEmail}`);
  console.log('⏳ Please wait...\n');

  const result = await sendWelcomeEmail(testEmail, testName);

  if (result.success) {
    console.log('✅ SUCCESS! Welcome email sent successfully!');
    console.log(`📬 Message ID: ${result.messageId}`);
    console.log('\n📥 Check your inbox (and spam folder) for the welcome email.');
    console.log('\nThe email includes:');
    console.log('  - SourcePay branding');
    console.log('  - Personalized greeting');
    console.log('  - Feature highlights');
    console.log('  - Getting started guide');
    console.log('  - Call-to-action button');
  } else {
    console.log('❌ FAILED to send email!');
    console.log(`Error: ${result.error}`);
    console.log('\nCommon issues:');
    console.log('  1. Gmail: Make sure you\'re using an App Password (not your regular password)');
    console.log('  2. Check if 2-Factor Authentication is enabled on your Gmail account');
    console.log('  3. Verify EMAIL_HOST and EMAIL_PORT are correct');
    console.log('  4. Check if your firewall is blocking port 587');
    console.log('\nSee EMAIL_SETUP.md for troubleshooting steps.');
  }

  process.exit(result.success ? 0 : 1);
}

testEmail();
