// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/api";
import ChatBot from "../components/ChatBot";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.message === 'Login successful') {
        login(response.user);
        if (response.user.role === "student") navigate("/student");
        else if (response.user.role === "admin") navigate("/admin");
        else if (response.user.role === "maintenance") navigate("/maintenance");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please check if backend is running.");
      console.error("Login error:", error);
    }

    setIsLoading(false);
  };

  const fillCredentials = (role) => {
    if (role === "student") { setEmail("student@hostel.com"); setPassword("student123"); }
    else if (role === "admin") { setEmail("admin@hostel.com"); setPassword("admin123"); }
    else if (role === "maintenance") { setEmail("staff@hostel.com"); setPassword("staff123"); }
    setError("");
  };

  return (
    <div style={styles.page}>

      {/* ── Left Panel ── */}
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logoCircle}>🏠</div>
          <h1 style={styles.brandTitle}>Hostel Complaint System</h1>
          <p style={styles.brandSubtitle}>
            A smart, digital way to raise, track, and resolve hostel
            complaints — faster than ever.
          </p>

          {/* Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <span style={styles.statNumber}>3</span>
              <span style={styles.statLabel}>Roles</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statNumber}>5</span>
              <span style={styles.statLabel}>Statuses</span>
            </div>
            <div style={styles.statBox}>
              <span style={styles.statNumber}>24/7</span>
              <span style={styles.statLabel}>Access</span>
            </div>
          </div>

          {/* Role list */}
          <div style={styles.roleList}>
            <div style={styles.roleItem}>
              <span style={styles.roleIcon}>🎓</span>
              <div>
                <strong>Student</strong>
                <p style={styles.roleDesc}>Raise and track complaints</p>
              </div>
            </div>
            <div style={styles.roleItem}>
              <span style={styles.roleIcon}>🛡️</span>
              <div>
                <strong>Admin / Warden</strong>
                <p style={styles.roleDesc}>Validate and assign complaints</p>
              </div>
            </div>
            <div style={styles.roleItem}>
              <span style={styles.roleIcon}>🔧</span>
              <div>
                <strong>Maintenance Staff</strong>
                <p style={styles.roleDesc}>Resolve assigned complaints</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Welcome Back</h2>
          <p style={styles.formSubtitle}>Sign in to your portal</p>

          {/* Quick Login */}
          <div style={styles.quickLoginSection}>
            <p style={styles.quickLoginLabel}>⚡ Quick Login (for testing)</p>
            <div style={styles.quickLoginButtons}>
              <button
                style={{ ...styles.quickBtn, backgroundColor: "#e0e7ff", color: "#4338ca" }}
                onClick={() => fillCredentials("student")} type="button"
              >
                🎓 Student
              </button>
              <button
                style={{ ...styles.quickBtn, backgroundColor: "#fee2e2", color: "#dc2626" }}
                onClick={() => fillCredentials("admin")} type="button"
              >
                🛡️ Admin
              </button>
              <button
                style={{ ...styles.quickBtn, backgroundColor: "#dcfce7", color: "#16a34a" }}
                onClick={() => fillCredentials("maintenance")} type="button"
              >
                🔧 Staff
              </button>
            </div>
          </div>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or enter manually</span>
            <span style={styles.dividerLine}></span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="you@hostel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            {error && <div style={styles.errorBox}>⚠️ {error}</div>}
            <button
              type="submit"
              style={{
                ...styles.loginButton,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          {/* Hint box */}
          <div style={styles.hintBox}>
            <p style={styles.hintTitle}>🔑 Test Credentials</p>
            <p style={styles.hintRow}><strong>Student:</strong> student@hostel.com / student123</p>
            <p style={styles.hintRow}><strong>Admin:</strong> admin@hostel.com / admin123</p>
            <p style={styles.hintRow}><strong>Staff:</strong> staff@hostel.com / staff123</p>
          </div>
        </div>
      </div>

      {/* ── AI Chatbot (dark blue for guest) ── */}
      <ChatBot />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #1a8fe3 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px", color: "white",
  },
  brandContent: { maxWidth: "420px" },
  logoCircle: { fontSize: "52px", marginBottom: "20px", display: "block" },
  brandTitle: { fontSize: "32px", fontWeight: "800", marginBottom: "14px", lineHeight: "1.2", letterSpacing: "-0.5px" },
  brandSubtitle: { fontSize: "15px", opacity: 0.85, lineHeight: "1.7", marginBottom: "36px" },
  statsRow: { display: "flex", gap: "16px", marginBottom: "36px" },
  statBox: {
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px",
    padding: "14px 20px", textAlign: "center", flex: 1,
    display: "flex", flexDirection: "column", gap: "4px",
  },
  statNumber: { fontSize: "22px", fontWeight: "800" },
  statLabel: { fontSize: "11px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" },
  roleList: { display: "flex", flexDirection: "column", gap: "16px" },
  roleItem: {
    display: "flex", alignItems: "center", gap: "14px",
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px",
  },
  roleIcon: { fontSize: "24px" },
  roleDesc: { fontSize: "12px", opacity: 0.75, margin: "2px 0 0 0" },
  rightPanel: {
    width: "480px", backgroundColor: "#f8fafc",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 32px",
  },
  formCard: {
    width: "100%", backgroundColor: "white", borderRadius: "20px",
    padding: "36px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  formTitle: { fontSize: "26px", fontWeight: "800", color: "#1e293b", marginBottom: "6px" },
  formSubtitle: { fontSize: "14px", color: "#64748b", marginBottom: "24px" },
  quickLoginSection: { marginBottom: "16px" },
  quickLoginLabel: { fontSize: "12px", color: "#64748b", marginBottom: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  quickLoginButtons: { display: "flex", gap: "10px" },
  quickBtn: { flex: 1, padding: "10px 8px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  divider: { display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" },
  dividerLine: { flex: 1, height: "1px", backgroundColor: "#e2e8f0", display: "block" },
  dividerText: { fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" },
  fieldGroup: { marginBottom: "18px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#1e293b",
    outline: "none", boxSizing: "border-box", backgroundColor: "#f8fafc",
  },
  errorBox: {
    backgroundColor: "#fef2f2", border: "1px solid #fecaca",
    color: "#dc2626", borderRadius: "8px", padding: "10px 14px",
    fontSize: "13px", marginBottom: "16px",
  },
  loginButton: {
    width: "100%", padding: "14px", backgroundColor: "#1e3a5f",
    color: "white", border: "none", borderRadius: "10px",
    fontSize: "15px", fontWeight: "700", letterSpacing: "0.3px", marginTop: "4px",
  },
  hintBox: {
    marginTop: "20px", backgroundColor: "#f1f5f9", borderRadius: "10px",
    padding: "14px 16px", borderLeft: "3px solid #3b82f6",
  },
  hintTitle: { fontSize: "12px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" },
  hintRow: { fontSize: "12px", color: "#475569", margin: "3px 0" },
};

export default Login;