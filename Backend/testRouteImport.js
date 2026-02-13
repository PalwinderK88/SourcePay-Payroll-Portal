console.log('Testing route imports...\n');

try {
  const faqController = require('./Controllers/faqController');
  console.log('✅ FAQ Controller imported successfully');
  console.log('Exported functions:', Object.keys(faqController));
  
  const { authenticateToken, isAdmin } = require('./middleware/auth');
  console.log('✅ Auth middleware imported successfully');
  console.log('authenticateToken type:', typeof authenticateToken);
  console.log('isAdmin type:', typeof isAdmin);
  
  // Test the specific line that's failing
  console.log('\nTesting specific route handlers:');
  console.log('Line 7 - getAllFAQs:', typeof faqController.getAllFAQs);
  console.log('Line 8 - getFAQsByCategory:', typeof faqController.getFAQsByCategory);
  console.log('Line 9 - searchFAQs:', typeof faqController.searchFAQs);
  console.log('Line 10 - getPopularFAQs:', typeof faqController.getPopularFAQs);
  console.log('Line 11 - getCategories:', typeof faqController.getCategories);
  console.log('Line 12 - getFAQById:', typeof faqController.getFAQById);
  console.log('Line 15 - chatbotQuery:', typeof faqController.chatbotQuery);
  console.log('Line 16 - getConversationStarters:', typeof faqController.getConversationStarters);
  console.log('Line 19 - markHelpful:', typeof faqController.markHelpful);
  console.log('Line 20 - markNotHelpful:', typeof faqController.markNotHelpful);
  console.log('Line 21 - provideChatbotFeedback:', typeof faqController.provideChatbotFeedback);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}
