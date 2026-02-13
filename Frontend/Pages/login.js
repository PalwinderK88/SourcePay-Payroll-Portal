import { useState } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("contractor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotModal(true);
    setResetMessage("");
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage("");

    try {
      await api.post("/api/auth/forgot-password", { email: resetEmail });
      setResetMessage("success");
      setTimeout(() => {
        setShowForgotModal(false);
        setResetEmail("");
        setResetMessage("");
      }, 3000);
    } catch (err) {
      setResetMessage(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });

      console.log("✅ Login response:", res.data);

      // Save token & user info in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Get user's actual role
      const userRole = res.data.user.role;
      
      // Show warning if selected role doesn't match, but still allow login
      if (userRole !== selectedRole) {
        console.warn(`Selected role (${selectedRole}) doesn't match account role (${userRole}). Redirecting to correct dashboard.`);
      }

      // Redirect based on user's actual role (not selected role)
      if (userRole === 'admin') {
        router.push("/admin");
      } else if (userRole === 'agency_admin') {
        router.push("/agency-admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed");
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
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
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
        .coin-rotate {
          animation: rotate 4s linear infinite;
        }
        .calculator-wiggle {
          animation: wiggle 2s ease-in-out infinite;
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
              {/* Character Body */}
              <g className="character-float">
                {/* Head */}
                <circle cx="140" cy="80" r="35" fill="#ffffff" opacity="0.95"/>
                <circle cx="132" cy="75" r="4" fill="#2C3E2E"/>
                <circle cx="148" cy="75" r="4" fill="#2C3E2E"/>
                <path d="M 130 88 Q 140 93 150 88" stroke="#2C3E2E" strokeWidth="2" fill="none" strokeLinecap="round"/>
                
                {/* Body */}
                <rect x="110" y="115" width="60" height="70" rx="10" fill="#ffffff" opacity="0.95"/>
                
                {/* Arms */}
                <rect x="85" y="125" width="25" height="45" rx="8" fill="#ffffff" opacity="0.95"/>
                <rect x="170" y="125" width="25" height="45" rx="8" fill="#ffffff" opacity="0.95"/>
                
                {/* Legs */}
                <rect x="120" y="185" width="20" height="50" rx="8" fill="#ffffff" opacity="0.9"/>
                <rect x="140" y="185" width="20" height="50" rx="8" fill="#ffffff" opacity="0.9"/>
              </g>

              {/* Payslip Document */}
              <g className="document-float" style={{transformOrigin: '70px 140px'}}>
                <rect x="50" y="120" width="40" height="50" rx="3" fill="#ffffff" opacity="0.9"/>
                <line x1="58" y1="130" x2="82" y2="130" stroke="#6B7C5D" strokeWidth="2"/>
                <line x1="58" y1="140" x2="82" y2="140" stroke="#6B7C5D" strokeWidth="2"/>
                <line x1="58" y1="150" x2="75" y2="150" stroke="#6B7C5D" strokeWidth="2"/>
                <text x="65" y="165" fontSize="8" fill="#2C3E2E" fontWeight="bold">PAY</text>
              </g>

              {/* Calculator */}
              <g className="calculator-wiggle" style={{transformOrigin: '210px 160px'}}>
                <rect x="190" y="140" width="40" height="50" rx="4" fill="#ffffff" opacity="0.9"/>
                <rect x="195" y="145" width="30" height="12" rx="2" fill="#6B7C5D"/>
                <circle cx="200" cy="165" r="3" fill="#6B7C5D"/>
                <circle cx="210" cy="165" r="3" fill="#6B7C5D"/>
                <circle cx="220" cy="165" r="3" fill="#6B7C5D"/>
                <circle cx="200" cy="175" r="3" fill="#6B7C5D"/>
                <circle cx="210" cy="175" r="3" fill="#6B7C5D"/>
                <circle cx="220" cy="175" r="3" fill="#6B7C5D"/>
              </g>

              {/* Money Coins */}
              <g className="coin-rotate" style={{transformOrigin: '140px 220px'}}>
                <circle cx="130" cy="220" r="12" fill="#FFD700" opacity="0.9"/>
                <text x="126" y="225" fontSize="12" fill="#2C3E2E" fontWeight="bold">$</text>
                <circle cx="150" cy="220" r="12" fill="#FFD700" opacity="0.9"/>
                <text x="146" y="225" fontSize="12" fill="#2C3E2E" fontWeight="bold">$</text>
              </g>

              {/* Checkmark */}
              <g opacity="0.9">
                <circle cx="200" cy="100" r="15" fill="#4CAF50"/>
                <path d="M 193 100 L 198 105 L 207 93" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            </svg>
          </div>

          <h1 style={styles.welcomeTitle}>Welcome Back</h1>
          <p style={styles.welcomeSubtitle}>
            Access your payroll portal securely and manage your finances with ease
          </p>
          <div style={styles.features}>
            <div style={styles.featureItem} className="feature-item-hover">
              <span style={styles.featureIcon}>🔒</span>
              <div>
                <div style={styles.featureText}>Secure Access</div>
                <div style={styles.featureSubtext}>Bank-level encryption</div>
              </div>
            </div>
            <div style={styles.featureItem} className="feature-item-hover">
              <span style={styles.featureIcon}>⚡</span>
              <div>
                <div style={styles.featureText}>Real-time Updates</div>
                <div style={styles.featureSubtext}>Instant notifications</div>
              </div>
            </div>
            <div style={styles.featureItem} className="feature-item-hover">
              <span style={styles.featureIcon}>🌐</span>
              <div>
                <div style={styles.featureText}>24/7 Availability</div>
                <div style={styles.featureSubtext}>Access anytime, anywhere</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
            <h2 style={styles.formTitle}>Sign In</h2>
            <p style={styles.formSubtitle}>Enter your credentials to access your account</p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <span style={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>I am signing in as</label>
              <div style={styles.roleSelector}>
                <button
                  type="button"
                  onClick={() => setSelectedRole("contractor")}
                  style={{
                    ...styles.roleButton,
                    ...(selectedRole === "contractor" ? styles.roleButtonActive : {})
                  }}
                >
                  <span style={styles.roleIcon}>👤</span>
                  <span style={styles.roleText}>Contractor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("agency_admin")}
                  style={{
                    ...styles.roleButton,
                    ...(selectedRole === "agency_admin" ? styles.roleButtonActive : {})
                  }}
                >
                  <span style={styles.roleIcon}>🏢</span>
                  <span style={styles.roleText}>Agency Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  style={{
                    ...styles.roleButton,
                    ...(selectedRole === "admin" ? styles.roleButtonActive : {})
                  }}
                >
                  <span style={styles.roleIcon}>⚙️</span>
                  <span style={styles.roleText}>System Admin</span>
                </button>
              </div>
            </div>

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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.input}
                  className="input-field"
                  disabled={loading}
                />
              </div>
            </div>

            <div style={styles.rememberForgot}>
              <label style={styles.rememberLabel}>
                <input type="checkbox" style={styles.checkbox} />
                <span style={styles.rememberText}>Remember me</span>
              </label>
              <a href="#" onClick={handleForgotPassword} style={styles.forgotLink}>Forgot password?</a>
            </div>

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
                  Signing in...
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or</span>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don't have an account? <a href="/signup" style={styles.signupLink}>Sign up</a>
            </p>
            <p style={styles.footerText}>
              Already registered? <a href="/signup?mode=activate" style={styles.signupLink}>Activate your account</a>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={styles.modalOverlay} onClick={() => setShowForgotModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Reset Password</h3>
              <button 
                onClick={() => setShowForgotModal(false)} 
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            <p style={styles.modalDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetMessage === "success" ? (
              <div style={styles.successMessage}>
                <span style={styles.successIcon}>✓</span>
                <div>
                  <div style={styles.successTitle}>Email Sent!</div>
                  <div style={styles.successText}>
                    Check your inbox for password reset instructions.
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetRequest} style={styles.modalForm}>
                {resetMessage && resetMessage !== "success" && (
                  <div style={styles.errorAlert}>
                    <span style={styles.errorIcon}>⚠️</span>
                    <span>{resetMessage}</span>
                  </div>
                )}
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputWrapper}>
                    <span style={styles.inputIcon}>📧</span>
                    <input
                      type="email"
                      placeholder="your.email@company.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      style={styles.input}
                      className="input-field"
                      disabled={resetLoading}
                    />
                  </div>
                </div>

                <div style={styles.modalButtons}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    style={styles.cancelButton}
                    disabled={resetLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...styles.resetButton,
                      ...(resetLoading ? styles.submitButtonDisabled : {})
                    }}
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
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
    width: "350px",
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
    width: "220px",
    height: "auto",
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
  rememberForgot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#2C3E2E",
  },
  rememberText: {
    fontSize: "14px",
    color: "#6B7C5D",
    fontWeight: "500",
  },
  forgotLink: {
    fontSize: "14px",
    color: "#2C3E2E",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.3s",
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
  signupLink: {
    color: "#2C3E2E",
    textDecoration: "none",
    fontWeight: "700",
    transition: "color 0.3s",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "480px",
    width: "90%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    animation: "slideIn 0.3s ease-out",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  modalTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2C3E2E",
    margin: 0,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#6B7C5D",
    cursor: "pointer",
    padding: "4px 8px",
    lineHeight: 1,
    transition: "color 0.3s",
  },
  modalDescription: {
    fontSize: "15px",
    color: "#6B7C5D",
    marginBottom: "24px",
    lineHeight: "1.5",
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  modalButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  cancelButton: {
    flex: 1,
    padding: "14px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#6B7C5D",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  resetButton: {
    flex: 1,
    padding: "14px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#ffffff",
    background: "linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    background: "#e8f5e9",
    borderRadius: "10px",
    border: "1px solid #a5d6a7",
  },
  successIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#4caf50",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "700",
    flexShrink: 0,
  },
  successTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: "4px",
  },
  successText: {
    fontSize: "14px",
    color: "#4caf50",
  },
  characterContainer: {
    marginTop: "20px",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  roleSelector: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  roleButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 12px",
    background: "#f9fafb",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Oswald', sans-serif",
  },
  roleButtonActive: {
    background: "linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)",
    borderColor: "#2C3E2E",
    color: "#ffffff",
  },
  roleIcon: {
    fontSize: "28px",
    marginBottom: "8px",
  },
  roleText: {
    fontSize: "13px",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: "0.5px",
  },
};
