// src/components/shared/GlobalSearchBar.jsx — Global Search Input & Modal Results Component
import React, { useState } from 'react';
import { globalSearch } from '../../api/search';
import Card from '../common/Card';

export default function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;
    setLoading(true);
    setIsOpen(true);
    try {
      const res = await globalSearch(query.trim());
      setResults(res.data || res);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search properties, clients, employees, documents..."
          className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded-full py-2 px-4 text-xs text-[#222831] focus:ring-2 focus:ring-[#00ADB5] focus:outline-none"
        />
      </form>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#D9D9D9] pb-3">
              <h3 className="font-extrabold text-base text-[#222831]">Global Platform Search Results</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black font-bold text-lg">
                ✕
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-gray-500">Searching platform entities...</div>
            ) : !results || results.total_results === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">No results found for "{query}".</div>
            ) : (
              <div className="space-y-4 text-xs">
                {results.listings?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs text-[#00ADB5] uppercase tracking-wider mb-2">Properties ({results.listings.length})</h4>
                    <div className="space-y-1.5">
                      {results.listings.map((l) => (
                        <div key={l._id} className="p-3 bg-[#EEEEEE]/40 border rounded flex justify-between">
                          <span className="font-bold text-[#222831]">{l.title} ({l.locality})</span>
                          <span className="font-extrabold text-[#00ADB5]">₹{l.rent?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.clients?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs text-[#00ADB5] uppercase tracking-wider mb-2">Clients ({results.clients.length})</h4>
                    <div className="space-y-1.5">
                      {results.clients.map((c) => (
                        <div key={c._id} className="p-3 bg-[#EEEEEE]/40 border rounded flex justify-between">
                          <span className="font-bold text-[#222831]">{c.name} ({c.email})</span>
                          <span className="font-bold text-gray-500">{c.stage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.employees?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs text-[#00ADB5] uppercase tracking-wider mb-2">Employees ({results.employees.length})</h4>
                    <div className="space-y-1.5">
                      {results.employees.map((emp) => (
                        <div key={emp._id} className="p-3 bg-[#EEEEEE]/40 border rounded flex justify-between">
                          <span className="font-bold text-[#222831]">{emp.name} ({emp.department})</span>
                          <span className="font-bold text-gray-500">{emp.designation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
