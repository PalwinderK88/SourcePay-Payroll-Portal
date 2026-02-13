const express = require('express');
const router = express.Router();
const faqController = require('../Controllers/faqController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/faqs', faqController.getAllFAQs);
router.get('/faqs/category/:category', faqController.getFAQsByCategory);
router.get('/faqs/search', faqController.searchFAQs);
router.get('/faqs/popular', faqController.getPopularFAQs);
router.get('/faqs/categories', faqController.getCategories);
router.get('/faqs/:id', faqController.getFAQById);

// Chatbot routes (no authentication required for basic queries)
router.post('/chatbot/query', faqController.chatbotQuery);
router.get('/chatbot/starters', faqController.getConversationStarters);

// Authenticated routes (feedback requires login)
router.post('/faqs/:id/helpful', authenticateToken, faqController.markHelpful);
router.post('/faqs/:id/not-helpful', authenticateToken, faqController.markNotHelpful);
router.post('/chatbot/feedback', authenticateToken, faqController.provideChatbotFeedback);

// Admin routes (FAQ management)
router.get('/faqs/stats/all', authenticateToken, isAdmin, faqController.getFAQStats);
router.post('/faqs', authenticateToken, isAdmin, faqController.createFAQ);
router.put('/faqs/:id', authenticateToken, isAdmin, faqController.updateFAQ);
router.delete('/faqs/:id', authenticateToken, isAdmin, faqController.deleteFAQ);

module.exports = router;
