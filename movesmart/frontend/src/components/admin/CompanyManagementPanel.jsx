// src/components/admin/CompanyManagementPanel.jsx — Super Admin Company HR Management Component
import React, { useState, useEffect } from 'react';
import { getCompanies, updateUserStatus } from '../../api/users';
import Card from '../common/Card';

export default function CompanyManagementPanel() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await getCompanies();
      setCompanies(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleToggleStatus = async (c) => {
    const nextStatus = c.account_status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateUserStatus(c._id, nextStatus);
      fetchCompanies();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-[#D9D9D9]">
        <div>
          <h3 className="font-extrabold text-base text-[#222831]">Enterprise Corporate HR Directory</h3>
          <p className="text-xs text-[#393E46]">Inspect corporate relocation accounts, workforce size & batch metrics.</p>
        </div>
        <span className="text-xs font-bold text-[#00ADB5] uppercase">{companies.length} Registered Companies</span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading corporate accounts...</div>
      ) : companies.length === 0 ? (
        <Card className="text-center py-12 text-xs text-gray-400">No corporate HR accounts registered.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companies.map((c) => (
            <Card key={c._id} className="p-4 bg-white border border-[#D9D9D9] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">
                    Enterprise HR
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                    c.account_status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {c.account_status || 'active'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#222831] pt-2">{c.email}</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#EEEEEE]/50 p-2.5 rounded border border-[#D9D9D9]">
                <div>
                  <span className="text-gray-500 block text-[10px] font-semibold">Employees</span>
                  <span className="font-bold text-[#222831]">{c.employees_count || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] font-semibold">Active Batches</span>
                  <span className="font-bold text-[#00ADB5]">{c.batches_count || 0}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D9D9D9] flex justify-end">
                <button
                  onClick={() => handleToggleStatus(c)}
                  className={`text-xs font-bold ${c.account_status === 'suspended' ? 'text-green-600' : 'text-amber-600'} hover:underline`}
                >
                  {c.account_status === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
