// App.jsx — Router shell with AuthProvider, PrivateRoute, and Role-Gated Routes
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
import AdminReviewQueue from './pages/AdminReviewQueue';

// Helper to get default dashboard path for a role
export function getRoleDashboard(role) {
  switch (role) {
    case 'find_accommodation': return '/dashboard';
    case 'property_owner':     return '/owner';
    case 'broker':             return '/broker';
    case 'company_hr':         return '/company';
    case 'admin':              return '/admin/review';
    default:                   return '/choose-your-journey';
  }
}

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user hasn't set their role yet (except on choose-your-journey)
  if (!user.role && location.pathname !== '/choose-your-journey') {
    return <Navigate to="/choose-your-journey" replace />;
  }

  // Check role authorization if specified
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

            {/* Role Assignment Flow */}
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

            {/* Admin Review Queue — Provisioned admins only (FR-2) */}
            <Route
              path="/admin/review"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReviewQueue />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
