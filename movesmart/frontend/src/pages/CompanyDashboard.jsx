// pages/CompanyDashboard.jsx — Corporate HR Relocation dashboard
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CompanyDashboard() {
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
          <span className="text-xs bg-[#6C3FF5]/20 text-[#6C3FF5] border border-[#6C3FF5]/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Company / HR
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
          <h1 className="text-2xl font-extrabold mb-2">Corporate HR Relocation Hub 👔</h1>
          <p className="text-gray-600">Logged in as <strong>{user?.email}</strong>. Manage bulk employee relocation batches, budgets, and office proximity allocations.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-black/5 shadow-xs">
            <h3 className="font-bold text-lg mb-2">📦 Relocation Batches</h3>
            <p className="text-sm text-gray-500">Create & manage employee cohort batches with total budget tracking.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-black/5 shadow-xs">
            <h3 className="font-bold text-lg mb-2">📊 Budget & Proximity Allocation</h3>
            <p className="text-sm text-gray-500">Allocate verified listings to employees matching office commute requirements.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
