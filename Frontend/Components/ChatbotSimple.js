import { useState, useEffect } from 'react';

export default function ChatbotSimple() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('🤖 Chatbot component mounted!');
    console.log('Token:', localStorage.getItem('token'));
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'red',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        cursor: 'pointer',
        fontSize: '28px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
      onClick={() => alert('Chatbot clicked!')}
      title="Test Chatbot"
    >
      💬
    </div>
  );
}
