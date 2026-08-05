// src/components/admin/UserManagementTable.jsx — Super Admin User Registry Component
import React, { useState, useEffect } from 'react';
import { getUsers, updateUserStatus, deleteUser } from '../../api/users';
import Card from '../common/Card';

export default function UserManagementTable() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ role: roleFilter, search });
      setUsers(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.account_status === 'suspended' ? 'active' : 'suspended';
    if (!window.confirm(`Set account status for ${user.email} to '${nextStatus}'?`)) return;
    try {
      await updateUserStatus(user._id, nextStatus);
      fetchUsers();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Permanently delete account for ${user.email}? This action cannot be undone.`)) return;
    try {
      await deleteUser(user._id);
      fetchUsers();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-[#D9D9D9]">
        <div className="flex space-x-2 text-xs font-bold overflow-x-auto">
          {['all', 'find_accommodation', 'property_owner', 'broker', 'company_hr', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded uppercase transition-colors ${
                roleFilter === r ? 'bg-[#00ADB5] text-white' : 'bg-[#EEEEEE] text-[#393E46] hover:bg-gray-300'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex space-x-2 w-full md:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name..."
            className="bg-[#EEEEEE] border border-[#D9D9D9] rounded px-3 py-1.5 text-xs text-[#222831] focus:ring-1 focus:ring-[#00ADB5]"
          />
          <button type="submit" className="bg-[#393E46] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#222831]">
            Search
          </button>
        </form>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading user registry...</div>
      ) : users.length === 0 ? (
        <Card className="text-center py-12 text-xs text-gray-400">No users found matching query.</Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-[#D9D9D9] bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EEEEEE] text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9]">
                <th className="p-4">User ID</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9] font-semibold text-[#222831]">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-[#EEEEEE]/30 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-gray-500">{u._id}</td>
                  <td className="p-4 font-bold text-[#222831]">{u.email}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase bg-gray-100 text-gray-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                      u.account_status === 'suspended' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'
                    }`}>
                      {u.account_status || 'active'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-[11px]">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`text-xs font-bold hover:underline ${
                        u.account_status === 'suspended' ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {u.account_status === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
