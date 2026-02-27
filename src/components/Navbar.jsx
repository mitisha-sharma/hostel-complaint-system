// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleColors = {
    student: "#4f46e5",
    admin: "#dc2626",
    maintenance: "#16a34a",
  };

  const roleLabel = {
    student: "Student Portal",
    admin: "Admin / Warden Portal",
    maintenance: "Maintenance Portal",
  };

  const roleIcon = {
    student: "🎓",
    admin: "🛡️",
    maintenance: "🔧",
  };

  return (
    <nav style={{
      backgroundColor: roleColors[currentUser?.role] || "#333",
      color: "white",
      padding: "0 28px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      height: "62px",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Left: Logo + portal label */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" }}>
          🏠 Hostel CMS
        </span>
        <span style={{
          fontSize: "12px",
          opacity: 0.9,
          backgroundColor: "rgba(255,255,255,0.2)",
          padding: "4px 12px",
          borderRadius: "20px",
          fontWeight: "600",
          letterSpacing: "0.3px",
        }}>
          {roleIcon[currentUser?.role]} {roleLabel[currentUser?.role]}
        </span>
      </div>

      {/* Right: User info + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "14px", fontWeight: "700", margin: 0 }}>
            {currentUser?.name}
          </p>
          <p style={{ fontSize: "11px", opacity: 0.75, margin: 0, textTransform: "capitalize" }}>
            {currentUser?.role}
            {currentUser?.room_no ? ` · Room ${currentUser.room_no}` : ""}
            {currentUser?.department ? ` · ${currentUser.department}` : ""}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            color: "white",
            border: "1.5px solid rgba(255,255,255,0.35)",
            padding: "8px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "13px",
            letterSpacing: "0.3px",
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;