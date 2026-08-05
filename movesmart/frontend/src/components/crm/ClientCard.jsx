// src/components/crm/ClientCard.jsx — Interactive Client Card & Detail Modal
import React, { useState } from 'react';
import Card from '../common/Card';

export default function ClientCard({ client, onEdit, onDelete, onToggleFavorite }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <Card className="flex flex-col justify-between h-full bg-white relative hover:shadow-md transition-shadow border border-[#D9D9D9]">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleFavorite && onToggleFavorite(client)}
                className={`text-base transition-transform active:scale-125 ${client.favorite ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
                title={client.favorite ? 'Unfavorite' : 'Mark Favorite'}
              >
                ★
              </button>
              <h4 className="font-bold text-sm text-[#222831]">{client.name}</h4>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              client.status === 'active' ? 'bg-green-100 text-green-700 border border-green-200' :
              client.status === 'archived' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
              'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
              {client.status}
            </span>
          </div>

          <div className="space-y-1 mb-3 text-xs text-[#393E46]">
            <p className="font-bold text-[#00ADB5]">
              Budget: ₹{client.budget?.toLocaleString() || 'N/A'} <span className="font-normal text-gray-500">/ month</span>
            </p>
            <p className="text-[11px]">📞 {client.phone || 'No phone'}</p>
            <p className="text-[11px] truncate">✉️ {client.email || 'No email'}</p>
          </div>

          {client.preferred_locations?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {client.preferred_locations.slice(0, 3).map((loc, idx) => (
                <span key={idx} className="text-[9px] font-semibold bg-[#EEEEEE] text-[#393E46] px-1.5 py-0.5 rounded">
                  📍 {loc}
                </span>
              ))}
            </div>
          )}

          {client.lifestyle && (
            <div className="mb-3">
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded border border-cyan-200">
                Lifestyle: {client.lifestyle}
              </span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#D9D9D9] flex justify-between items-center text-xs">
          <button onClick={() => setShowDetail(true)} className="font-bold text-[#00ADB5] hover:underline">
            View Details
          </button>
          <div className="space-x-2">
            <button onClick={() => onEdit(client)} className="text-gray-600 hover:text-black font-semibold">
              Edit
            </button>
            <button onClick={() => onDelete(client)} className="text-red-500 hover:text-red-700 font-semibold">
              Delete
            </button>
          </div>
        </div>
      </Card>

      {/* Client Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b border-[#D9D9D9] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#222831]">{client.name}</h3>
                <p className="text-xs text-[#393E46]">{client.email} • {client.phone}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-black font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#EEEEEE]/50 p-3 rounded-lg border border-[#D9D9D9]">
              <div>
                <span className="text-gray-500 block font-semibold">Monthly Budget</span>
                <span className="font-bold text-[#00ADB5] text-sm">₹{client.budget?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold">Lifestyle Preference</span>
                <span className="font-bold capitalize">{client.lifestyle || 'Standard'}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold">BHK Requirement</span>
                <span className="font-bold">{client.property_preferences?.bhk || 2} BHK</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold">Deal Type</span>
                <span className="font-bold capitalize">{client.property_preferences?.deal_type || 'Rent'}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider mb-1.5">Preferred Localities</h4>
              <div className="flex flex-wrap gap-1.5">
                {client.preferred_locations?.map((loc, idx) => (
                  <span key={idx} className="text-xs font-semibold bg-[#EEEEEE] text-[#222831] px-2 py-1 rounded border border-[#D9D9D9]">
                    📍 {loc}
                  </span>
                )) || <p className="text-xs text-gray-500">None specified</p>}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider mb-1.5">Timeline Notes</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {client.notes?.length > 0 ? (
                  client.notes.map((note, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-[#D9D9D9] text-xs text-[#393E46]">
                      {note}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">No notes logged yet.</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9D9D9] flex justify-end">
              <button
                onClick={() => setShowDetail(false)}
                className="bg-[#393E46] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#222831]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
