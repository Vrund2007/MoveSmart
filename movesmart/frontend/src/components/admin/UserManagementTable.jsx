// src/components/admin/UserManagementTable.jsx — Super Admin User Registry & Admin Creation Panel
import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser, createAdminAccount } from '../../api/users';
import Card from '../common/Card';
import Button from '../common/Button';
import { XIcon } from '../common/Icons';

export default function UserManagementTable() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Add Admin Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ role: roleFilter === 'all' ? '' : roleFilter, search });
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      setUsers(data);
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

  const handleDeleteUser = async (userObj) => {
    if (!window.confirm(`Permanently delete account for ${userObj.email}? This will erase all user profile data.`)) return;

    try {
      await deleteUser(userObj._id);
      setUsers(prev => prev.filter(u => u._id !== userObj._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!adminEmail || !adminPassword) {
      setModalError('Email ID and password are required.');
      return;
    }

    setModalLoading(true);
    try {
      const res = await createAdminAccount({
        name: adminName.trim() || 'Admin User',
        email: adminEmail.trim(),
        password: adminPassword,
      });

      const newAdmin = res.data || res.user || res;
      setUsers(prev => [newAdmin, ...prev]);
      setIsModalOpen(false);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      alert(`Admin account successfully created for ${adminEmail}!`);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create admin account.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Add Admin Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 space-y-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="font-black text-lg text-[#222831]">Create Admin Account</h3>
                <p className="text-xs text-text-secondary">Set ID credentials for new Administrator access.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-text-secondary hover:bg-surface"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#393E46] mb-1 uppercase tracking-wider">
                  Admin Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. System Admin"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#393E46] mb-1 uppercase tracking-wider">
                  Admin Email Address / ID
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin.name@movesmart.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#393E46] mb-1 uppercase tracking-wider">
                  Set Access Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={modalLoading}
                >
                  Create Admin Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Role Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {[
            { id: 'all', label: 'All Users' },
            { id: 'find_accommodation', label: 'Renters / Seekers' },
            { id: 'property_owner', label: 'Landlords' },
            { id: 'company_hr', label: 'Company HR' },
            { id: 'admin', label: 'Admins' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-3.5 py-2 rounded-xl uppercase tracking-wider font-black transition-all ${
                roleFilter === r.id ? 'bg-[#00ADB5] text-white shadow-xs' : 'bg-surface text-[#393E46] border border-border hover:bg-gray-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Add Admin Account Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-black bg-[#00ADB5] hover:bg-[#00969d] text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>+ Add Admin Account</span>
          </button>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email, name, or ID..."
              className="px-3.5 py-2 text-xs border border-border rounded-xl outline-none focus:border-[#00ADB5] w-full sm:w-56"
            />
            <Button type="submit" variant="primary" size="sm">Search</Button>
          </form>
        </div>
      </div>

      {/* User Registry Table */}
      {loading ? (
        <div className="py-12 text-center">
          <Button loading variant="primary">Loading user registry...</Button>
        </div>
      ) : users.length === 0 ? (
        <Card className="text-center py-16 text-xs text-text-secondary rounded-2xl bg-white border border-border">
          No user accounts found matching query.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-border rounded-2xl bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead className="bg-surface text-[#393E46] border-b border-border uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  return (
                    <tr key={u._id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00ADB5] to-teal-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                            {u.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-extrabold text-[#222831]">{u.name || u.email.split('@')[0]}</div>
                            <div className="text-[10px] text-text-secondary">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-primary/10 text-primary'
                        }`}>
                          {(u.role || 'Unassigned').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4 text-text-secondary">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="px-3 py-1.5 text-[11px] font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-colors border border-rose-200"
                          >
                            Delete User
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
