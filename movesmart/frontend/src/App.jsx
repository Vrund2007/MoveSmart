// App.jsx — Router shell with AuthProvider, ProtectedRoute, and Role-Gated Routes
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';

// Pages
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ChooseYourJourney from './pages/ChooseYourJourney';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ListingDetail from './pages/ListingDetail';
import SavedListings from './pages/SavedListings';
import OwnerDashboard from './pages/OwnerDashboard';
import BrokerDashboard from './pages/BrokerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminReviewQueue from './pages/AdminReviewQueue';
import LoadingSpinner from './components/common/LoadingSpinner';

// Phase 13 — Shared Platform Pages
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Calendar from './pages/Calendar';
import Documents from './pages/Documents';
import Search from './pages/Search';
import Reports from './pages/Reports';
import Activity from './pages/Activity';
import Settings from './pages/Settings';

// Helper to get default dashboard path for a role
export function getRoleDashboard(role) {
  switch (role) {
    case 'find_accommodation': return '/dashboard';
    case 'property_owner':     return '/owner';
    case 'broker':             return '/broker';
    case 'company_hr':         return '/company';
    case 'admin':              return '/admin/dashboard';
    default:                   return '/choose-your-journey';
  }
}

// Protected Route wrapper enforcing authentication, role selection, and onboarding completion
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" message="Restoring session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. If user hasn't selected a role yet
  if (!user.role && location.pathname !== '/choose-your-journey') {
    return <Navigate to="/choose-your-journey" replace />;
  }

  // 2. If user selected role but hasn't completed role_profile
  const isProfileEmpty = !user.role_profile || Object.keys(user.role_profile).length === 0;
  if (user.role && user.role !== 'admin' && isProfileEmpty && location.pathname !== '/onboarding' && location.pathname !== '/choose-your-journey') {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Check role authorization if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={getRoleDashboard(user.role)} replace />;
    }
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Role Assignment & Onboarding Flow */}
            <Route
              path="/choose-your-journey"
              element={
                <ProtectedRoute>
                  <ChooseYourJourney />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Find Accommodation Role Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['find_accommodation']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/listings/:id"
              element={
                <ProtectedRoute allowedRoles={['find_accommodation', 'admin']}>
                  <ListingDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <ProtectedRoute allowedRoles={['find_accommodation']}>
                  <SavedListings />
                </ProtectedRoute>
              }
            />

            {/* Property Owner Routes */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={['property_owner']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Broker Routes */}
            <Route
              path="/broker"
              element={
                <ProtectedRoute allowedRoles={['broker']}>
                  <BrokerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Company / HR Routes */}
            <Route
              path="/company"
              element={
                <ProtectedRoute allowedRoles={['company_hr']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Platform Routes — Provisioned admins only (FR-2) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/review"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReviewQueue />
                </ProtectedRoute>
              }
            />

            {/* Phase 13 — Shared Platform Routes */}
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
