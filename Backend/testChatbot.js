const FAQ = require('./Models/FAQ');
const ChatbotService = require('./services/chatbotService');

async function testChatbot() {
  try {
    console.log('🧪 Testing Chatbot...\n');
    
    // Test 1: Check if FAQs exist
    console.log('1. Checking FAQs in database...');
    const allFAQs = await FAQ.getAll();
    console.log(`   ✅ Found ${allFAQs.length} FAQs\n`);
    
    if (allFAQs.length === 0) {
      console.log('   ⚠️  No FAQs found! Running seed script...');
      const { exec } = require('child_process');
      exec('node seedFAQs.js', (error, stdout, stderr) => {
        if (error) {
          console.error(`   ❌ Error seeding FAQs: ${error.message}`);
          return;
        }
        console.log(`   ✅ FAQs seeded successfully`);
      });
      return;
    }
    
    // Test 2: Test greeting
    console.log('2. Testing greeting...');
    const greetingResponse = await ChatbotService.processQuery('hello');
    console.log(`   ✅ Response: ${greetingResponse.message}\n`);
    
    // Test 3: Test search
    console.log('3. Testing search query...');
    const searchResponse = await ChatbotService.processQuery('What is CIS?');
    console.log(`   ✅ Found ${searchResponse.faqs?.length || 0} FAQs\n`);
    
    // Test 4: Test conversation starters
    console.log('4. Testing conversation starters...');
    const starters = await ChatbotService.getConversationStarters();
    console.log(`   ✅ ${starters.categories.length} categories available\n`);
    
    console.log('✅ All chatbot tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testChatbot();
