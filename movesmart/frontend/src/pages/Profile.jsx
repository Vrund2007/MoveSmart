// src/pages/Profile.jsx — Comprehensive Seeker Profile & Settings Manager
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { updateRoleProfile, getUserProfile } from '../api/profile';
import { changePassword, deleteAccount } from '../api/auth';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import InteractiveLocationPicker from '../components/common/InteractiveLocationPicker';
import { getUserDisplayName } from '../utils/user';


const FURNISHING_OPTIONS = ['Any', 'Unfurnished', 'Semi-Furnished', 'Fully-Furnished'];
const LIFESTYLE_OPTIONS = ['Peaceful', 'Vibrant', 'Student-Friendly', 'Family-Oriented', 'Pet-Friendly'];
const COMMUTE_MODES = ['Car', 'Public Transport', 'Walking', 'Bike'];

function ProfileCompletionBar({ user }) {
  const rp = user?.role_profile || {};
  const fields = [
    user?.email,
    Array.isArray(rp.preferred_localities) ? rp.preferred_localities.length > 0 : Boolean(rp.preferred_localities),
    rp.max_budget || rp.rent_budget,
    rp.preferred_bhk,
    rp.lifestyle_preference || rp.lifestyle_pref,
    rp.commute_mode,
    rp.work_area,
  ];
  const filled = fields.filter(Boolean).length;
  const percentage = Math.round((filled / fields.length) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs text-text-secondary font-medium">
        <span>Profile Completion</span>
        <span className="font-extrabold text-primary">{percentage}%</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden border border-border">
        <div
          className="h-full bg-gradient-to-r from-primary to-teal-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage < 100 && (
        <p className="text-[10px] text-text-secondary">Complete your preferences to unlock better property recommendations.</p>
      )}
    </div>
  );
}


export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('preferences');

  // Change Password state
  const [passState, setPassState] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Delete Account state
  const [deletePass, setDeletePass] = useState('');
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!passState.old_password || !passState.new_password || !passState.confirm_password) {
      setPassError('Please fill in all password fields.');
      return;
    }
    if (passState.new_password !== passState.confirm_password) {
      setPassError('New password and confirm password do not match.');
      return;
    }
    if (passState.new_password.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    setPassLoading(true);
    try {
      await changePassword({
        old_password: passState.old_password,
        new_password: passState.new_password,
      });
      setPassSuccess('Password updated successfully.');
      setPassState({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPassError(err.response?.data?.message || err.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePass) {
      setDeleteError('Please enter your password to confirm account deletion.');
      return;
    }
    if (!deleteConfirmed) {
      setDeleteError('Please check the confirmation box to proceed.');
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAccount({ password: deletePass });
      alert('Your account has been permanently deleted.');
      if (logout) logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Account deletion failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const [prefs, setPrefs] = useState({
    name: '',
    max_budget: '',
    preferred_bhk: '',
    preferred_localities: '',
    preferred_furnishing: 'Any',
    lifestyle_preference: 'Peaceful',
    commute_mode: 'Public Transport',
    work_area: '',
    max_commute_minutes: 45,
  });

  useEffect(() => {
    getUserProfile().then((res) => {
      const fetchedUser = res?.data?.user || res?.user || res?.data || res;
      if (fetchedUser && fetchedUser.email) {
        setUser(fetchedUser);
      }
    }).catch(() => {});
  }, [setUser]);

  useEffect(() => {
    if (user?.role_profile || user) {
      const rp = user?.role_profile || {};
      setPrefs({
        name: rp.name || user?.name || '',
        max_budget: rp.max_budget || rp.rent_budget || '',
        preferred_bhk: rp.preferred_bhk || '',
        preferred_localities: Array.isArray(rp.preferred_localities) ? rp.preferred_localities.join(', ') : (rp.preferred_localities || ''),
        preferred_furnishing: rp.preferred_furnishing || 'Any',
        lifestyle_preference: rp.lifestyle_preference || rp.lifestyle_pref || 'Peaceful',
        commute_mode: rp.commute_mode || 'Public Transport',
        work_area: rp.work_area || '',
        max_commute_minutes: rp.max_commute_minutes || rp.commute_tolerance_minutes || 45,
      });
    }
  }, [user]);


  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const payload = {
        name: prefs.name || null,
        max_budget: Number(prefs.max_budget) || null,
        rent_budget: Number(prefs.max_budget) || null,
        preferred_bhk: Number(prefs.preferred_bhk) || null,
        preferred_localities: prefs.preferred_localities
          ? prefs.preferred_localities.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        preferred_furnishing: prefs.preferred_furnishing,
        lifestyle_preference: prefs.lifestyle_preference,
        lifestyle_pref: prefs.lifestyle_preference,
        commute_mode: prefs.commute_mode,
        work_area: prefs.work_area,
        max_commute_minutes: Number(prefs.max_commute_minutes) || 45,
        commute_tolerance_minutes: Number(prefs.max_commute_minutes) || 45,
      };

      const res = await updateRoleProfile(payload);
      const updatedUser = res?.data?.user || res?.user || res?.data || res;
      if (updatedUser && updatedUser.email) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        const mergedUser = {
          ...user,
          role_profile: {
            ...(user?.role_profile || {}),
            ...payload
          }
        };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
      }

      setSuccess('Profile preferences saved successfully!');
      setTimeout(() => setSuccess(''), 4000);

    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save profile preferences.');
    } finally {
      setLoading(false);
    }
  };


  const TABS = [
    { id: 'preferences', label: '🏠 Preferences' },
    { id: 'account', label: '👤 Account' },
    { id: 'security', label: '🔒 Security' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans text-[#222831] max-w-2xl mx-auto">
      {/* Profile Header */}
      <Card className="bg-white border border-border">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center font-extrabold text-white text-2xl shadow-md">
            {getUserDisplayName(user)[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold text-xl text-text-primary">Hello, {getUserDisplayName(user)}</h2>
            <p className="text-xs text-text-secondary font-medium">{user?.email}</p>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase inline-block mt-1">
              Accommodation Seeker
            </span>
          </div>
        </div>
        <ProfileCompletionBar user={user} />
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSave}>
          <Card className="bg-white border border-border space-y-5">
            <h3 className="font-bold text-sm text-text-primary">User & Housing Profile</h3>

            <Input
              label="Display Name / Username"
              type="text"
              placeholder="e.g. Alex Shah or customer2"
              value={prefs.name}
              onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Maximum Monthly Budget (₹)"
                type="number"
                placeholder="e.g. 25000"
                value={prefs.max_budget}
                onChange={(e) => setPrefs({ ...prefs, max_budget: e.target.value })}
              />
              <Input
                label="Preferred BHK Size"
                type="number"
                placeholder="e.g. 2"
                min={1}
                max={5}
                value={prefs.preferred_bhk}
                onChange={(e) => setPrefs({ ...prefs, preferred_bhk: e.target.value })}
              />
            </div>

            <Input
              label="Preferred Localities (comma-separated)"
              placeholder="e.g. Vastrapur, Satellite, Bodakdev"
              value={prefs.preferred_localities}
              onChange={(e) => setPrefs({ ...prefs, preferred_localities: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-primary mb-1 block">Furnishing Preference</label>
                <select
                  value={prefs.preferred_furnishing}
                  onChange={(e) => setPrefs({ ...prefs, preferred_furnishing: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary"
                >
                  {FURNISHING_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-text-primary mb-1 block">Lifestyle Preference</label>
                <select
                  value={prefs.lifestyle_preference}
                  onChange={(e) => setPrefs({ ...prefs, lifestyle_preference: e.target.value })}
                  className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-text-primary"
                >
                  {LIFESTYLE_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 className="font-bold text-sm text-text-primary pt-2 border-t border-border">📍 Interactive Office Location & Commute Intelligence</h3>

            <div className="space-y-4">
              <InteractiveLocationPicker
                label="Set Exact Work / Office Location on Map (Geoapify Places & Live Pin)"
                value={prefs.work_area}
                onChange={(addressText, coords) => {
                  setPrefs((prev) => {
                    const newPrefs = { ...prev, work_area: addressText };
                    // Persist immediately to MongoDB role_profile
                    const payload = {
                      max_budget: Number(newPrefs.max_budget) || null,
                      rent_budget: Number(newPrefs.max_budget) || null,
                      preferred_bhk: Number(newPrefs.preferred_bhk) || null,
                      preferred_localities: newPrefs.preferred_localities
                        ? newPrefs.preferred_localities.split(',').map((s) => s.trim()).filter(Boolean)
                        : [],
                      preferred_furnishing: newPrefs.preferred_furnishing,
                      lifestyle_preference: newPrefs.lifestyle_preference,
                      lifestyle_pref: newPrefs.lifestyle_preference,
                      commute_mode: newPrefs.commute_mode,
                      work_area: addressText,
                      max_commute_minutes: Number(newPrefs.max_commute_minutes) || 45,
                      commute_tolerance_minutes: Number(newPrefs.max_commute_minutes) || 45,
                    };
                    updateRoleProfile(payload).then((res) => {
                      const updatedUser = res?.data?.user || res?.user || res?.data || res;
                      if (updatedUser && updatedUser.email) setUser(updatedUser);
                    }).catch(() => {});
                    return newPrefs;
                  });
                }}
              />


              <Input
                label="Max Commute Target (minutes)"
                type="number"
                min={5}
                max={180}
                value={prefs.max_commute_minutes}
                onChange={(e) => setPrefs({ ...prefs, max_commute_minutes: e.target.value })}
              />
            </div>



            <div>
              <label className="text-xs font-bold text-text-primary mb-1 block">Preferred Commute Mode</label>
              <div className="flex flex-wrap gap-2">
                {COMMUTE_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, commute_mode: mode })}
                    className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                      prefs.commute_mode === mode
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface text-text-primary border-border hover:border-primary'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-bold">
                ✅ {success}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" loading={loading}>
                Save Profile Preferences
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <Card className="bg-white border border-border space-y-4">
          <h3 className="font-bold text-sm text-text-primary">Account Information</h3>
          <div className="bg-surface p-4 rounded-lg border border-border space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary font-medium">Email Address</span>
              <span className="font-bold text-text-primary">{user?.email}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary font-medium">Account Role</span>
              <span className="font-bold text-primary">Accommodation Seeker</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary font-medium">Account Status</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>
          <p className="text-[10px] text-text-secondary">
            To change your email address, please contact MoveSmart support. Email updates require identity verification.
          </p>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="bg-white border border-border space-y-6">
          <h3 className="font-bold text-base text-text-primary">Account Security & Password</h3>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-4 pb-6 border-b border-border">
            <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">Change Password</h4>

            {passError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2 rounded-lg text-xs font-bold">
                ⚠️ {passError}
              </div>
            )}
            {passSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-lg text-xs font-bold">
                ✅ {passSuccess}
              </div>
            )}

            <div className="space-y-3">
              <Input
                label="Current / Old Password"
                type="password"
                placeholder="Enter current password"
                value={passState.old_password}
                onChange={(e) => setPassState({ ...passState, old_password: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={passState.new_password}
                  onChange={(e) => setPassState({ ...passState, new_password: e.target.value })}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passState.confirm_password}
                  onChange={(e) => setPassState({ ...passState, confirm_password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" variant="primary" size="md" loading={passLoading}>
                🔒 Update Password
              </Button>
            </div>
          </form>

          {/* Danger Zone: Account Deletion */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-rose-600 uppercase tracking-wider">Danger Zone</h4>
            <div className="border border-rose-200 bg-rose-50/70 rounded-xl p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-rose-900">Permanent Account Deletion</p>
                <p className="text-xs text-rose-700 mt-0.5">
                  Deleting your account is permanent and cannot be undone. All saved properties, preferences, visit requests, and messages will be permanently removed.
                </p>
              </div>

              {deleteError && (
                <div className="bg-rose-100 border border-rose-300 text-rose-900 px-3.5 py-2 rounded-lg text-xs font-bold">
                  ⚠️ {deleteError}
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="space-y-3">
                <Input
                  label="Confirm Password to Delete Account"
                  type="password"
                  placeholder="Enter your account password"
                  value={deletePass}
                  onChange={(e) => setDeletePass(e.target.value)}
                />

                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={deleteConfirmed}
                    onChange={(e) => setDeleteConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-rose-900 select-none">
                    I understand that deleting my account is permanent and cannot be undone.
                  </span>
                </label>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="danger"
                    size="md"
                    loading={deleteLoading}
                    disabled={!deletePass || !deleteConfirmed || deleteLoading}
                    className="w-full sm:w-auto font-bold shadow-sm"
                  >
                    🗑️ Delete Account Permanently
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
