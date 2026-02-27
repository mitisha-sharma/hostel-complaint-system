// src/pages/ComplaintDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { complaints } from "../data/dummyData";
import Navbar from "../components/Navbar";

function ComplaintDetails() {
  const { id } = useParams(); // gets the :id from the URL
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Find the complaint matching the URL id
  const complaint = complaints.find(
    (c) => c.complaint_id === parseInt(id)
  );

  // Back path depends on role
  const backPath = `/${currentUser.role === "maintenance" ? "maintenance" : currentUser.role}`;

  if (!complaint) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.notFound}>
          <p style={{ fontSize: "40px" }}>🔍</p>
          <h2>Complaint Not Found</h2>
          <button style={styles.backBtn} onClick={() => navigate(backPath)}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        {/* Back button */}
        <button style={styles.backLink} onClick={() => navigate(backPath)}>
          ← Back to Dashboard
        </button>

        {/* Title row */}
        <div style={styles.titleRow}>
          <div>
            <h1 style={styles.pageTitle}>
              Complaint #{complaint.complaint_id}
            </h1>
            <p style={styles.pageSubtitle}>
              Submitted on {complaint.date} · Room {complaint.room_no}
            </p>
          </div>
          <span style={getStatusStyle(complaint.status)}>
            {complaint.status}
          </span>
        </div>

        {/* Main card */}
        <div style={styles.card}>
          {/* Two column grid */}
          <div style={styles.grid}>
            <InfoRow label="Category" value={complaint.category} />
            <InfoRow label="Priority" value={complaint.priority} highlight={getPriorityColor(complaint.priority)} />
            <InfoRow label="Student" value={complaint.student_name} />
            <InfoRow label="Room No" value={complaint.room_no} />
            <InfoRow
              label="Assigned To"
              value={complaint.staff_name || "Not yet assigned"}
            />
            <InfoRow label="Date Raised" value={complaint.date} />
          </div>

          <div style={styles.divider} />

          {/* Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📝 Description</h3>
            <p style={styles.sectionText}>{complaint.description}</p>
          </div>

          {/* Resolution notes — only show if exists */}
          {complaint.resolution_notes && (
            <>
              <div style={styles.divider} />
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>✅ Resolution Notes</h3>
                <p style={styles.sectionText}>{complaint.resolution_notes}</p>
              </div>
            </>
          )}
        </div>

        {/* Status Timeline */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>📊 Complaint Lifecycle</h3>
          <div style={styles.timeline}>
            {["Raised", "Assigned", "In Progress", "Resolved", "Closed"].map(
              (step, index) => {
                const statusOrder = ["Raised", "Assigned", "In Progress", "Resolved", "Closed"];
                const currentIndex = statusOrder.indexOf(complaint.status);
                const isDone = index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                  <div key={step} style={styles.timelineStep}>
                    <div
                      style={{
                        ...styles.timelineDot,
                        backgroundColor: isDone ? "#4f46e5" : "#e2e8f0",
                        transform: isCurrent ? "scale(1.3)" : "scale(1)",
                      }}
                    />
                    <span
                      style={{
                        ...styles.timelineLabel,
                        color: isDone ? "#4f46e5" : "#94a3b8",
                        fontWeight: isCurrent ? "800" : "500",
                      }}
                    >
                      {step}
                    </span>
                    {index < 4 && (
                      <div
                        style={{
                          ...styles.timelineLine,
                          backgroundColor: index < currentIndex ? "#4f46e5" : "#e2e8f0",
                        }}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Sub Components ────────────────────────────────────────────────────────────

function InfoRow({ label, value, highlight }) {
  return (
    <div style={infoStyles.row}>
      <span style={infoStyles.label}>{label}</span>
      <span style={{ ...infoStyles.value, color: highlight || "#1e293b" }}>
        {value}
      </span>
    </div>
  );
}

const infoStyles = {
  row: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  value: { fontSize: "15px", fontWeight: "600" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusStyle(status) {
  const base = { padding: "6px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "700" };
  const colors = {
    Raised: { backgroundColor: "#e0e7ff", color: "#4338ca" },
    Assigned: { backgroundColor: "#fef3c7", color: "#d97706" },
    "In Progress": { backgroundColor: "#dbeafe", color: "#1d4ed8" },
    Resolved: { backgroundColor: "#dcfce7", color: "#16a34a" },
    Closed: { backgroundColor: "#f1f5f9", color: "#475569" },
    Rejected: { backgroundColor: "#fee2e2", color: "#dc2626" },
  };
  return { ...base, ...(colors[status] || {}) };
}

function getPriorityColor(priority) {
  return { High: "#dc2626", Medium: "#b45309", Low: "#16a34a" }[priority] || "#374151";
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  container: { maxWidth: "800px", margin: "0 auto", padding: "32px 24px" },

  backLink: {
    background: "none", border: "none", color: "#4f46e5",
    fontSize: "14px", fontWeight: "600", cursor: "pointer",
    padding: 0, marginBottom: "20px", display: "block",
  },

  titleRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "24px",
  },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#1e293b", margin: 0 },
  pageSubtitle: { fontSize: "14px", color: "#64748b", marginTop: "4px" },

  card: {
    backgroundColor: "white", borderRadius: "16px",
    padding: "28px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    marginBottom: "20px",
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "24px", marginBottom: "8px",
  },
  divider: { height: "1px", backgroundColor: "#f1f5f9", margin: "20px 0" },
  section: {},
  sectionTitle: { fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "10px" },
  sectionText: { fontSize: "14px", color: "#475569", lineHeight: "1.7" },

  // Timeline
  timeline: { display: "flex", alignItems: "center", marginTop: "20px" },
  timelineStep: { display: "flex", flexDirection: "column", alignItems: "center", position: "relative", flex: 1 },
  timelineDot: { width: "16px", height: "16px", borderRadius: "50%", marginBottom: "8px", transition: "all 0.2s" },
  timelineLabel: { fontSize: "12px", textAlign: "center" },
  timelineLine: { position: "absolute", top: "8px", left: "58%", width: "84%", height: "2px" },

  notFound: { textAlign: "center", padding: "80px", color: "#374151" },
  backBtn: {
    marginTop: "16px", backgroundColor: "#4f46e5", color: "white",
    border: "none", padding: "10px 24px", borderRadius: "8px",
    fontSize: "14px", cursor: "pointer",
  },
};

export default ComplaintDetails;