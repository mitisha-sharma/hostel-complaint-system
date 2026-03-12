// src/pages/RaiseComplaint.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { complaintAPI } from "../api/api";
import Navbar from "../components/Navbar";

function RaiseComplaint() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: "", description: "", priority: "Medium", notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [proceedAnyway, setProceedAnyway] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));

    // Run duplicate detection when category or description changes
    if (field === "category" || field === "description") {
      const updatedForm = { ...form, [field]: value };
      detectDuplicates(updatedForm);
    }
  };

  // ── Duplicate Detection Logic ──────────────────────────────────
  const detectDuplicates = (currentForm) => {
    if (!currentForm.category && !currentForm.description) {
      setDuplicates([]);
      setShowDuplicateWarning(false);
      return;
    }

    const found = complaints.filter((c) => {
      // Same student, same category, not rejected
      const sameCategory = currentForm.category &&
        c.category === currentForm.category &&
        c.student_id === currentUser.id &&
        c.status !== "Rejected" &&
        c.status !== "Resolved" &&
        c.status !== "Closed";

      // Similar description — check if 3+ words match
      const descWords = currentForm.description.toLowerCase().split(" ").filter(w => w.length > 3);
      const existingWords = c.description.toLowerCase();
      const wordMatches = descWords.filter(w => existingWords.includes(w)).length;
      const similarDesc = wordMatches >= 2;

      return sameCategory || (similarDesc && c.student_id === currentUser.id);
    });

    setDuplicates(found);
    setShowDuplicateWarning(found.length > 0 && !proceedAnyway);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.category) newErrors.category = "Please select a category.";
    if (!form.description || form.description.trim().length < 10)
      newErrors.description = "Description must be at least 10 characters.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // If duplicates found and user hasn't confirmed, show warning
    if (duplicates.length > 0 && !proceedAnyway) {
      setShowDuplicateWarning(true);
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newComplaint = {
      complaint_id: complaints.length + 1,
      category: form.category,
      description: form.description,
      priority: form.priority,
      status: "Raised",
      date: new Date().toISOString().split("T")[0],
      student_id: currentUser.id,
      student_name: currentUser.name,
      room_no: currentUser.room_no,
      staff_id: null,
      staff_name: null,
      resolution_notes: "",
    };

    complaints.push(newComplaint);
    setSubmitted(true);
  };

  // ── Success Screen ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.successContainer}>
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Complaint Submitted!</h2>
            <p style={styles.successText}>
              Your complaint has been registered. The admin will review it shortly.
            </p>
            <div style={styles.successDetails}>
              <p><strong>Category:</strong> {form.category}</p>
              <p><strong>Priority:</strong> {form.priority}</p>
              <p><strong>Status:</strong> Raised</p>
              <p><strong>Date:</strong> {new Date().toISOString().split("T")[0]}</p>
            </div>
            <button style={styles.backBtn} onClick={() => navigate("/student")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.pageHeader}>
          <button style={styles.backLink} onClick={() => navigate("/student")}>
            ← Back
          </button>
          <h1 style={styles.pageTitle}>Raise a Complaint</h1>
          <p style={styles.pageSubtitle}>
            Fill in the details below. Be as descriptive as possible.
          </p>
        </div>

        {/* ── Duplicate Warning Banner ── */}
        {showDuplicateWarning && !proceedAnyway && (
          <div style={dupStyles.warningBox}>
            <div style={dupStyles.warningHeader}>
              <span style={dupStyles.warningIcon}>⚠️</span>
              <div>
                <p style={dupStyles.warningTitle}>
                  Similar Complaint Already Exists!
                </p>
                <p style={dupStyles.warningSubtitle}>
                  We found {duplicates.length} existing complaint(s) that may be similar to yours.
                  Please review before submitting.
                </p>
              </div>
            </div>

            {/* Show matching complaints */}
            <div style={dupStyles.matchList}>
              {duplicates.map((d) => (
                <div key={d.complaint_id} style={dupStyles.matchItem}>
                  <div style={dupStyles.matchLeft}>
                    <span style={dupStyles.matchId}>#{d.complaint_id}</span>
                    <div>
                      <p style={dupStyles.matchCategory}>
                        {d.category} — {d.priority} Priority
                      </p>
                      <p style={dupStyles.matchDesc}>{d.description}</p>
                    </div>
                  </div>
                  <span style={getStatusStyle(d.status)}>{d.status}</span>
                </div>
              ))}
            </div>

            <div style={dupStyles.warningActions}>
              <button
                style={dupStyles.dismissBtn}
                onClick={() => {
                  setProceedAnyway(true);
                  setShowDuplicateWarning(false);
                }}
              >
                It's different — Submit Anyway
              </button>
              <button
                style={dupStyles.viewBtn}
                onClick={() => navigate("/student")}
              >
                View My Existing Complaints →
              </button>
            </div>
          </div>
        )}

        {/* Proceeded anyway — show small notice */}
        {proceedAnyway && duplicates.length > 0 && (
          <div style={dupStyles.proceedNotice}>
            ℹ️ You confirmed this is a different issue from your existing complaints.
          </div>
        )}

        {/* Form Card */}
        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>

            {/* Category */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Category <span style={styles.required}>*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                style={{ ...styles.input, borderColor: errors.category ? "#ef4444" : "#e2e8f0" }}
              >
                <option value="">-- Select a Category --</option>
                <option value="Electrical">⚡ Electrical</option>
                <option value="Plumbing">🚿 Plumbing</option>
                <option value="Carpentry">🪚 Carpentry</option>
                <option value="Cleaning">🧹 Cleaning</option>
                <option value="Internet">📶 Internet</option>
                <option value="Other">📌 Other</option>
              </select>
              {errors.category && <p style={styles.errorText}>⚠️ {errors.category}</p>}
            </div>

            {/* Priority */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Priority</label>
              <div style={styles.priorityRow}>
                {["Low", "Medium", "High"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleChange("priority", p)}
                    style={{
                      ...styles.priorityBtn,
                      ...(form.priority === p ? getPriorityActiveStyle(p) : {}),
                    }}
                  >
                    {p === "High" ? "🔴" : p === "Medium" ? "🟡" : "🟢"} {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Description <span style={styles.required}>*</span>
              </label>
              <textarea
                placeholder="Describe the issue in detail. Include location, since when the issue exists, etc."
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={5}
                style={{
                  ...styles.input, resize: "vertical",
                  borderColor: errors.description ? "#ef4444" : "#e2e8f0",
                }}
              />
              <div style={styles.charCount}>
                {form.description.length} characters
                {form.description.length < 10 && form.description.length > 0 && (
                  <span style={{ color: "#ef4444" }}> (minimum 10)</span>
                )}
              </div>
              {errors.description && <p style={styles.errorText}>⚠️ {errors.description}</p>}
            </div>

            {/* Additional Notes */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Additional Notes{" "}
                <span style={styles.optional}>(optional)</span>
              </label>
              <textarea
                placeholder="Any extra information, preferred time for inspection, etc."
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                style={{ ...styles.input, resize: "vertical" }}
              />
            </div>

            {/* Info box */}
            <div style={styles.infoBox}>
              📋 <strong>Room:</strong> {currentUser.room_no} &nbsp;|&nbsp;
              📅 <strong>Date:</strong> {new Date().toISOString().split("T")[0]}
              {duplicates.length > 0 && !proceedAnyway && (
                <span style={{ color: "#f59e0b", marginLeft: "12px", fontWeight: "700" }}>
                  ⚠️ {duplicates.length} similar complaint(s) found
                </span>
              )}
            </div>

            <div style={styles.buttonRow}>
              <button type="button" style={styles.cancelBtn} onClick={() => navigate("/student")}>
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn}>
                {duplicates.length > 0 && !proceedAnyway
                  ? "⚠️ Check Duplicates First"
                  : "Submit Complaint →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusStyle(status) {
  const base = { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" };
  const colors = {
    Raised: { backgroundColor: "#e0e7ff", color: "#4338ca" },
    Assigned: { backgroundColor: "#fef3c7", color: "#d97706" },
    "In Progress": { backgroundColor: "#dbeafe", color: "#1d4ed8" },
    Resolved: { backgroundColor: "#dcfce7", color: "#16a34a" },
    Closed: { backgroundColor: "#f1f5f9", color: "#475569" },
    Rejected: { backgroundColor: "#fee2e2", color: "#dc2626" },
  };
  return { ...base, ...(colors[status] || base) };
}

function getPriorityActiveStyle(priority) {
  const map = {
    High: { backgroundColor: "#fee2e2", color: "#dc2626", borderColor: "#dc2626" },
    Medium: { backgroundColor: "#fef9c3", color: "#b45309", borderColor: "#b45309" },
    Low: { backgroundColor: "#dcfce7", color: "#16a34a", borderColor: "#16a34a" },
  };
  return map[priority] || {};
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  container: { maxWidth: "720px", margin: "0 auto", padding: "32px 24px" },
  pageHeader: { marginBottom: "24px" },
  backLink: { background: "none", border: "none", color: "#4f46e5", fontSize: "14px", fontWeight: "600", cursor: "pointer", padding: 0, marginBottom: "12px", display: "block" },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#1e293b", margin: 0 },
  pageSubtitle: { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  formCard: { backgroundColor: "white", borderRadius: "16px", padding: "36px", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" },
  fieldGroup: { marginBottom: "24px" },
  label: { display: "block", fontSize: "14px", fontWeight: "700", color: "#374151", marginBottom: "8px" },
  required: { color: "#ef4444" },
  optional: { color: "#9ca3af", fontWeight: "400", fontSize: "12px" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#1e293b", outline: "none", boxSizing: "border-box", backgroundColor: "#f8fafc", fontFamily: "inherit" },
  charCount: { fontSize: "12px", color: "#9ca3af", marginTop: "4px", textAlign: "right" },
  errorText: { color: "#ef4444", fontSize: "12px", marginTop: "6px" },
  priorityRow: { display: "flex", gap: "12px" },
  priorityBtn: { flex: 1, padding: "10px", borderRadius: "8px", border: "1.5px solid #e2e8f0", backgroundColor: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "#374151" },
  infoBox: { backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#475569", marginBottom: "24px" },
  buttonRow: { display: "flex", gap: "12px", justifyContent: "flex-end" },
  cancelBtn: { padding: "12px 24px", borderRadius: "10px", border: "1.5px solid #e2e8f0", backgroundColor: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "#374151" },
  submitBtn: { padding: "12px 28px", borderRadius: "10px", border: "none", backgroundColor: "#4f46e5", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  successContainer: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "24px" },
  successCard: { backgroundColor: "white", borderRadius: "20px", padding: "48px", textAlign: "center", maxWidth: "460px", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  successIcon: { fontSize: "56px", marginBottom: "16px" },
  successTitle: { fontSize: "24px", fontWeight: "800", color: "#1e293b", marginBottom: "12px" },
  successText: { fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "24px" },
  successDetails: { backgroundColor: "#f8fafc", borderRadius: "10px", padding: "16px", textAlign: "left", fontSize: "14px", color: "#374151", lineHeight: "2", marginBottom: "24px" },
  backBtn: { backgroundColor: "#4f46e5", color: "white", border: "none", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
};

const dupStyles = {
  warningBox: {
    backgroundColor: "#fffbeb", border: "2px solid #f59e0b",
    borderRadius: "14px", padding: "20px 24px", marginBottom: "20px",
  },
  warningHeader: { display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "16px" },
  warningIcon: { fontSize: "28px", flexShrink: 0 },
  warningTitle: { fontSize: "16px", fontWeight: "800", color: "#92400e", margin: 0 },
  warningSubtitle: { fontSize: "13px", color: "#b45309", marginTop: "4px" },
  matchList: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" },
  matchItem: {
    backgroundColor: "white", borderRadius: "10px", padding: "12px 16px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    border: "1px solid #fde68a",
  },
  matchLeft: { display: "flex", gap: "12px", alignItems: "center" },
  matchId: { fontSize: "13px", fontWeight: "800", color: "#d97706", minWidth: "28px" },
  matchCategory: { fontSize: "13px", fontWeight: "700", color: "#1e293b", margin: 0 },
  matchDesc: { fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" },
  warningActions: { display: "flex", gap: "10px" },
  dismissBtn: {
    flex: 1, padding: "10px 16px", borderRadius: "8px",
    border: "1.5px solid #f59e0b", backgroundColor: "white",
    color: "#b45309", fontSize: "13px", fontWeight: "700", cursor: "pointer",
  },
  viewBtn: {
    flex: 1, padding: "10px 16px", borderRadius: "8px",
    border: "none", backgroundColor: "#f59e0b",
    color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer",
  },
  proceedNotice: {
    backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
    borderRadius: "8px", padding: "10px 16px",
    fontSize: "13px", color: "#1d4ed8", marginBottom: "16px",
  },
};

export default RaiseComplaint;