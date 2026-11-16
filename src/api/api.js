import { handle } from "./mockServer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Demo mode = the in-browser mock backend (src/api/mockServer.js). It is used when:
//  - VITE_DEMO=true, or
//  - this is a production build with no VITE_API_URL (e.g. GitHub Pages), or
//  - in development, when the real backend at localhost:5000 is not running.
let demo = import.meta.env.VITE_DEMO === "true" || (import.meta.env.PROD && !import.meta.env.VITE_API_URL);
export const isDemoMode = () => demo;

const getToken = () => localStorage.getItem("token") || "";

// Short display id: "c3" -> "c3", Mongo ObjectId -> last 5 chars in upper case
export const shortId = (id) => (String(id).length > 8 ? String(id).slice(-5).toUpperCase() : String(id).toUpperCase());

// Pages expect complaint_id and date fields
const fixComplaint = (c) => (c && c._id ? { ...c, complaint_id: c._id, date: (c.createdAt || "").slice(0, 10) } : c);
const normalize = (data) => {
  if (!data || typeof data !== "object") return data;
  if (data.complaint) data.complaint = fixComplaint(data.complaint);
  if (Array.isArray(data.complaints)) data.complaints = data.complaints.map(fixComplaint);
  return data;
};

async function request(method, path, body) {
  if (!demo) {
    try {
      const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      return normalize(await res.json());
    } catch (e) {
      if (import.meta.env.PROD) throw e;
      console.warn("Backend not reachable on localhost:5000 - switching to in-browser demo mode.");
      demo = true;
    }
  }
  return normalize(handle(method, path, body || {}, getToken()).data);
}

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const data = await request("POST", "/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },
  register: (name, email, password, role, room_no, department, contact) =>
    request("POST", "/auth/register", { name, email, password, role, room_no, department, contact }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// Complaints API calls
export const complaintAPI = {
  raiseComplaint: (category, description, priority) => request("POST", "/complaints/raise", { category, description, priority }),
  getComplaints: () => request("GET", "/complaints"),
  getComplaintById: (id) => request("GET", `/complaints/${id}`),
  assignComplaint: (id, staff_id, staff_name) => request("PUT", `/complaints/${id}/assign`, { staff_id, staff_name }),
  updateStatus: (id, status, resolution_notes) => request("PUT", `/complaints/${id}/status`, { status, resolution_notes }),
  rejectComplaint: (id) => request("PUT", `/complaints/${id}/reject`),
  getStats: () => request("GET", "/complaints/stats/overview"),
};

// Users API calls
export const userAPI = {
  getAllUsers: () => request("GET", "/users"),
  getUsersByRole: (role) => request("GET", `/users/role/${role}`),
  getCurrentProfile: () => request("GET", "/users/profile/me"),
};

// Staff API calls
export const staffAPI = {
  getAllStaff: () => request("GET", "/staff"),
  getStaffByDepartment: (department) => request("GET", `/staff/department/${department}`),
};
