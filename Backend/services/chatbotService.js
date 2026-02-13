const FAQ = require('../Models/FAQ');

class ChatbotService {
  /**
   * Process a user query and return relevant FAQs
   */
  static async processQuery(query) {
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        message: 'Please enter a question',
        suggestions: await this.getQuickActions()
      };
    }

    const normalizedQuery = query.toLowerCase().trim();

    // Check for greetings
    if (this.isGreeting(normalizedQuery)) {
      return {
        success: true,
        message: 'Hello! I\'m here to help you with questions about CIS, Umbrella companies, PAYE, EOR, and general payroll queries. What would you like to know?',
        suggestions: await this.getQuickActions()
      };
    }

    // Detect category from query
    const category = this.detectCategory(normalizedQuery);

    // Search for relevant FAQs
    const faqs = await FAQ.search(query);

    if (faqs.length === 0) {
      return {
        success: true,
        message: 'I couldn\'t find an exact answer to your question. Here are some related topics that might help:',
        faqs: category ? await FAQ.getByCategory(category) : await FAQ.getPopular(5),
        suggestions: await this.getQuickActions(),
        noResults: true
      };
    }

    // Return top results
    return {
      success: true,
      message: faqs.length === 1 
        ? 'I found this answer for you:' 
        : `I found ${faqs.length} answers that might help:`,
      faqs: faqs.slice(0, 5), // Return top 5 results
      category: category,
      suggestions: await this.getCategorySuggestions(category)
    };
  }

  /**
   * Check if query is a greeting
   */
  static isGreeting(query) {
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'help'];
    return greetings.some(greeting => query.startsWith(greeting));
  }

  /**
   * Detect category from query keywords
   */
  static detectCategory(query) {
    const categoryKeywords = {
      'CIS': ['cis', 'construction', 'subcontractor', 'gross payment'],
      'Umbrella': ['umbrella', 'umbrella company', 'employment'],
      'PAYE': ['paye', 'pay as you earn', 'tax code', 'national insurance', 'ni'],
      'EOR': ['eor', 'employer of record'],
      'General': ['payslip', 'payment', 'bank', 'p60', 'holiday', 'sick']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => query.includes(keyword))) {
        return category;
      }
    }

    return null;
  }

  /**
   * Get quick action suggestions
   */
  static async getQuickActions() {
    return [
      { text: 'What is CIS?', category: 'CIS' },
      { text: 'How does umbrella company work?', category: 'Umbrella' },
      { text: 'Explain my tax code', category: 'PAYE' },
      { text: 'What is EOR?', category: 'EOR' },
      { text: 'When will I get my payslip?', category: 'General' }
    ];
  }

  /**
   * Get category-specific suggestions
   */
  static async getCategorySuggestions(category) {
    if (!category) {
      return await this.getQuickActions();
    }

    const suggestions = {
      'CIS': [
        { text: 'CIS deduction rates', category: 'CIS' },
        { text: 'How to register for CIS', category: 'CIS' },
        { text: 'Claim back CIS deductions', category: 'CIS' }
      ],
      'Umbrella': [
        { text: 'Umbrella company fees', category: 'Umbrella' },
        { text: 'Umbrella benefits', category: 'Umbrella' },
        { text: 'Claim expenses', category: 'Umbrella' }
      ],
      'PAYE': [
        { text: 'Tax calculation', category: 'PAYE' },
        { text: 'National Insurance rates', category: 'PAYE' },
        { text: 'Tax code meaning', category: 'PAYE' }
      ],
      'EOR': [
        { text: 'EOR vs Umbrella', category: 'EOR' },
        { text: 'EOR costs', category: 'EOR' },
        { text: 'EOR employment rights', category: 'EOR' }
      ],
      'General': [
        { text: 'Update bank details', category: 'General' },
        { text: 'Access P60', category: 'General' },
        { text: 'Report sickness', category: 'General' }
      ]
    };

    return suggestions[category] || await this.getQuickActions();
  }

  /**
   * Get conversation starters
   */
  static async getConversationStarters() {
    return {
      message: 'Welcome! I can help you with:',
      categories: [
        {
          name: 'CIS',
          icon: '🏗️',
          description: 'Construction Industry Scheme questions',
          examples: ['CIS rates', 'Registration', 'Deductions']
        },
        {
          name: 'Umbrella',
          icon: '☂️',
          description: 'Umbrella company information',
          examples: ['How it works', 'Fees', 'Benefits']
        },
        {
          name: 'PAYE',
          icon: '💷',
          description: 'Tax and National Insurance',
          examples: ['Tax codes', 'Calculations', 'NI rates']
        },
        {
          name: 'EOR',
          icon: '🏢',
          description: 'Employer of Record services',
          examples: ['What is EOR', 'Costs', 'Benefits']
        },
        {
          name: 'General',
          icon: '📋',
          description: 'Payroll and general queries',
          examples: ['Payslips', 'Payments', 'Documents']
        }
      ]
    };
  }

  /**
   * Get related FAQs based on current FAQ
   */
  static async getRelatedFAQs(faqId) {
    const faq = await FAQ.getById(faqId);
    if (!faq) {
      return [];
    }

    // Get other FAQs from same category
    const categoryFAQs = await FAQ.getByCategory(faq.category);
    return categoryFAQs.filter(f => f.id !== faqId).slice(0, 3);
  }

  /**
   * Provide feedback on chatbot response
   */
  static async provideFeedback(helpful, query, response, userId = null) {
    // Log feedback for improvement
    console.log('📊 Chatbot Feedback:', {
      helpful,
      query,
      responseCount: response?.faqs?.length || 0,
      userId,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: helpful 
        ? 'Thank you for your feedback! I\'m glad I could help.' 
        : 'Thank you for your feedback. We\'ll work on improving our answers.'
    };
  }

  /**
   * Get chatbot statistics
   */
  static async getStats() {
    const faqStats = await FAQ.getStats();
    return {
      ...faqStats,
      categories: await FAQ.getCategories(),
      popularFAQs: await FAQ.getPopular(5)
    };
  }
}

module.exports = ChatbotService;
