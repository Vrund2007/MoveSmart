// pages/BrokerDashboard.jsx — Certified Broker dashboard
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BrokerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] text-[#222831] font-['Plus_Jakarta_Sans']">
      <header className="bg-[#222831] text-white py-4 px-6 md:px-12 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight no-underline text-white">
            <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-[#00ADB5] via-[#222831] to-[#00ADB5]">
              <img src="/smart-Building.png" alt="MoveSmart" className="w-full h-full rounded-full object-cover bg-white" />
            </div>
            Move<span className="text-[#00ADB5]">Smart</span>
          </a>
          <span className="text-xs bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Certified Broker
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 font-medium hidden sm:inline">{user?.email}</span>
          <button onClick={handleLogout} className="px-4 py-1.5 text-xs font-bold text-white bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5 mb-8">
          <h1 className="text-2xl font-extrabold mb-2">Broker Pipeline & Lead Workspace 🤝</h1>
          <p className="text-gray-600">Logged in as <strong>{user?.email}</strong>. Track leads, convert enquiries, and record manual commissions.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-black/5 shadow-xs">
            <h3 className="font-bold text-lg mb-2">📋 Lead Pipeline</h3>
            <p className="text-sm text-gray-500">Track New, Contacted, Converted, and Lost leads from incoming enquiries.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-black/5 shadow-xs">
            <h3 className="font-bold text-lg mb-2">💵 Commission Tracker</h3>
            <p className="text-sm text-gray-500">Private commission ledger per converted deal (FR-7 protected).</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-black/5 shadow-xs">
            <h3 className="font-bold text-lg mb-2">🏢 Proxy Submissions</h3>
            <p className="text-sm text-gray-500">Submit listings on behalf of property owners with provenance tracking.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
