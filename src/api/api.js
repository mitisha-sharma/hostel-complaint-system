const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (name, email, password, role, room_no, department, contact) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, room_no, department, contact }),
    });
    return await response.json();
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Complaints API calls
export const complaintAPI = {
  raiseComplaint: async (category, description, priority) => {
    const response = await fetch(`${API_BASE_URL}/complaints/raise`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ category, description, priority }),
    });
    return await response.json();
  },

  getComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  },

  getComplaintById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  },

  assignComplaint: async (complaintId, staffId, staffName) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ staff_id: staffId, staff_name: staffName }),
    });
    return await response.json();
  },

  updateStatus: async (complaintId, status, resolution_notes) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status, resolution_notes }),
    });
    return await response.json();
  },

  rejectComplaint: async (complaintId) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${complaintId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/complaints/stats/overview`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  },
};

// Users API calls
export const userAPI = {
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  },

  getUsersByRole: async (role) => {
    const response = await fetch(`${API_BASE_URL}/users/role/${role}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  },

  getCurrentProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile/me`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  },
};

// Staff API calls
export const staffAPI = {
  getAllStaff: async () => {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  },

  getStaffByDepartment: async (department) => {
    const response = await fetch(`${API_BASE_URL}/staff/department/${department}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return await response.json();
  },
};
