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
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminReviewQueue from './pages/AdminReviewQueue';
import LoadingSpinner from './components/common/LoadingSpinner';
import ServerStatusToast from './components/common/ServerStatusToast';

// Phase 13 — Shared Platform Pages
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Calendar from './pages/Calendar';
import Search from './pages/Search';
import Reports from './pages/Reports';
import Activity from './pages/Activity';
import Settings from './pages/Settings';

import { getPublicPlatformSettings } from './api/platform';

// Helper to get default dashboard path for a role
export function getRoleDashboard(role) {
  switch (role) {
    case 'find_accommodation': return '/dashboard';
    case 'property_owner':     return '/owner';
    case 'company_hr':         return '/company';
    case 'admin':              return '/admin';
    default:                   return '/dashboard';
  }
}

function MaintenanceNoticeGuard({ children }) {
  const { user } = useAuth();
  const [maintenance, setMaintenance] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await getPublicPlatformSettings();
        const data = res.data || res;
        setMaintenance(Boolean(data.maintenance_mode));
      } catch {
        /* ignore */
      }
    };
    checkMaintenance();
  }, [location.pathname]);

  if (maintenance && user?.role !== 'admin' && location.pathname !== '/login') {
    return (
      <div className="min-h-screen bg-[#222831] flex items-center justify-center p-6 text-white font-sans text-center">
        <div className="max-w-md w-full bg-[#393E46] border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#00ADB5]/20 text-[#00ADB5] flex items-center justify-center mx-auto text-3xl border border-[#00ADB5]/30">
            🛠️
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">Platform Maintenance Active</h1>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              MoveSmart is currently undergoing scheduled platform configuration and maintenance. Non-admin access is temporarily restricted.
            </p>
          </div>
          <div className="bg-[#222831] p-3.5 rounded-2xl border border-white/5 text-[11px] text-[#00ADB5] font-mono font-bold">
            Status: 503 Scheduled Maintenance Mode
          </div>
          <a
            href="/login"
            className="inline-block bg-[#00ADB5] hover:bg-teal-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
          >
            Super Admin Portal Login
          </a>
        </div>
      </div>
    );
  }

  return children;
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
          <MaintenanceNoticeGuard>
          <ServerStatusToast />
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
                <ProtectedRoute allowedRoles={['find_accommodation', 'admin', 'property_owner', 'company_hr']}>
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

            {/* Broker Route Redirect */}
            <Route
              path="/broker"
              element={<Navigate to="/dashboard" replace />}
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
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </MaintenanceNoticeGuard>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
