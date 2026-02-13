import { useState, useEffect } from 'react';

export default function ChatbotDebug() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    console.log('🔍 ChatbotDebug mounted!');
    console.log('🔍 Token exists:', !!token);
    console.log('🔍 Is logged in:', !!token);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '20px',
      background: isLoggedIn ? '#4ade80' : '#ef4444',
      color: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 999999,
      fontSize: '14px',
      fontWeight: 'bold',
      textAlign: 'center',
      minWidth: '200px'
    }}>
      <div style={{ marginBottom: '8px', fontSize: '24px' }}>
        {isLoggedIn ? '✅' : '❌'}
      </div>
      <div>CHATBOT DEBUG</div>
      <div style={{ fontSize: '12px', marginTop: '8px' }}>
        {isLoggedIn ? 'Logged In ✓' : 'Not Logged In ✗'}
      </div>
      <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.9 }}>
        Component Mounted: {mounted ? 'YES' : 'NO'}
      </div>
    </div>
  );
}
