// src/pages/AdminReviewQueue.jsx
// Admin listing review queue page (new v2.0, PRD §7.5, Architecture.md §4.5)
// Shows pending reviews with Isolation Forest risk scores and approve/reject actions.

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminReviewQueue() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Pending listings queue state
  const [queue, setQueue] = useState([
    {
      id: 'lst-7',
      title: 'Unusually Low Price 3 BHK - Suspicious Offer',
      locality: 'Satellite',
      price: 12000,
      predictedPrice: 32000,
      trustScore: 42,
      isSuspicious: true,
      uploader: 'Unknown Broker'
    },
    {
      id: 'lst-new-99',
      title: 'Spacious 3 BHK at Vastrapur Garden',
      locality: 'Vastrapur',
      price: 33000,
      predictedPrice: 32500,
      trustScore: 96,
      isSuspicious: false,
      uploader: 'Rajesh Patel (Owner)'
    }
  ]);

  const [notification, setNotification] = useState('');

  const handleApprove = (id, title) => {
    setQueue((prev) => prev.filter(item => item.id !== id));
    setNotification(`Listing "${title}" Approved & Published successfully.`);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleFlag = (id, title) => {
    setQueue((prev) => prev.filter(item => item.id !== id));
    setNotification(`Listing "${title}" Flagged as suspicious & removed from queue.`);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#D9D9D9] h-16 flex items-center justify-between px-8 z-10">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🛡️</span>
          <span className="font-extrabold text-xl tracking-tight text-[#222831]">MoveSmart Admin Panel</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#EEEEEE] border border-[#D9D9D9] rounded-full text-[#EF4444] uppercase">
            System Admin
          </span>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-[#EF4444] hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Alerts Banner */}
        {notification && (
          <div className="bg-[#22C55E]/10 border border-[#22C55E] p-4 rounded-xl text-xs text-[#22C55E] font-semibold text-center">
            {notification}
          </div>
        )}

        {/* Info Grid */}
        <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-[#222831]">Admin Listing Review Queue</h3>
          <p className="text-xs text-[#393E46] mt-1 leading-relaxed">
            All submitted listings must pass through this dashboard. Pricing anomalies are flagged using the Isolation Forest model against regional rent prediction values.
          </p>
        </div>

        {/* Review table */}
        <div className="bg-white border border-[#D9D9D9] p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#222831] uppercase tracking-wider">Pending Listings ({queue.length})</h3>

          {queue.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#393E46] font-semibold bg-[#EEEEEE]/30 rounded-xl border border-dashed border-[#D9D9D9]">
              All listings reviewed! The queue is empty.
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#D9D9D9] rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EEEEEE] text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9]">
                    <th className="p-4">Listing details</th>
                    <th className="p-4">Uploader</th>
                    <th className="p-4">Offer vs AI Predict</th>
                    <th className="p-4">Trust Index</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE] text-[#222831] font-semibold">
                  {queue.map((item) => {
                    const pctDiff = ((item.price - item.predictedPrice) / item.predictedPrice) * 100;
                    return (
                      <tr key={item.id} className="hover:bg-[#EEEEEE]/20 transition-colors">
                        <td className="p-4">
                          <strong className="block text-[#222831]">{item.title}</strong>
                          <span className="text-[10px] text-[#00ADB5] uppercase">{item.locality}</span>
                        </td>
                        <td className="p-4 text-[#393E46] font-medium">{item.uploader}</td>
                        <td className="p-4 tabular-nums">
                          ₹{item.price.toLocaleString('en-IN')}{' '}
                          <span className="text-[10px] font-bold text-[#393E46]/60">
                            (XGBoost: ₹{item.predictedPrice.toLocaleString('en-IN')})
                          </span>
                          <span className={`block text-[10px] font-bold ${
                            pctDiff < -30 ? 'text-[#F59E0B]' : 'text-[#393E46]'
                          }`}>
                            {pctDiff.toFixed(1)}% delta
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.isSuspicious 
                              ? 'bg-[#EF4444]/10 text-[#EF4444]' 
                              : 'bg-[#22C55E]/10 text-[#22C55E]'
                          }`}>
                            {item.trustScore}% Trust
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleApprove(item.id, item.title)}
                            className="bg-[#22C55E] hover:bg-[#1ea34d] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleFlag(item.id, item.title)}
                            className="bg-[#EF4444] hover:bg-[#d83c3c] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-colors"
                          >
                            Flag Fraud
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
