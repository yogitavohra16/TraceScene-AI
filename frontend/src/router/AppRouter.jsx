/**
 * AppRouter - route table (Section 19). A ProtectedRoute wrapper redirects
 * to /login when there's no auth token.
 */
import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import CaseListPage from "../pages/CaseListPage.jsx";
import CaseDetailPage from "../pages/CaseDetailPage.jsx";
import ServiceListPage from "../pages/ServiceListPage.jsx";
import ServiceDetailPage from "../pages/ServiceDetailPage.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/cases" element={<ProtectedRoute><CaseListPage /></ProtectedRoute>} />
        <Route path="/cases/:id" element={<ProtectedRoute><CaseDetailPage /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><ServiceListPage /></ProtectedRoute>} />
        <Route path="/services/:id" element={<ProtectedRoute><ServiceDetailPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
