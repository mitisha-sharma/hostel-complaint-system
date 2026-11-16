// src/pages/StudentDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { complaintAPI, shortId } from "../api/api";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";

function StudentDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await complaintAPI.getComplaints();
        if (response.complaints) {
          setComplaints(response.complaints);
        } else {
          setError(response.message || "Failed to load complaints");
        }
      } catch (error) {
        setError("Network error. Please check if backend is running.");
        console.error("Fetch complaints error:", error);
      }
      setLoading(false);
    };

    fetchComplaints();
  }, []);

  const myComplaints = complaints.filter(
    (c) => c.student_id === currentUser.id
  );

  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? myComplaints
      : myComplaints.filter((c) => c.status === filter);

  const counts = {
    total: myComplaints.length,
    raised: myComplaints.filter((c) => c.status === "Raised").length,
    inProgress: myComplaints.filter((c) => c.status === "In Progress").length,
    resolved: myComplaints.filter((c) => c.status === "Resolved").length,
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>My Complaints</h1>
            <p style={styles.pageSubtitle}>
              Room {currentUser.room_no} · {currentUser.name}
            </p>
          </div>
          <button
            style={styles.raiseBtn}
            onClick={() => navigate("/student/raise")}
          >
            + Raise New Complaint
          </button>
        </div>

        {/* Summary Cards */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderTop: "4px solid #6366f1" }}
            onClick={() => setFilter("All")}>
            <span style={{ ...styles.statNum, color: "#6366f1" }}>{counts.total}</span>
            <span style={styles.statLbl}>Total</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #f59e0b" }}
            onClick={() => setFilter("Raised")}>
            <span style={{ ...styles.statNum, color: "#f59e0b" }}>{counts.raised}</span>
            <span style={styles.statLbl}>Raised</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #3b82f6" }}
            onClick={() => setFilter("In Progress")}>
            <span style={{ ...styles.statNum, color: "#3b82f6" }}>{counts.inProgress}</span>
            <span style={styles.statLbl}>In Progress</span>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #22c55e" }}
            onClick={() => setFilter("Resolved")}>
            <span style={{ ...styles.statNum, color: "#22c55e" }}>{counts.resolved}</span>
            <span style={styles.statLbl}>Resolved</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterRow}>
          {["All", "Raised", "Assigned", "In Progress", "Resolved", "Closed", "Rejected"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === status ? styles.filterBtnActive : {}),
                }}
              >
                {status}
                {status !== "All" && (
                  <span style={styles.filterCount}>
                    {myComplaints.filter((c) => c.status === status).length}
                  </span>
                )}
              </button>
            )
          )}
        </div>

        {/* Complaints Table */}
        {filtered.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ fontSize: "48px" }}>📭</p>
            <p style={{ fontWeight: "700", color: "#374151", fontSize: "16px", marginTop: "12px" }}>
              No complaints found
            </p>
            <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px" }}>
              {filter === "All"
                ? "You haven't raised any complaints yet."
                : `No complaints with status "${filter}".`}
            </p>
            {filter === "All" && (
              <button
                style={{ ...styles.raiseBtn, marginTop: "20px" }}
                onClick={() => navigate("/student/raise")}
              >
                + Raise Your First Complaint
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>#ID</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, index) => (
                  <tr
                    key={c.complaint_id}
                    className="table-row-hover"
                    style={{
                      ...styles.tableRow,
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                  >
                    <td style={styles.td}>
                      <span style={styles.idBadge}>#{shortId(c.complaint_id)}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryText}>
                        {getCategoryIcon(c.category)} {c.category}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.descText}>
                        {c.description.length > 50
                          ? c.description.slice(0, 50) + "..."
                          : c.description}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={getPriorityStyle(c.priority)}>
                        {c.priority}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(c.status)}>{c.status}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.dateText}>{c.date}</span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewBtn}
                        onClick={() =>
                          navigate(`/student/complaint/${c.complaint_id}`)
                        }
                      >
                        View →
                      </button>
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
  const icons = {
    Electrical: "⚡", Plumbing: "🚿", Carpentry: "🪚",
    Cleaning: "🧹", Internet: "📶", Other: "📌",
  };
  return icons[category] || "📌";
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
    Raised: { backgroundColor: "#e0e7ff", color: "#4338ca" },
    Assigned: { backgroundColor: "#fef3c7", color: "#d97706" },
    "In Progress": { backgroundColor: "#dbeafe", color: "#1d4ed8" },
    Resolved: { backgroundColor: "#dcfce7", color: "#16a34a" },
    Closed: { backgroundColor: "#f1f5f9", color: "#475569" },
    Rejected: { backgroundColor: "#fee2e2", color: "#dc2626" },
  };
  return { ...base, ...(colors[status] || base) };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" },
  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "28px",
  },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#1e293b", margin: 0 },
  pageSubtitle: { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  raiseBtn: {
    backgroundColor: "#4f46e5", color: "white", border: "none",
    padding: "12px 22px", borderRadius: "10px", fontSize: "14px",
    fontWeight: "700", cursor: "pointer",
    boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
  },
  statsRow: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px", marginBottom: "28px",
  },
  statCard: {
    backgroundColor: "white", borderRadius: "12px", padding: "20px",
    textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    display: "flex", flexDirection: "column", gap: "6px", cursor: "pointer",
  },
  statNum: { fontSize: "32px", fontWeight: "800", color: "#1e293b" },
  statLbl: { fontSize: "13px", color: "#64748b", fontWeight: "600" },
  filterRow: {
    display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap",
  },
  filterBtn: {
    padding: "7px 16px", borderRadius: "20px", border: "1.5px solid #e2e8f0",
    backgroundColor: "white", color: "#475569", fontSize: "13px",
    fontWeight: "600", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "6px",
  },
  filterBtnActive: {
    backgroundColor: "#4f46e5", color: "white", border: "1.5px solid #4f46e5",
  },
  filterCount: {
    backgroundColor: "rgba(0,0,0,0.1)", borderRadius: "10px",
    padding: "1px 7px", fontSize: "11px",
  },
  emptyBox: {
    backgroundColor: "white", borderRadius: "12px", padding: "60px",
    textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  tableWrapper: {
    backgroundColor: "white", borderRadius: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { backgroundColor: "#1e293b" },
  th: {
    padding: "14px 16px", textAlign: "left", fontSize: "12px",
    fontWeight: "700", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.8px",
  },
  tableRow: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 16px", verticalAlign: "middle" },
  idBadge: { fontSize: "13px", fontWeight: "700", color: "#6366f1" },
  categoryText: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  descText: { fontSize: "13px", color: "#6b7280" },
  dateText: { fontSize: "13px", color: "#9ca3af" },
  viewBtn: {
    backgroundColor: "#f1f5f9", border: "none", padding: "6px 14px",
    borderRadius: "6px", fontSize: "13px", fontWeight: "600",
    color: "#4f46e5", cursor: "pointer",
  },
};

export default StudentDashboard;