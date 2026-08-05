// src/components/admin/BrokerManagementPanel.jsx — Super Admin Broker Directory Component
import React, { useState, useEffect } from 'react';
import { getBrokers, updateUserStatus } from '../../api/users';
import Card from '../common/Card';

export default function BrokerManagementPanel() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      const res = await getBrokers();
      setBrokers(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setBrokers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  const handleToggleStatus = async (b) => {
    const nextStatus = b.account_status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateUserStatus(b._id, nextStatus);
      fetchBrokers();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-[#D9D9D9]">
        <div>
          <h3 className="font-extrabold text-base text-[#222831]">Verified Broker Partners Directory</h3>
          <p className="text-xs text-[#393E46]">Inspect broker performance, active client pipelines & verification statuses.</p>
        </div>
        <span className="text-xs font-bold text-[#00ADB5] uppercase">{brokers.length} Registered Brokers</span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading broker partners...</div>
      ) : brokers.length === 0 ? (
        <Card className="text-center py-12 text-xs text-gray-400">No broker partners registered.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {brokers.map((b) => (
            <Card key={b._id} className="p-4 bg-white border border-[#D9D9D9] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                    Verified Broker
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                    b.account_status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {b.account_status || 'active'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#222831] pt-2">{b.email}</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#EEEEEE]/50 p-2.5 rounded border border-[#D9D9D9]">
                <div>
                  <span className="text-gray-500 block text-[10px] font-semibold">Active Listings</span>
                  <span className="font-bold text-[#222831]">{b.active_listings_count || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] font-semibold">Active Clients</span>
                  <span className="font-bold text-[#00ADB5]">{b.active_clients_count || 0}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D9D9D9] flex justify-end">
                <button
                  onClick={() => handleToggleStatus(b)}
                  className={`text-xs font-bold ${b.account_status === 'suspended' ? 'text-green-600' : 'text-amber-600'} hover:underline`}
                >
                  {b.account_status === 'suspended' ? 'Activate Broker' : 'Suspend Broker'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
