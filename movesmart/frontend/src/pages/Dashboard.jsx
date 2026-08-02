// pages/Dashboard.jsx — Find Accommodation main dashboard (PRD §7.1, Architecture.md §4.1)
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DashboardHeader({ title, roleLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-[#222831] text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <a href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight no-underline text-white">
          <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-[#00ADB5] via-[#222831] to-[#00ADB5]">
            <img src="/smart-Building.png" alt="MoveSmart" className="w-full h-full rounded-full object-cover bg-white" />
          </div>
          Move<span className="text-[#00ADB5]">Smart</span>
        </a>
        <span className="text-xs bg-[#00ADB5]/20 text-[#00ADB5] border border-[#00ADB5]/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          {roleLabel}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300 font-medium hidden sm:inline">
          {user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 text-xs font-bold text-white bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#EEEEEE] text-[#222831] font-['Plus_Jakarta_Sans']">
      <DashboardHeader title="Find Accommodation" roleLabel="Renter / Buyer" />
      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5 mb-8">
          <h1 className="text-2xl font-extrabold mb-2">Welcome, {user?.email}! 👋</h1>
          <p className="text-gray-600">You are logged in as <strong className="text-[#00ADB5]">Find Accommodation (Renter/Buyer)</strong>.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-black/5 shadow-xs">
            <h3 className="font-bold text-lg mb-2">📍 Smart Neighborhoods</h3>
            <p className="text-sm text-gray-500">AI-ranked locality scores based on your budget & commute.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-black/5 shadow-xs">
            <h3 className="font-bold text-lg mb-2">🏡 Verified Listings</h3>
            <p className="text-sm text-gray-500">Browse admin-reviewed listings with zero deposit options.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-black/5 shadow-xs">
            <h3 className="font-bold text-lg mb-2">🚗 Commute Calculator</h3>
            <p className="text-sm text-gray-500">Real-time travel times and monthly budget breakdowns.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
