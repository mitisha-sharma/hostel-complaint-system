// src/pages/MaintenanceDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { complaintAPI, shortId } from "../api/api";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";

function MaintenanceDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [complaintList, setComplaintList] = useState([]);

  useEffect(() => {
    complaintAPI.getComplaints().then((res) => setComplaintList(res.complaints || [])).catch(console.error);
  }, []);
  const [filter, setFilter] = useState("All");
  const [statusModal, setStatusModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [notesError, setNotesError] = useState("");
  const [toast, setToast] = useState(null);

  const filtered =
    filter === "All"
      ? complaintList
      : complaintList.filter((c) => c.status === filter);

  const counts = {
    total: complaintList.length,
    assigned: complaintList.filter((c) => c.status === "Assigned").length,
    inProgress: complaintList.filter((c) => c.status === "In Progress").length,
    resolved: complaintList.filter((c) => c.status === "Resolved").length,
  };

  const showToast = (message, color = "#16a34a") => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateClick = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(getNextStatus(complaint.status));
    setResolutionNotes(complaint.resolution_notes || "");
    setNotesError("");
    setStatusModal(true);
  };

  const handleUpdateConfirm = async () => {
    if (newStatus === "Resolved" && !resolutionNotes.trim()) {
      setNotesError("Please add resolution notes before marking as Resolved.");
      return;
    }
    const res = await complaintAPI.updateStatus(selectedComplaint._id, newStatus, resolutionNotes);
    if (!res.complaint) { showToast(res.message || "Could not update complaint", "#dc2626"); return; }
    setComplaintList((prev) => prev.map((c) => (c._id === selectedComplaint._id ? { ...c, ...res.complaint } : c)));
    showToast(`✅ Complaint #${shortId(selectedComplaint.complaint_id)} updated to "${newStatus}"`);
    setStatusModal(false);
    setSelectedComplaint(null);
    setResolutionNotes("");
    setNewStatus("");
  };

  function getNextStatus(currentStatus) {
    const flow = ["Assigned", "In Progress", "Resolved"];
    const idx = flow.indexOf(currentStatus);
    return idx < flow.length - 1 ? flow[idx + 1] : currentStatus;
  }

  function getAvailableStatuses(currentStatus) {
    const flow = ["Assigned", "In Progress", "Resolved"];
    const idx = flow.indexOf(currentStatus);
    return flow.slice(idx);
  }

  const completionRate = counts.total > 0
    ? Math.round((counts.resolved / counts.total) * 100) : 0;

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="toast-animate" style={{ ...styles.toast, backgroundColor: toast.color }}>
          {toast.message}
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && selectedComplaint && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Update Complaint #{shortId(selectedComplaint.complaint_id)}</h3>
            <p style={styles.modalSubtitle}>Move this complaint forward in the resolution process.</p>
            <div style={styles.modalInfo}>
              <p><strong>Category:</strong> {selectedComplaint.category}</p>
              <p><strong>Student:</strong> {selectedComplaint.student_name}</p>
              <p><strong>Room:</strong> {selectedComplaint.room_no}</p>
              <p><strong>Current Status:</strong>{" "}
                <span style={{ color: "#d97706", fontWeight: "700" }}>{selectedComplaint.status}</span>
              </p>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Update Status To</label>
              <div style={styles.statusOptions}>
                {getAvailableStatuses(selectedComplaint.status).map((s) => (
                  <button key={s} type="button" onClick={() => setNewStatus(s)}
                    style={{ ...styles.statusOption, ...(newStatus === s ? getStatusActiveStyle(s) : {}) }}>
                    {getStatusIcon(s)} {s}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Resolution Notes{" "}
                {newStatus === "Resolved"
                  ? <span style={{ color: "#ef4444" }}>* (required)</span>
                  : <span style={{ color: "#9ca3af", fontWeight: "400" }}>(optional)</span>}
              </label>
              <textarea rows={3}
                placeholder={newStatus === "Resolved" ? "Describe what was done to fix the issue..." : "Add any notes about current progress..."}
                value={resolutionNotes}
                onChange={(e) => { setResolutionNotes(e.target.value); if (notesError) setNotesError(""); }}
                style={{ ...styles.textarea, borderColor: notesError ? "#ef4444" : "#e2e8f0" }} />
              {notesError && <p style={styles.errorText}>⚠️ {notesError}</p>}
            </div>
            <div style={styles.modalButtons}>
              <button style={styles.cancelBtn} onClick={() => { setStatusModal(false); setNotesError(""); }}>Cancel</button>
              <button style={{ ...styles.confirmBtn, opacity: newStatus ? 1 : 0.5, cursor: newStatus ? "pointer" : "not-allowed" }}
                onClick={handleUpdateConfirm} disabled={!newStatus}>
                Confirm Update →
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>My Assigned Complaints</h1>
            <p style={styles.pageSubtitle}>
              {currentUser.name} · {currentUser.department} Department
            </p>
          </div>
          <div style={styles.progressBox}>
            <p style={styles.progressLabel}>Completion Rate</p>
            <p style={styles.progressValue}>{completionRate}%</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderTop: "4px solid #6366f1" }}>
            <span style={{ ...styles.statNum, color: "#6366f1" }}>{counts.total}</span>
            <span style={styles.statLbl}>Total Assigned</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #f59e0b" }}>
            <span style={{ ...styles.statNum, color: "#f59e0b" }}>{counts.assigned}</span>
            <span style={styles.statLbl}>Pending Start</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #3b82f6" }}>
            <span style={{ ...styles.statNum, color: "#3b82f6" }}>{counts.inProgress}</span>
            <span style={styles.statLbl}>In Progress</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #16a34a" }}>
            <span style={{ ...styles.statNum, color: "#16a34a" }}>{counts.resolved}</span>
            <span style={styles.statLbl}>Resolved</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterRow}>
          {["All", "Assigned", "In Progress", "Resolved"].map((status) => (
            <button key={status} onClick={() => setFilter(status)}
              style={{ ...styles.filterBtn, ...(filter === status ? styles.filterBtnActive : {}) }}>
              {status}
              {status !== "All" && (
                <span style={styles.filterCount}>
                  {complaintList.filter((c) => c.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ fontSize: "40px" }}>🎉</p>
            <p style={{ fontWeight: "600", color: "#374151" }}>
              {filter === "All" ? "No complaints assigned to you yet." : `No complaints with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  {["#ID", "Student", "Room", "Category", "Description", "Priority", "Status", "Notes", "Actions"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, index) => (
                  <tr key={c.complaint_id} className="table-row-hover"
                    style={{ ...styles.tableRow, backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                    <td style={styles.td}><span style={styles.idBadge}>#{shortId(c.complaint_id)}</span></td>
                    <td style={styles.td}><span style={styles.studentName}>{c.student_name}</span></td>
                    <td style={styles.td}><span style={styles.roomBadge}>{c.room_no}</span></td>
                    <td style={styles.td}><span style={styles.categoryText}>{getCategoryIcon(c.category)} {c.category}</span></td>
                    <td style={styles.td}><span style={styles.descText}>{c.description.length > 40 ? c.description.slice(0, 40) + "..." : c.description}</span></td>
                    <td style={styles.td}><span style={getPriorityStyle(c.priority)}>{c.priority}</span></td>
                    <td style={styles.td}><span style={getStatusStyle(c.status)}>{c.status}</span></td>
                    <td style={styles.td}>
                      <span style={styles.notesText}>
                        {c.resolution_notes
                          ? c.resolution_notes.slice(0, 30) + (c.resolution_notes.length > 30 ? "..." : "")
                          : <span style={{ color: "#d1d5db" }}>—</span>}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button style={styles.viewBtn} onClick={() => navigate(`/maintenance/complaint/${c.complaint_id}`)}>View</button>
                        {c.status !== "Resolved" && c.status !== "Closed" && (
                          <button style={styles.updateBtn} onClick={() => handleUpdateClick(c)}>Update</button>
                        )}
                        {c.status === "Resolved" && (
                          <span style={styles.doneBadge}>✅ Done</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryIcon(category) {
  const icons = { Electrical: "⚡", Plumbing: "🚿", Carpentry: "🪚", Cleaning: "🧹", Internet: "📶", Other: "📌" };
  return icons[category] || "📌";
}

function getStatusIcon(status) {
  const icons = { Assigned: "📋", "In Progress": "🔧", Resolved: "✅" };
  return icons[status] || "📌";
}

function getPriorityStyle(priority) {
  const base = { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" };
  const colors = {
    High: { backgroundColor: "#fee2e2", color: "#dc2626" },
    Medium: { backgroundColor: "#fef9c3", color: "#b45309" },
    Low: { backgroundColor: "#dcfce7", color: "#16a34a" },
  };
  return { ...base, ...(colors[priority] || colors.Low) };
}

function getStatusStyle(status) {
  const base = { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" };
  const colors = {
    Assigned: { backgroundColor: "#fef3c7", color: "#d97706" },
    "In Progress": { backgroundColor: "#dbeafe", color: "#1d4ed8" },
    Resolved: { backgroundColor: "#dcfce7", color: "#16a34a" },
    Closed: { backgroundColor: "#f1f5f9", color: "#475569" },
  };
  return { ...base, ...(colors[status] || base) };
}

function getStatusActiveStyle(status) {
  const colors = {
    Assigned: { backgroundColor: "#fef3c7", color: "#d97706", borderColor: "#d97706" },
    "In Progress": { backgroundColor: "#dbeafe", color: "#1d4ed8", borderColor: "#1d4ed8" },
    Resolved: { backgroundColor: "#dcfce7", color: "#16a34a", borderColor: "#16a34a" },
  };
  return colors[status] || {};
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },
  toast: { position: "fixed", top: "80px", right: "24px", color: "white", padding: "14px 22px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" },
  modalOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" },
  modalTitle: { fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "6px" },
  modalSubtitle: { fontSize: "14px", color: "#64748b", marginBottom: "20px" },
  modalInfo: { backgroundColor: "#f8fafc", borderRadius: "8px", padding: "12px 16px", fontSize: "14px", color: "#374151", lineHeight: "1.8", marginBottom: "20px" },
  fieldGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "8px" },
  statusOptions: { display: "flex", gap: "10px" },
  statusOption: { flex: 1, padding: "10px 8px", borderRadius: "8px", border: "1.5px solid #e2e8f0", backgroundColor: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", color: "#374151" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#1e293b", outline: "none", boxSizing: "border-box", backgroundColor: "#f8fafc", fontFamily: "inherit", resize: "vertical" },
  errorText: { color: "#ef4444", fontSize: "12px", marginTop: "6px" },
  modalButtons: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" },
  cancelBtn: { padding: "10px 20px", borderRadius: "8px", border: "1.5px solid #e2e8f0", backgroundColor: "white", color: "#374151", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  confirmBtn: { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#16a34a", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#1e293b", margin: 0 },
  pageSubtitle: { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  progressBox: { backgroundColor: "white", borderRadius: "12px", padding: "16px 28px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderTop: "4px solid #16a34a" },
  progressLabel: { fontSize: "12px", color: "#64748b", fontWeight: "600", margin: 0 },
  progressValue: { fontSize: "28px", fontWeight: "800", color: "#16a34a", margin: "4px 0 0 0" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" },
  statCard: { backgroundColor: "white", borderRadius: "12px", padding: "20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: "6px" },
  statNum: { fontSize: "32px", fontWeight: "800" },
  statLbl: { fontSize: "13px", color: "#64748b", fontWeight: "600" },
  filterRow: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  filterBtn: { padding: "7px 14px", borderRadius: "20px", border: "1.5px solid #e2e8f0", backgroundColor: "white", color: "#475569", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  filterBtnActive: { backgroundColor: "#16a34a", color: "white", border: "1.5px solid #16a34a" },
  filterCount: { backgroundColor: "rgba(0,0,0,0.1)", borderRadius: "10px", padding: "1px 7px", fontSize: "11px" },
  emptyBox: { backgroundColor: "white", borderRadius: "12px", padding: "60px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  tableWrapper: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { backgroundColor: "#1e293b" },
  th: { padding: "14px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px" },
  tableRow: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 12px", verticalAlign: "middle" },
  idBadge: { fontSize: "13px", fontWeight: "700", color: "#16a34a" },
  studentName: { fontSize: "13px", fontWeight: "600", color: "#1e293b" },
  roomBadge: { fontSize: "12px", fontWeight: "700", backgroundColor: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "6px" },
  categoryText: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  descText: { fontSize: "12px", color: "#6b7280" },
  notesText: { fontSize: "12px", color: "#475569", fontStyle: "italic" },
  actionButtons: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" },
  viewBtn: { padding: "5px 10px", borderRadius: "6px", border: "none", backgroundColor: "#f1f5f9", color: "#4f46e5", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  updateBtn: { padding: "5px 10px", borderRadius: "6px", border: "none", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  doneBadge: { fontSize: "12px", fontWeight: "700", color: "#16a34a" },
};

export default MaintenanceDashboard;