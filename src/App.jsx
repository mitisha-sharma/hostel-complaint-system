// src/App.jsx
import { HashRouter as Router, Routes, Route, HashRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MaintenanceDashboard from "./pages/MaintenanceDashboard";
import RaiseComplaint from "./pages/RaiseComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/raise"
            element={
              <ProtectedRoute role="student">
                <RaiseComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaint/:id"
            element={
              <ProtectedRoute role="student">
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaint/:id"
            element={
              <ProtectedRoute role="admin">
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/maintenance"
            element={
              <ProtectedRoute role="maintenance">
                <MaintenanceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/complaint/:id"
            element={
              <ProtectedRoute role="maintenance">
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;