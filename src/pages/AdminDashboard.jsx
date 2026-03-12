// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { complaintAPI } from "../api/api";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";

function AdminDashboard() {
  const navigate = useNavigate();
  const [complaintList, setComplaintList] = useState([]);
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("complaints");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const maintenanceStaff = [
    { staff_id: "507f1f77bcf86cd799439011", name: "Suresh Kumar", department: "Electrical" },
    { staff_id: "507f1f77bcf86cd799439012", name: "Mahesh Plumber", department: "Plumbing" },
    { staff_id: "507f1f77bcf86cd799439013", name: "Ravi Carpenter", department: "Carpentry" },
  ];

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await complaintAPI.getComplaints();
        if (response.complaints) {
          setComplaintList(response.complaints);
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

  const filtered =
    filter === "All"
      ? complaintList
      : complaintList.filter((c) => c.status === filter);

  const counts = {
    total: complaintList.length,
    raised: complaintList.filter((c) => c.status === "Raised").length,
    assigned: complaintList.filter((c) => c.status === "Assigned").length,
    inProgress: complaintList.filter((c) => c.status === "In Progress").length,
    resolved: complaintList.filter((c) => c.status === "Resolved").length,
    rejected: complaintList.filter((c) => c.status === "Rejected").length,
  };

  const showToast = (message, color = "#16a34a") => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  const updateComplaint = (id, updates) => {
    setComplaintList((prev) =>
      prev.map((c) => (c._id === id ? { ...c, ...updates } : c))
    );
  };

  const handleValidate = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignModal(true);
  };

  const handleAssignConfirm = () => {
    if (!selectedStaff) return;
    const staff = maintenanceStaff.find((s) => s.staff_id === parseInt(selectedStaff));
    updateComplaint(selectedComplaint.complaint_id, {
      status: "Assigned", staff_id: staff.staff_id, staff_name: staff.name,
    });
    setAssignModal(false);
    setSelectedStaff("");
    setSelectedComplaint(null);
    showToast(`✅ Complaint #${selectedComplaint.complaint_id} assigned to ${staff.name}`);
  };

  const handleRejectClick = (complaint) => {
    setSelectedComplaint(complaint);
    setRejectModal(true);
  };

  const handleRejectConfirm = () => {
    updateComplaint(selectedComplaint.complaint_id, {
      status: "Rejected",
      resolution_notes: rejectReason || "Rejected by admin.",
    });
    setRejectModal(false);
    setRejectReason("");
    setSelectedComplaint(null);
    showToast(`❌ Complaint #${selectedComplaint.complaint_id} rejected.`, "#dc2626");
  };

  // Analytics data
  const categoryData = ["Electrical", "Plumbing", "Carpentry", "Cleaning", "Internet", "Other"].map((cat) => ({
    label: cat, count: complaintList.filter((c) => c.category === cat).length,
    icon: getCategoryIcon(cat), color: getCategoryColor(cat),
  }));

  const staffPerformance = maintenanceStaff.map((s) => {
    const assigned = complaintList.filter((c) => c.staff_id === s.staff_id);
    const resolved = assigned.filter((c) => c.status === "Resolved");
    const inProgress = assigned.filter((c) => c.status === "In Progress");
    const rate = assigned.length > 0 ? Math.round((resolved.length / assigned.length) * 100) : 0;
    return { ...s, total: assigned.length, resolved: resolved.length, inProgress: inProgress.length, rate };
  });

  const roomData = complaintList.reduce((acc, c) => {
    acc[c.room_no] = (acc[c.room_no] || 0) + 1;
    return acc;
  }, {});
  const roomHotspots = Object.entries(roomData).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const resolutionRate = complaintList.length > 0
    ? Math.round((counts.resolved / complaintList.length) * 100) : 0;

  const priorityData = [
    { label: "High", count: complaintList.filter((c) => c.priority === "High").length, color: "#dc2626" },
    { label: "Medium", count: complaintList.filter((c) => c.priority === "Medium").length, color: "#b45309" },
    { label: "Low", count: complaintList.filter((c) => c.priority === "Low").length, color: "#16a34a" },
  ];

  const maxCategory = Math.max(...categoryData.map((c) => c.count), 1);

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="toast-animate" style={{ ...styles.toast, backgroundColor: toast.color }}>
          {toast.message}
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Assign Complaint #{selectedComplaint?.complaint_id}</h3>
            <p style={styles.modalSubtitle}>Select a maintenance staff member to handle this complaint.</p>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Maintenance Staff</label>
              <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)} style={styles.select}>
                <option value="">-- Select Staff --</option>
                {maintenanceStaff.map((s) => (
                  <option key={s.staff_id} value={s.staff_id}>{s.name} — {s.department}</option>
                ))}
              </select>
            </div>
            <div style={styles.modalComplaintInfo}>
              <p><strong>Category:</strong> {selectedComplaint?.category}</p>
              <p><strong>Priority:</strong> {selectedComplaint?.priority}</p>
              <p><strong>Student:</strong> {selectedComplaint?.student_name}</p>
            </div>
            <div style={styles.modalButtons}>
              <button style={styles.cancelBtn} onClick={() => { setAssignModal(false); setSelectedStaff(""); }}>Cancel</button>
              <button style={{ ...styles.confirmBtn, opacity: selectedStaff ? 1 : 0.5 }} onClick={handleAssignConfirm} disabled={!selectedStaff}>
                Assign & Validate →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ ...styles.modalTitle, color: "#dc2626" }}>Reject Complaint #{selectedComplaint?.complaint_id}</h3>
            <p style={styles.modalSubtitle}>Please provide a reason for rejection.</p>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Reason (optional)</label>
              <textarea rows={3} placeholder="e.g. Duplicate complaint..." value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)} style={{ ...styles.select, resize: "vertical" }} />
            </div>
            <div style={styles.modalButtons}>
              <button style={styles.cancelBtn} onClick={() => { setRejectModal(false); setRejectReason(""); }}>Cancel</button>
              <button style={{ ...styles.confirmBtn, backgroundColor: "#dc2626" }} onClick={handleRejectConfirm}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Admin Dashboard</h1>
            <p style={styles.pageSubtitle}>Review, validate, assign, and monitor all hostel complaints</p>
          </div>
          <div style={styles.tabSwitcher}>
            <button style={{ ...styles.tabBtn, ...(activeTab === "complaints" ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab("complaints")}>📋 Complaints</button>
            <button style={{ ...styles.tabBtn, ...(activeTab === "analytics" ? styles.tabBtnActive : {}) }}
              onClick={() => setActiveTab("analytics")}>📊 Analytics</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={styles.statsRow}>
          {[
            { label: "Total", value: counts.total, color: "#6366f1" },
            { label: "Raised", value: counts.raised, color: "#f59e0b" },
            { label: "Assigned", value: counts.assigned, color: "#3b82f6" },
            { label: "In Progress", value: counts.inProgress, color: "#8b5cf6" },
            { label: "Resolved", value: counts.resolved, color: "#22c55e" },
            { label: "Rejected", value: counts.rejected, color: "#ef4444" },
          ].map((s) => (
            <div key={s.label} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}
              onClick={() => { setFilter(s.label === "Total" ? "All" : s.label); setActiveTab("complaints"); }}>
              <span style={{ ...styles.statNum, color: s.color }}>{s.value}</span>
              <span style={styles.statLbl}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── COMPLAINTS TAB ── */}
        {activeTab === "complaints" && (
          <>
            <div style={styles.filterRow}>
              {["All", "Raised", "Assigned", "In Progress", "Resolved", "Closed", "Rejected"].map((status) => (
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

            {filtered.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={{ fontSize: "48px" }}>📭</p>
                <p style={{ fontWeight: "700", color: "#374151", fontSize: "16px", marginTop: "12px" }}>No complaints found</p>
                <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px" }}>No complaints with status "{filter}".</p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHead}>
                      {["#ID", "Student", "Room", "Category", "Description", "Priority", "Status", "Assigned To", "Actions"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, index) => (
                      <tr key={c.complaint_id} className="table-row-hover"
                        style={{ ...styles.tableRow, backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                        <td style={styles.td}><span style={styles.idBadge}>#{c.complaint_id}</span></td>
                        <td style={styles.td}><span style={styles.studentName}>{c.student_name}</span></td>
                        <td style={styles.td}><span style={styles.roomBadge}>{c.room_no}</span></td>
                        <td style={styles.td}><span style={styles.categoryText}>{getCategoryIcon(c.category)} {c.category}</span></td>
                        <td style={styles.td}><span style={styles.descText}>{c.description.length > 40 ? c.description.slice(0, 40) + "..." : c.description}</span></td>
                        <td style={styles.td}><span style={getPriorityStyle(c.priority)}>{c.priority}</span></td>
                        <td style={styles.td}><span style={getStatusStyle(c.status)}>{c.status}</span></td>
                        <td style={styles.td}><span style={styles.staffText}>{c.staff_name || "—"}</span></td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button style={styles.viewBtn} onClick={() => navigate(`/admin/complaint/${c.complaint_id}`)}>View</button>
                            {c.status === "Raised" && <button style={styles.assignBtn} onClick={() => handleValidate(c)}>Assign</button>}
                            {c.status === "Raised" && <button style={styles.rejectBtn} onClick={() => handleRejectClick(c)}>Reject</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reports */}
            <div style={reportStyles.section}>
              <h2 style={reportStyles.title}>📊 Complaint Reports & Summary</h2>
              <p style={reportStyles.subtitle}>Overview of all complaints by category, priority and status</p>
              <div style={reportStyles.grid}>
                <div style={reportStyles.card}>
                  <h3 style={reportStyles.cardTitle}>By Category</h3>
                  {categoryData.map((cat) => {
                    const pct = complaintList.length > 0 ? Math.round((cat.count / complaintList.length) * 100) : 0;
                    return (
                      <div key={cat.label} style={reportStyles.barRow}>
                        <span style={reportStyles.barLabel}>{cat.icon} {cat.label}</span>
                        <div style={reportStyles.barTrack}>
                          <div style={{ ...reportStyles.barFill, width: `${pct}%`, backgroundColor: cat.color }} />
                        </div>
                        <span style={reportStyles.barCount}>{cat.count}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={reportStyles.card}>
                  <h3 style={reportStyles.cardTitle}>By Priority</h3>
                  {priorityData.map((p) => {
                    const pct = complaintList.length > 0 ? Math.round((p.count / complaintList.length) * 100) : 0;
                    return (
                      <div key={p.label} style={reportStyles.barRow}>
                        <span style={{ ...reportStyles.barLabel, color: p.color, fontWeight: "700" }}>{p.label}</span>
                        <div style={reportStyles.barTrack}>
                          <div style={{ ...reportStyles.barFill, width: `${pct}%`, backgroundColor: p.color }} />
                        </div>
                        <span style={reportStyles.barCount}>{p.count}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={reportStyles.card}>
                  <h3 style={reportStyles.cardTitle}>By Status</h3>
                  {[
                    { label: "Raised", color: "#4338ca" }, { label: "Assigned", color: "#d97706" },
                    { label: "In Progress", color: "#1d4ed8" }, { label: "Resolved", color: "#16a34a" },
                    { label: "Rejected", color: "#dc2626" },
                  ].map((s) => {
                    const count = complaintList.filter((c) => c.status === s.label).length;
                    const pct = complaintList.length > 0 ? Math.round((count / complaintList.length) * 100) : 0;
                    return (
                      <div key={s.label} style={reportStyles.barRow}>
                        <span style={{ ...reportStyles.barLabel, color: s.color }}>{s.label}</span>
                        <div style={reportStyles.barTrack}>
                          <div style={{ ...reportStyles.barFill, width: `${pct}%`, backgroundColor: s.color }} />
                        </div>
                        <span style={reportStyles.barCount}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && (
          <div style={analyticsStyles.wrapper}>
            <div style={analyticsStyles.row2}>
              {/* Resolution Rate */}
              <div style={analyticsStyles.card}>
                <h3 style={analyticsStyles.cardTitle}>🎯 Overall Resolution Rate</h3>
                <div style={analyticsStyles.meterWrapper}>
                  <div style={analyticsStyles.meterOuter}>
                    <div style={{
                      ...analyticsStyles.meterFill, width: `${resolutionRate}%`,
                      backgroundColor: resolutionRate >= 70 ? "#16a34a" : resolutionRate >= 40 ? "#f59e0b" : "#dc2626",
                    }} />
                  </div>
                  <div style={analyticsStyles.meterLabel}>
                    <span style={{
                      fontSize: "42px", fontWeight: "900",
                      color: resolutionRate >= 70 ? "#16a34a" : resolutionRate >= 40 ? "#f59e0b" : "#dc2626",
                    }}>{resolutionRate}%</span>
                    <span style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
                      {counts.resolved} of {counts.total} complaints resolved
                    </span>
                  </div>
                </div>
                <div style={analyticsStyles.rateRow}>
                  <div style={{ ...analyticsStyles.rateBox, borderColor: "#22c55e" }}>
                    <span style={{ color: "#22c55e", fontWeight: "800", fontSize: "20px" }}>{counts.resolved}</span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Resolved</span>
                  </div>
                  <div style={{ ...analyticsStyles.rateBox, borderColor: "#f59e0b" }}>
                    <span style={{ color: "#f59e0b", fontWeight: "800", fontSize: "20px" }}>{counts.inProgress + counts.assigned}</span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Pending</span>
                  </div>
                  <div style={{ ...analyticsStyles.rateBox, borderColor: "#ef4444" }}>
                    <span style={{ color: "#ef4444", fontWeight: "800", fontSize: "20px" }}>{counts.rejected}</span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Rejected</span>
                  </div>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div style={analyticsStyles.card}>
                <h3 style={analyticsStyles.cardTitle}>🚨 Priority Breakdown</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>
                  {priorityData.map((p) => {
                    const pct = counts.total > 0 ? Math.round((p.count / counts.total) * 100) : 0;
                    return (
                      <div key={p.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "700", color: p.color }}>{p.label} Priority</span>
                          <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{p.count} ({pct}%)</span>
                        </div>
                        <div style={{ height: "12px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, backgroundColor: p.color, borderRadius: "10px", transition: "width 0.8s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Category Bar Chart */}
            <div style={analyticsStyles.card}>
              <h3 style={analyticsStyles.cardTitle}>📂 Complaints by Category</h3>
              <div style={analyticsStyles.barChart}>
                {categoryData.map((cat) => {
                  const heightPct = maxCategory > 0 ? Math.round((cat.count / maxCategory) * 100) : 0;
                  return (
                    <div key={cat.label} style={analyticsStyles.barCol}>
                      <span style={analyticsStyles.barValue}>{cat.count}</span>
                      <div style={analyticsStyles.barContainer}>
                        <div style={{ ...analyticsStyles.bar, height: `${Math.max(heightPct, 4)}%`, backgroundColor: cat.color }} />
                      </div>
                      <span style={analyticsStyles.barIcon}>{cat.icon}</span>
                      <span style={analyticsStyles.barCatLabel}>{cat.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={analyticsStyles.row2}>
              {/* Staff Performance */}
              <div style={{ ...analyticsStyles.card, flex: 2 }}>
                <h3 style={analyticsStyles.cardTitle}>👷 Staff Performance Scorecard</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc" }}>
                      {["Staff Member", "Dept", "Assigned", "In Progress", "Resolved", "Score"].map((h) => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staffPerformance.map((s, i) => (
                      <tr key={s.staff_id} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f9fafb", borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{s.name}</td>
                        <td style={{ padding: "12px", fontSize: "13px", color: "#64748b" }}>{s.department}</td>
                        <td style={{ padding: "12px" }}><span style={{ fontSize: "14px", fontWeight: "700", color: "#6366f1" }}>{s.total}</span></td>
                        <td style={{ padding: "12px" }}><span style={{ fontSize: "14px", fontWeight: "700", color: "#3b82f6" }}>{s.inProgress}</span></td>
                        <td style={{ padding: "12px" }}><span style={{ fontSize: "14px", fontWeight: "700", color: "#16a34a" }}>{s.resolved}</span></td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flex: 1, height: "8px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${s.rate}%`, backgroundColor: s.rate >= 70 ? "#16a34a" : s.rate >= 40 ? "#f59e0b" : "#ef4444", borderRadius: "10px", transition: "width 0.6s ease" }} />
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: "800", minWidth: "36px", color: s.rate >= 70 ? "#16a34a" : s.rate >= 40 ? "#f59e0b" : "#ef4444" }}>{s.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Room Hotspots */}
              <div style={{ ...analyticsStyles.card, flex: 1 }}>
                <h3 style={analyticsStyles.cardTitle}>🏠 Room Hotspots</h3>
                <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>Rooms with most complaints</p>
                {roomHotspots.map(([room, count], i) => (
                  <div key={room} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", marginBottom: "8px", backgroundColor: i === 0 ? "#fef2f2" : "#f8fafc", borderRadius: "10px", border: i === 0 ? "1px solid #fecaca" : "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>{i === 0 ? "🔴" : i === 1 ? "🟡" : "🟢"}</span>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Room {room}</span>
                    </div>
                    <span style={{ backgroundColor: i === 0 ? "#dc2626" : "#6366f1", color: "white", borderRadius: "20px", padding: "3px 12px", fontSize: "13px", fontWeight: "700" }}>
                      {count} {count === 1 ? "complaint" : "complaints"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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

function getCategoryColor(category) {
  const colors = { Electrical: "#f59e0b", Plumbing: "#3b82f6", Carpentry: "#92400e", Cleaning: "#06b6d4", Internet: "#8b5cf6", Other: "#6b7280" };
  return colors[category] || "#6366f1";
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
  container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },
  toast: { position: "fixed", top: "80px", right: "24px", color: "white", padding: "14px 22px", borderRadius: "10px", fontSize: "14px", fontWeight: "600", zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" },
  modalOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { backgroundColor: "white", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" },
  modalTitle: { fontSize: "20px", fontWeight: "800", color: "#1e293b", marginBottom: "6px" },
  modalSubtitle: { fontSize: "14px", color: "#64748b", marginBottom: "20px" },
  modalComplaintInfo: { backgroundColor: "#f8fafc", borderRadius: "8px", padding: "12px 16px", fontSize: "14px", color: "#374151", lineHeight: "1.8", marginBottom: "20px" },
  modalButtons: { display: "flex", gap: "12px", justifyContent: "flex-end" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  pageTitle: { fontSize: "26px", fontWeight: "800", color: "#1e293b", margin: 0 },
  pageSubtitle: { fontSize: "14px", color: "#64748b", marginTop: "4px" },
  tabSwitcher: { display: "flex", gap: "8px", backgroundColor: "#f1f5f9", padding: "6px", borderRadius: "12px" },
  tabBtn: { padding: "10px 22px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#64748b", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  tabBtnActive: { backgroundColor: "white", color: "#1e293b", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "14px", marginBottom: "28px" },
  statCard: { backgroundColor: "white", borderRadius: "12px", padding: "16px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: "4px", cursor: "pointer" },
  statNum: { fontSize: "28px", fontWeight: "800" },
  statLbl: { fontSize: "12px", color: "#64748b", fontWeight: "600" },
  filterRow: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  filterBtn: { padding: "7px 14px", borderRadius: "20px", border: "1.5px solid #e2e8f0", backgroundColor: "white", color: "#475569", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  filterBtnActive: { backgroundColor: "#dc2626", color: "white", border: "1.5px solid #dc2626" },
  filterCount: { backgroundColor: "rgba(0,0,0,0.1)", borderRadius: "10px", padding: "1px 7px", fontSize: "11px" },
  emptyBox: { backgroundColor: "white", borderRadius: "12px", padding: "60px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  tableWrapper: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { backgroundColor: "#1e293b" },
  th: { padding: "14px 12px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px" },
  tableRow: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 12px", verticalAlign: "middle" },
  idBadge: { fontSize: "13px", fontWeight: "700", color: "#dc2626" },
  studentName: { fontSize: "13px", fontWeight: "600", color: "#1e293b" },
  roomBadge: { fontSize: "12px", fontWeight: "700", backgroundColor: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "6px" },
  categoryText: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  descText: { fontSize: "12px", color: "#6b7280" },
  staffText: { fontSize: "13px", color: "#475569", fontWeight: "500" },
  actionButtons: { display: "flex", gap: "6px", flexWrap: "wrap" },
  viewBtn: { padding: "5px 10px", borderRadius: "6px", border: "none", backgroundColor: "#f1f5f9", color: "#4f46e5", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  assignBtn: { padding: "5px 10px", borderRadius: "6px", border: "none", backgroundColor: "#dcfce7", color: "#16a34a", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  rejectBtn: { padding: "5px 10px", borderRadius: "6px", border: "none", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  fieldGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "8px" },
  select: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "14px", color: "#1e293b", outline: "none", boxSizing: "border-box", backgroundColor: "#f8fafc", fontFamily: "inherit" },
  cancelBtn: { padding: "10px 20px", borderRadius: "8px", border: "1.5px solid #e2e8f0", backgroundColor: "white", color: "#374151", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  confirmBtn: { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#16a34a", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
};

const reportStyles = {
  section: { marginTop: "40px", paddingTop: "32px", borderTop: "2px solid #e2e8f0" },
  title: { fontSize: "22px", fontWeight: "800", color: "#1e293b", marginBottom: "6px" },
  subtitle: { fontSize: "14px", color: "#64748b", marginBottom: "24px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  card: { backgroundColor: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" },
  cardTitle: { fontSize: "15px", fontWeight: "800", color: "#1e293b", marginBottom: "20px", paddingBottom: "10px", borderBottom: "2px solid #f1f5f9" },
  barRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
  barLabel: { fontSize: "13px", color: "#475569", width: "90px", flexShrink: 0 },
  barTrack: { flex: 1, height: "8px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: "10px", transition: "width 0.5s ease", minWidth: "4px" },
  barCount: { fontSize: "13px", fontWeight: "700", color: "#1e293b", width: "20px", textAlign: "right" },
};

const analyticsStyles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "20px" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  card: { backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" },
  cardTitle: { fontSize: "16px", fontWeight: "800", color: "#1e293b", marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #f1f5f9" },
  meterWrapper: { marginBottom: "20px" },
  meterOuter: { height: "16px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" },
  meterFill: { height: "100%", borderRadius: "10px", transition: "width 1s ease" },
  meterLabel: { display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  rateRow: { display: "flex", gap: "12px", marginTop: "16px" },
  rateBox: { flex: 1, border: "2px solid", borderRadius: "10px", padding: "12px", textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" },
  barChart: { display: "flex", alignItems: "flex-end", gap: "12px", height: "200px", padding: "16px 0 0 0" },
  barCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" },
  barValue: { fontSize: "14px", fontWeight: "800", color: "#1e293b" },
  barContainer: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  bar: { width: "100%", borderRadius: "6px 6px 0 0", transition: "height 0.8s ease", minHeight: "4px" },
  barIcon: { fontSize: "20px" },
  barCatLabel: { fontSize: "11px", color: "#64748b", fontWeight: "600", textAlign: "center" },
};

export default AdminDashboard;