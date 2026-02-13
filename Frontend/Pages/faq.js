import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import Navbar from '../Components/Navbar';

export default function FAQPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQs();
    loadCategories();
    
    // Check if there's an ID in the query params
    if (router.query.id) {
      setExpandedFAQ(parseInt(router.query.id));
    }
  }, [router.query.id]);

  const loadFAQs = async () => {
    try {
      const response = await api.get('/api/faqs');
      setFaqs(response.data);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/faqs/categories');
      setCategories(['All', ...response.data]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadFAQs();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/faqs/search?q=${encodeURIComponent(searchQuery)}`);
      setFaqs(response.data);
      setSelectedCategory('All');
    } catch (error) {
      console.error('Error searching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    
    if (category === 'All') {
      loadFAQs();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/faqs/category/${category}`);
      setFaqs(response.data);
    } catch (error) {
      console.error('Error loading category FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (faqId, helpful) => {
    try {
      if (helpful) {
        await api.post(`/api/faqs/${faqId}/helpful`);
      } else {
        await api.post(`/api/faqs/${faqId}/not-helpful`);
      }
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const filteredFAQs = faqs;

  const getCategoryIcon = (category) => {
    const icons = {
      'CIS': '🏗️',
      'Umbrella': '☂️',
      'PAYE': '💷',
      'EOR': '🏢',
      'General': '📋'
    };
    return icons[category] || '❓';
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📚 Frequently Asked Questions</h1>
          <p style={styles.subtitle}>
            Find answers to common questions about CIS, Umbrella companies, PAYE, EOR, and more
          </p>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for answers..."
            style={styles.searchInput}
          />
          <button onClick={handleSearch} style={styles.searchButton}>
            🔍 Search
          </button>
        </div>

        {/* Category Tabs */}
        <div style={styles.categoryTabs}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              style={{
                ...styles.categoryTab,
                ...(selectedCategory === category ? styles.categoryTabActive : {})
              }}
            >
              {category !== 'All' && getCategoryIcon(category)} {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        {loading ? (
          <div style={styles.loading}>Loading FAQs...</div>
        ) : filteredFAQs.length === 0 ? (
          <div style={styles.noResults}>
            <div style={styles.noResultsIcon}>🔍</div>
            <div style={styles.noResultsText}>No FAQs found</div>
            <div style={styles.noResultsSubtext}>
              Try a different search term or browse by category
            </div>
          </div>
        ) : (
          <div style={styles.faqList}>
            {filteredFAQs.map((faq) => (
              <div key={faq.id} style={styles.faqCard}>
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  style={styles.faqHeader}
                >
                  <div style={styles.faqHeaderLeft}>
                    <span style={styles.faqIcon}>{getCategoryIcon(faq.category)}</span>
                    <div>
                      <div style={styles.faqCategory}>{faq.category}</div>
                      <div style={styles.faqQuestion}>{faq.question}</div>
                    </div>
                  </div>
                  <span style={styles.expandIcon}>
                    {expandedFAQ === faq.id ? '−' : '+'}
                  </span>
                </button>

                {expandedFAQ === faq.id && (
                  <div style={styles.faqContent}>
                    <div style={styles.faqAnswer}>{faq.answer}</div>
                    
                    <div style={styles.faqFooter}>
                      <div style={styles.feedbackText}>Was this helpful?</div>
                      <div style={styles.feedbackButtons}>
                        <button
                          onClick={() => handleFeedback(faq.id, true)}
                          style={styles.feedbackButton}
                        >
                          👍 Yes ({faq.helpful_count || 0})
                        </button>
                        <button
                          onClick={() => handleFeedback(faq.id, false)}
                          style={styles.feedbackButton}
                        >
                          👎 No ({faq.not_helpful_count || 0})
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div style={styles.helpSection}>
          <div style={styles.helpTitle}>Still need help?</div>
          <div style={styles.helpText}>
            Can't find what you're looking for? Try our chatbot or contact support.
          </div>
          <div style={styles.helpButtons}>
            <button onClick={() => router.push('/dashboard')} style={styles.helpButton}>
              💬 Chat with us
            </button>
            <button onClick={() => window.location.href = 'mailto:support@sourcepay.com'} style={styles.helpButtonSecondary}>
              📧 Email support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#2C3E2E',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B7C5D',
    maxWidth: '600px',
    margin: '0 auto',
  },
  searchContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
  },
  searchInput: {
    flex: 1,
    padding: '14px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s',
  },
  searchButton: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  categoryTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  categoryTab: {
    padding: '10px 20px',
    background: '#ffffff',
    border: '2px solid #e5e7eb',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7C5D',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  categoryTabActive: {
    background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
    color: '#ffffff',
    borderColor: '#2C3E2E',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '16px',
    color: '#6B7C5D',
  },
  noResults: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  noResultsIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  noResultsText: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2C3E2E',
    marginBottom: '8px',
  },
  noResultsSubtext: {
    fontSize: '14px',
    color: '#6B7C5D',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '40px',
  },
  faqCard: {
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    transition: 'all 0.3s',
  },
  faqHeader: {
    width: '100%',
    padding: '20px',
    background: 'transparent',
    border: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    textAlign: 'left',
  },
  faqHeaderLeft: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    flex: 1,
  },
  faqIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  faqCategory: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7C5D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  faqQuestion: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2C3E2E',
    lineHeight: '1.5',
  },
  expandIcon: {
    fontSize: '24px',
    color: '#2C3E2E',
    fontWeight: '300',
    flexShrink: 0,
  },
  faqContent: {
    padding: '0 20px 20px 20px',
    borderTop: '1px solid #f3f4f6',
  },
  faqAnswer: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.7',
    marginTop: '16px',
    marginBottom: '20px',
    paddingLeft: '40px',
  },
  faqFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingLeft: '40px',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6',
  },
  feedbackText: {
    fontSize: '14px',
    color: '#6B7C5D',
    fontWeight: '500',
  },
  feedbackButtons: {
    display: 'flex',
    gap: '8px',
  },
  feedbackButton: {
    padding: '6px 14px',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  helpSection: {
    background: 'linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    color: '#ffffff',
  },
  helpTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  helpText: {
    fontSize: '15px',
    opacity: 0.9,
    marginBottom: '24px',
  },
  helpButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  helpButton: {
    padding: '12px 24px',
    background: '#ffffff',
    color: '#2C3E2E',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  helpButtonSecondary: {
    padding: '12px 24px',
    background: 'transparent',
    color: '#ffffff',
    border: '2px solid #ffffff',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
};
