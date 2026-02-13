const FAQ = require('../Models/FAQ');
const ChatbotService = require('../services/chatbotService');

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.getAll();
    res.json(faqs);
  } catch (error) {
    console.error('❌ Error fetching FAQs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get FAQs by category
exports.getFAQsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const faqs = await FAQ.getByCategory(category);
    res.json(faqs);
  } catch (error) {
    console.error('❌ Error fetching FAQs by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search FAQs
exports.searchFAQs = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const faqs = await FAQ.search(q);
    res.json(faqs);
  } catch (error) {
    console.error('❌ Error searching FAQs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single FAQ by ID
exports.getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.getById(id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    // Get related FAQs
    const relatedFAQs = await ChatbotService.getRelatedFAQs(id);
    
    res.json({
      ...faq,
      relatedFAQs
    });
  } catch (error) {
    console.error('❌ Error fetching FAQ:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get popular FAQs
exports.getPopularFAQs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const faqs = await FAQ.getPopular(limit);
    res.json(faqs);
  } catch (error) {
    console.error('❌ Error fetching popular FAQs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await FAQ.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark FAQ as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    await FAQ.markHelpful(id, userId);
    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('❌ Error marking FAQ as helpful:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark FAQ as not helpful
exports.markNotHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const userId = req.user?.id;
    
    await FAQ.markNotHelpful(id, userId, feedback);
    res.json({ success: true, message: 'Thank you for your feedback! We\'ll work on improving this answer.' });
  } catch (error) {
    console.error('❌ Error marking FAQ as not helpful:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Chatbot query endpoint
exports.chatbotQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const response = await ChatbotService.processQuery(query);
    res.json(response);
  } catch (error) {
    console.error('❌ Error processing chatbot query:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get conversation starters
exports.getConversationStarters = async (req, res) => {
  try {
    const starters = await ChatbotService.getConversationStarters();
    res.json(starters);
  } catch (error) {
    console.error('❌ Error fetching conversation starters:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Provide chatbot feedback
exports.provideChatbotFeedback = async (req, res) => {
  try {
    const { helpful, query, response } = req.body;
    const userId = req.user?.id;
    
    const result = await ChatbotService.provideFeedback(helpful, query, response, userId);
    res.json(result);
  } catch (error) {
    console.error('❌ Error providing chatbot feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get FAQ statistics (admin only)
exports.getFAQStats = async (req, res) => {
  try {
    const stats = await FAQ.getStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching FAQ stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create FAQ (admin only)
exports.createFAQ = async (req, res) => {
  try {
    const { category, question, answer, keywords } = req.body;
    
    if (!category || !question || !answer) {
      return res.status(400).json({ message: 'Category, question, and answer are required' });
    }

    const faq = await FAQ.create(category, question, answer, keywords);
    res.status(201).json(faq);
  } catch (error) {
    console.error('❌ Error creating FAQ:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update FAQ (admin only)
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, question, answer, keywords } = req.body;
    
    if (!category || !question || !answer) {
      return res.status(400).json({ message: 'Category, question, and answer are required' });
    }

    const faq = await FAQ.update(id, category, question, answer, keywords);
    res.json(faq);
  } catch (error) {
    console.error('❌ Error updating FAQ:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete FAQ (admin only)
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    await FAQ.delete(id);
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting FAQ:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
