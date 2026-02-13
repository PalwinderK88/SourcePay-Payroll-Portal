import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../utils/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get token from URL
    const urlToken = router.query.token;
    if (urlToken) {
      setToken(urlToken);
    } else if (!router.query.token && router.isReady) {
      setError("Invalid or missing reset token");
    }
  }, [router.query.token, router.isReady]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/reset-password", {
        token,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Password Reset Successful!</h2>
          <p style={styles.successText}>
            Your password has been reset successfully.
          </p>
          <p style={styles.successText}>
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style jsx>{`
        .input-field:focus {
          border-color: #6B7C5D !important;
          box-shadow: 0 0 0 3px rgba(107, 124, 93, 0.1) !important;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(44, 62, 46, 0.3);
        }
      `}</style>

      <div style={styles.formCard}>
        <div style={styles.logoContainer}>
          <img 
            src="/logo.png" 
            alt="SourcePay" 
            style={styles.logo}
          />
        </div>

        <h2 style={styles.title}>Reset Your Password</h2>
        <p style={styles.subtitle}>
          Enter your new password below
        </p>

        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔑</span>
              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={styles.input}
                className="input-field"
                disabled={loading || !token}
              />
            </div>
            <span style={styles.hint}>Minimum 6 characters</span>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔑</span>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={styles.input}
                className="input-field"
                disabled={loading || !token}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(loading || !token ? styles.submitButtonDisabled : {})
            }}
            className="submit-btn"
            disabled={loading || !token}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div style={styles.footer}>
          <a href="/login" style={styles.backLink}>← Back to Login</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #6B7C5D 0%, #556B4A 100%)",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  formCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "48px",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "32px",
  },
  logo: {
    width: "180px",
    height: "auto",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#2C3E2E",
    marginBottom: "8px",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6B7C5D",
    marginBottom: "32px",
    textAlign: "center",
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
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "#fafafa",
  },
  hint: {
    fontSize: "12px",
    color: "#6B7C5D",
    marginTop: "-5px",
  },
  submitButton: {
    width: "100%",
    padding: "16px",
    fontSize: "17px",
    fontWeight: "700",
    color: "#ffffff",
    background: "linear-gradient(135deg, #2C3E2E 0%, #1a2419 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(44, 62, 46, 0.2)",
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    transform: "none !important",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
  },
  backLink: {
    fontSize: "14px",
    color: "#2C3E2E",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.3s",
  },
  successContainer: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "60px 48px",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  successIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#4caf50",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    fontWeight: "700",
    margin: "0 auto 24px",
  },
  successTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2C3E2E",
    marginBottom: "16px",
  },
  successText: {
    fontSize: "16px",
    color: "#6B7C5D",
    marginBottom: "12px",
  },
};
