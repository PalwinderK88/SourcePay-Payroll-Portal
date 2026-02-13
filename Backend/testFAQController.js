const faqController = require('./Controllers/faqController');

console.log('Testing FAQ Controller exports...\n');

const functions = [
  'getAllFAQs',
  'getFAQsByCategory',
  'searchFAQs',
  'getFAQById',
  'getPopularFAQs',
  'getCategories',
  'markHelpful',
  'markNotHelpful',
  'chatbotQuery',
  'getConversationStarters',
  'provideChatbotFeedback',
  'getFAQStats',
  'createFAQ',
  'updateFAQ',
  'deleteFAQ'
];

functions.forEach(funcName => {
  if (typeof faqController[funcName] === 'function') {
    console.log(`✅ ${funcName} - OK`);
  } else {
    console.log(`❌ ${funcName} - MISSING or NOT A FUNCTION (type: ${typeof faqController[funcName]})`);
  }
});

console.log('\nAll exports:', Object.keys(faqController));
