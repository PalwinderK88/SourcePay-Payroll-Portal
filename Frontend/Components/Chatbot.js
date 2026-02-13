import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [starters, setStarters] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef(null);

  // TEMPORARY: Always show chatbot for debugging
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 Chatbot - Token exists:', !!token);
    console.log('🔍 Chatbot - Full token:', token);
    // Temporarily set to true to always show chatbot
    setIsLoggedIn(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadConversationStarters();
    }
  }, [isOpen]);

  const loadConversationStarters = async () => {
    try {
      const response = await api.get('/api/chatbot/starters');
      setStarters(response.data);
      setMessages([{
        type: 'bot',
        content: response.data.message,
        categories: response.data.categories,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error loading starters:', error);
    }
  };

  const handleSend = async (query = null) => {
    const messageText = query || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/chatbot/query', { query: messageText });
      
      // Add bot response
      const botMessage = {
        type: 'bot',
        content: response.data.message,
        faqs: response.data.faqs,
        suggestions: response.data.suggestions,
        noResults: response.data.noResults,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (text) => {
    handleSend(text);
  };

  const handleCategoryClick = (category) => {
    handleSend(`Tell me about ${category.name}`);
  };

  const handleFAQClick = (faq) => {
    window.open(`/faq?id=${faq.id}`, '_blank');
  };

  // TEMPORARY: Comment out login check for debugging
  // if (!isLoggedIn) {
  //   console.log('🚫 Chatbot hidden - user not logged in');
  //   return null;
  // }
  console.log('✅ Chatbot rendering - isLoggedIn:', isLoggedIn);

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={styles.chatButton}
          title="Need help? Chat with us!"
        >
          <span style={styles.chatIcon}>💬</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <div style={styles.headerTitle}>💬 Help & Support</div>
              <div style={styles.headerSubtitle}>Ask me anything about payroll</div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeButton}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div key={index} style={styles.messageWrapper}>
                {message.type === 'bot' ? (
                  <div style={styles.botMessage}>
                    <div style={styles.botAvatar}>🤖</div>
                    <div style={styles.botContent}>
                      <div style={styles.messageText}>{message.content}</div>
                      
                      {/* Category Cards */}
                      {message.categories && (
                        <div style={styles.categoriesGrid}>
                          {message.categories.map((cat, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleCategoryClick(cat)}
                              style={styles.categoryCard}
                            >
                              <div style={styles.categoryIcon}>{cat.icon}</div>
                              <div style={styles.categoryName}>{cat.name}</div>
                              <div style={styles.categoryDesc}>{cat.description}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* FAQ Results */}
                      {message.faqs && message.faqs.length > 0 && (
                        <div style={styles.faqList}>
                          {message.faqs.map((faq, idx) => (
                            <div key={idx} style={styles.faqItem} onClick={() => handleFAQClick(faq)}>
                              <div style={styles.faqQuestion}>❓ {faq.question}</div>
                              <div style={styles.faqAnswer}>{faq.answer.substring(0, 150)}...</div>
                              <div style={styles.faqLink}>Read more →</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div style={styles.suggestions}>
                          {message.suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickAction(sug.text)}
                              style={styles.suggestionButton}
                            >
                              {sug.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={styles.userMessage}>
                    <div style={styles.userContent}>{message.content}</div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={styles.botMessage}>
                <div style={styles.botAvatar}>🤖</div>
                <div style={styles.loadingDots}>
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              style={styles.input}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              style={{
                ...styles.sendButton,
                opacity: !inputValue.trim() || isLoading ? 0.5 : 1
              }}
            >
              ➤
            </button>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <a href="/faq" target="_blank" style={styles.footerLink}>
              📚 Browse all FAQs
            </a>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  chatButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3d5a3d 0%, #2d4a2d 100%)',
    border: 'none',
    boxShadow: '0 4px 12px rgba(61, 90, 61, 0.4)',
    cursor: 'pointer',
    display: 'flex !important',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
    zIndex: 99999,
    visibility: 'visible',
    opacity: 1,
  },
  chatIcon: {
    fontSize: '28px',
  },
  chatWindow: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '400px',
    height: '600px',
    maxHeight: 'calc(100vh - 48px)',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 99999,
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #3d5a3d 0%, #2d4a2d 100%)',
    color: '#ffffff',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: '12px',
    opacity: 0.9,
    marginTop: '4px',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  messageWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  botMessage: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  botAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
  botContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  messageText: {
    background: '#f3f4f6',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  userMessage: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  userContent: {
    background: 'linear-gradient(135deg, #3d5a3d 0%, #2d4a2d 100%)',
    color: '#ffffff',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '14px',
    maxWidth: '80%',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  categoryCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  categoryIcon: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  categoryName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#3d5a3d',
    marginBottom: '4px',
  },
  categoryDesc: {
    fontSize: '11px',
    color: '#6B7C5D',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  faqItem: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  faqQuestion: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#3d5a3d',
    marginBottom: '6px',
  },
  faqAnswer: {
    fontSize: '12px',
    color: '#6B7C5D',
    marginBottom: '6px',
  },
  faqLink: {
    fontSize: '12px',
    color: '#3d5a3d',
    fontWeight: '500',
  },
  suggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  suggestionButton: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  loadingDots: {
    display: 'flex',
    gap: '4px',
    padding: '12px',
  },
  inputContainer: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  sendButton: {
    background: 'linear-gradient(135deg, #3d5a3d 0%, #2d4a2d 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    width: '44px',
    height: '44px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  footerLink: {
    fontSize: '13px',
    color: '#3d5a3d',
    textDecoration: 'none',
    fontWeight: '500',
  },
};
