import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useRouter } from 'next/router';

export default function Signup() {
  const [mode, setMode] = useState('signup'); // 'signup' or 'activate'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check URL parameter for mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    if (modeParam === 'activate') {
      setMode('activate');
    }
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (mode === 'signup' && (!agencyName || agencyName.trim() === '')) {
      setError('Please enter your agency name');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'activate') {
        // Activate account
        const res = await api.post('/api/auth/activate', { 
          email, 
          password
        });
        
        // Save token & user info
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        alert('Account activated successfully! Redirecting to dashboard...');
        router.push('/');
      } else {
        // Regular signup
        await api.post('/api/auth/register', { 
          name, 
          email, 
          password, 
          role: 'contractor',
          agency_name: agencyName.trim()
        });
        alert('Signup successful! Please login with your credentials.');
        router.push('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || `Error ${mode === 'activate' ? 'activating account' : 'signing up'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative Background Elements */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.02); }
        }
        @keyframes slideInLeft {
          from { 
            opacity: 0;
            transform: translateX(-50px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .input-field:focus {
          border-color: #6B7C5D !important;
          box-shadow: 0 0 0 3px rgba(107, 124, 93, 0.1) !important;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(44, 62, 46, 0.3);
        }
        .feature-item-hover:hover {
          transform: translateX(5px);
        }
        .character-container {
          animation: slideInLeft 1s ease-out;
        }
        .character-float {
          animation: bounce 3s ease-in-out infinite;
        }
        .document-float {
          animation: float 2.5s ease-in-out infinite;
        }
        .hand-wave {
          animation: wave 2s ease-in-out infinite;
        }
        .star-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        .mode-tab {
          transition: all 0.3s ease;
        }
        .mode-tab:hover {
          transform: translateY(-2px);
        }
      `}</style>

      {/* Left Side - Branding */}
      <div style={styles.leftPanel}>
        {/* Animated Background Circles */}
        <div style={styles.bgCircle1}></div>
        <div style={styles.bgCircle2}></div>
        
        <div style={styles.brandingContent}>
          <div style={styles.logoContainer}>
            <img 
              src="/logo.png" 
              alt="SourcePay Logo" 
              style={styles.logoImage}
            />
          </div>

          {/* Animated Payroll Character */}
          <div style={styles.characterContainer} className="character-container">
            <svg width="200" height="200" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g className="character-float">
                <circle cx="140" cy="80" r="35" fill="#ffffff" opacity="0.95"/>
                <circle cx="132" cy="75" r="4" fill="#2C3E2E"/>
                <circle cx="148" cy="75" r="4" fill="#2C3E2E"/>
                <path d="M 128 88 Q 140 95 152 88" stroke="#2C3E2E" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <rect x="110" y="115" width="60" height="70" rx="10" fill="#ffffff" opacity="0.95"/>
                <rect x="85" y="125" width="25" height="45" rx="8" fill="#ffffff" opacity="0.95"/>
                <g className="hand-wave" style={{transformOrigin: '195px 140px'}}>
                  <rect x="170" y="125" width="25" height="45" rx="8" fill="#ffffff" opacity="0.95"/>
                  <circle cx="182" cy="115" r="8" fill="#ffffff" opacity="0.95"/>
                </g>
                <rect x="120" y="185" width="20" height="50" rx="8" fill="#ffffff" opacity="0.9"/>
                <rect x="140" y="185" width="20" height="50" rx="8" fill="#ffffff" opacity="0.9"/>
              </g>
              <g className="document-float" style={{transformOrigin: '70px 150px'}}>
                <rect x="45" y="130" width="50" height="60" rx="4" fill="#ffffff" opacity="0.9"/>
                <line x1="55" y1="145" x2="85" y2="145" stroke="#6B7C5D" strokeWidth="2"/>
                <line x1="55" y1="155" x2="85" y2="155" stroke="#6B7C5D" strokeWidth="2"/>
                <line x1="55" y1="165" x2="75" y2="165" stroke="#6B7C5D" strokeWidth="2"/>
                <circle cx="65" cy="180" r="8" fill="#4CAF50" opacity="0.9"/>
                <path d="M 61 180 L 64 183 L 69 176" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <g className="document-float" style={{transformOrigin: '210px 170px', animationDelay: '0.5s'}}>
                <rect x="190" y="150" width="40" height="35" rx="3" fill="#ffffff" opacity="0.9"/>
                <rect x="205" y="145" width="10" height="8" rx="2" fill="#6B7C5D"/>
                <line x1="195" y1="165" x2="225" y2="165" stroke="#6B7C5D" strokeWidth="2"/>
                <circle cx="210" cy="175" r="3" fill="#6B7C5D"/>
              </g>
              <g className="star-sparkle" style={{animationDelay: '0s'}}>
                <path d="M 60 100 L 62 105 L 67 107 L 62 109 L 60 114 L 58 109 L 53 107 L 58 105 Z" fill="#FFD700" opacity="0.8"/>
              </g>
              <g className="star-sparkle" style={{animationDelay: '0.5s'}}>
                <path d="M 220 110 L 222 115 L 227 117 L 222 119 L 220 124 L 218 119 L 213 117 L 218 115 Z" fill="#FFD700" opacity="0.8"/>
              </g>
              <g className="star-sparkle" style={{animationDelay: '1s'}}>
                <path d="M 140 240 L 142 245 L 147 247 L 142 249 L 140 254 L 138 249 L 133 247 L 138 245 Z" fill="#FFD700" opacity="0.8"/>
              </g>
              <g opacity="0.9">
                <circle cx="200" cy="90" r="18" fill="#4CAF50"/>
                <text x="192" y="98" fontSize="20" fill="#ffffff" fontWeight="bold">✓</text>
              </g>
            </svg>
          </div>

          <h1 style={styles.welcomeTitle}>Join Our Team</h1>
          <p style={styles.welcomeSubtitle}>
            {mode === 'activate' 
              ? 'Activate your pre-registered account to get started' 
              : 'Create your account to access the payroll portal'}
          </p>
          <div style={styles.features}>
            <div style={styles.featureItem} className="feature-item-hover">
              <span style={styles.featureIcon}>⚡</span>
              <div>
                <div style={styles.featureText}>Quick {mode === 'activate' ? 'Activation' : 'Registration'}</div>
                <div style={styles.featureSubtext}>Get started in minutes</div>
              </div>
            </div>
            <div style={styles.featureItem} className="feature-item-hover">
              <span style={styles.featureIcon}>🔒</span>
              <div>
                <div style={styles.featureText}>Secure Platform</div>
                <div style={styles.featureSubtext}>Bank-level encryption</div>
              </div>
            </div>
            <div style={styles.featureItem} className="feature-item-hover">
              <span style={styles.featureIcon}>✨</span>
              <div>
                <div style={styles.featureText}>Instant Access</div>
                <div style={styles.featureSubtext}>Start using immediately</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <div style={styles.formHeader}>
            <div style={styles.formLogoContainer}>
              <img 
                src="/logo.png" 
                alt="SourcePay" 
                style={styles.formLogo}
              />
            </div>
            
            {/* Mode Toggle */}
            <div style={styles.modeToggle}>
              <button
                type="button"
                onClick={() => setMode('signup')}
                style={{
                  ...styles.modeTab,
                  ...(mode === 'signup' ? styles.modeTabActive : styles.modeTabInactive)
                }}
                className="mode-tab"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setMode('activate')}
                style={{
                  ...styles.modeTab,
                  ...(mode === 'activate' ? styles.modeTabActive : styles.modeTabInactive)
                }}
                className="mode-tab"
              >
                Activate Account
              </button>
            </div>

            <h2 style={styles.formTitle}>
              {mode === 'activate' ? 'Activate Account' : 'Create Account'}
            </h2>
            <p style={styles.formSubtitle}>
              {mode === 'activate' 
                ? 'Enter your email and create a password' 
                : 'Fill in your details to get started'}
            </p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <span style={styles.errorIcon}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} style={styles.form}>
            {mode === 'signup' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>👤</span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={styles.input}
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                  className="input-field"
                  disabled={loading}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔑</span>
                <input
                  type="password"
                  placeholder={mode === 'activate' ? 'Create your password' : 'Create a strong password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={styles.input}
                  className="input-field"
                  disabled={loading}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔐</span>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={styles.input}
                  className="input-field"
                  disabled={loading}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Agency Name <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🏢</span>
                  <input
                    type="text"
                    placeholder="Enter your agency name"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    required
                    style={styles.input}
                    className="input-field"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div style={styles.termsContainer}>
                <label style={styles.termsLabel}>
                  <input type="checkbox" style={styles.checkbox} required />
                  <span style={styles.termsText}>
                    I agree to the <a href="#" style={styles.termsLink}>Terms of Service</a> and{' '}
                    <a href="#" style={styles.termsLink}>Privacy Policy</a>
                  </span>
                </label>
              </div>
            )}

            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingContent}>
                  <span style={styles.spinner}></span>
                  {mode === 'activate' ? 'Activating...' : 'Creating Account...'}
                </span>
              ) : (
                mode === 'activate' ? 'Activate Account →' : 'Create Account →'
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or</span>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account? <a href="/login" style={styles.loginLink}>Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Oswald', sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg, #6B7C5D 0%, #556B4A 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    position: "relative",
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(107, 124, 93, 0.15) 0%, transparent 70%)",
    top: "-100px",
    right: "-100px",
    animation: "pulse 4s ease-in-out infinite",
  },
  bgCircle2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(107, 124, 93, 0.1) 0%, transparent 70%)",
    bottom: "-50px",
    left: "-50px",
    animation: "pulse 6s ease-in-out infinite",
  },
  brandingContent: {
    maxWidth: "500px",
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: "50px",
    display: "flex",
    justifyContent: "center",
  },
  logoImage: {
    width: "280px",
    height: "auto",
    filter: "brightness(0) invert(1)",
  },
  welcomeTitle: {
    fontSize: "48px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "16px",
    lineHeight: "1.2",
    letterSpacing: "1px",
    textTransform: "uppercase",
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: "18px",
    color: "#a8b5a1",
    marginBottom: "50px",
    lineHeight: "1.6",
    fontWeight: "400",
    textAlign: "center",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    alignItems: "center",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "16px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "all 0.3s ease",
    maxWidth: "400px",
    width: "100%",
  },
  featureIcon: {
    fontSize: "28px",
    minWidth: "28px",
  },
  featureText: {
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "600",
    marginBottom: "4px",
    letterSpacing: "0.5px",
  },
  featureSubtext: {
    color: "#a8b5a1",
    fontSize: "14px",
    fontWeight: "400",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "#ffffff",
  },
  formContainer: {
    width: "100%",
    maxWidth: "460px",
  },
  formHeader: {
    marginBottom: "40px",
    textAlign: "center",
  },
  formLogoContainer: {
    marginBottom: "24px",
    display: "flex",
    justifyContent: "center",
  },
  formLogo: {
    width: "180px",
    height: "auto",
  },
  modeToggle: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    padding: "4px",
    background: "#f3f4f6",
    borderRadius: "10px",
  },
  modeTab: {
    flex: 1,
    padding: "12px 20px",
    fontSize: "15px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  modeTabActive: {
    background: "linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)",
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(44, 62, 46, 0.3)",
  },
  modeTabInactive: {
    background: "transparent",
    color: "#6B7C5D",
  },
  formTitle: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#2C3E2E",
    marginBottom: "8px",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  formSubtitle: {
    fontSize: "16px",
    color: "#6B7C5D",
    fontWeight: "400",
  },
  errorAlert: {
    background: "#fee2e2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "14px 18px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "500",
  },
  errorIcon: {
    fontSize: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2C3E2E",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "16px",
    fontSize: "18px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "15px 16px 15px 48px",
    fontSize: "16px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "'Oswald', sans-serif",
    boxSizing: "border-box",
    background: "#fafafa",
    fontWeight: "400",
  },
  required: {
    color: "#dc2626",
    marginLeft: "4px",
  },
  termsContainer: {
    marginTop: "4px",
  },
  termsLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    marginTop: "2px",
    flexShrink: 0,
    accentColor: "#2C3E2E",
  },
  termsText: {
    fontSize: "14px",
    color: "#6B7C5D",
    lineHeight: "1.5",
  },
  termsLink: {
    color: "#2C3E2E",
    textDecoration: "none",
    fontWeight: "600",
  },
  submitButton: {
    width: "100%",
    padding: "16px",
    fontSize: "17px",
    fontWeight: "600",
    color: "#ffffff",
    background: "linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(44, 62, 46, 0.2)",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none !important",
  },
  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    margin: "24px 0",
  },
  dividerText: {
    padding: "0 16px",
    color: "#9ca3af",
    fontSize: "14px",
    fontWeight: "500",
    background: "#ffffff",
    position: "relative",
    zIndex: 1,
  },
  footer: {
    textAlign: "center",
  },
  footerText: {
    fontSize: "15px",
    color: "#6B7C5D",
  },
  loginLink: {
    color: "#2C3E2E",
    textDecoration: "none",
    fontWeight: "700",
    transition: "color 0.3s",
  },
  characterContainer: {
    marginTop: "20px",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};
