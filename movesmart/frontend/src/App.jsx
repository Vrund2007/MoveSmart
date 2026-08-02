// App.jsx — skeleton router shell (Architecture.md §5, PRD §6)
// Routes are stubbed; no business logic here. All four role dashboards + Admin are wired below.
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';

// Pages — stubs only
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

// TODO: Add a ProtectedRoute wrapper that checks AuthContext.role before rendering private routes
// TODO: Redirect to role-specific dashboard based on users.role from JWT (Architecture.md §4.0)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/choose-your-journey" element={<ChooseYourJourney />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Find Accommodation */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/saved" element={<SavedListings />} />

            {/* Property Owner */}
            <Route path="/owner" element={<OwnerDashboard />} />

            {/* Broker/Agent */}
            <Route path="/broker" element={<BrokerDashboard />} />

            {/* Company/HR */}
            <Route path="/company" element={<CompanyDashboard />} />

            {/* Admin — no public signup path; account created via provisioning only (FR-2) */}
            <Route path="/admin/review" element={<AdminReviewQueue />} />
          </Routes>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
