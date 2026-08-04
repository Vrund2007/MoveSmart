// src/pages/Profile.jsx — Comprehensive Seeker Profile & Settings Manager
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updateRoleProfile, getUserProfile } from '../api/profile';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FURNISHING_OPTIONS = ['Any', 'Unfurnished', 'Semi-Furnished', 'Fully-Furnished'];
const LIFESTYLE_OPTIONS = ['Peaceful', 'Vibrant', 'Student-Friendly', 'Family-Oriented', 'Pet-Friendly'];
const COMMUTE_MODES = ['Car', 'Public Transport', 'Walking', 'Bike'];

function ProfileCompletionBar({ user }) {
  const fields = [
    user?.email,
    user?.role_profile?.preferred_localities?.length > 0,
    user?.role_profile?.max_budget,
    user?.role_profile?.preferred_bhk,
    user?.role_profile?.lifestyle_preference,
    user?.role_profile?.commute_mode,
    user?.role_profile?.work_area,
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
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('preferences');

  const [prefs, setPrefs] = useState({
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
    if (user?.role_profile) {
      const rp = user.role_profile;
      setPrefs({
        max_budget: rp.max_budget || '',
        preferred_bhk: rp.preferred_bhk || '',
        preferred_localities: Array.isArray(rp.preferred_localities) ? rp.preferred_localities.join(', ') : (rp.preferred_localities || ''),
        preferred_furnishing: rp.preferred_furnishing || 'Any',
        lifestyle_preference: rp.lifestyle_preference || 'Peaceful',
        commute_mode: rp.commute_mode || 'Public Transport',
        work_area: rp.work_area || '',
        max_commute_minutes: rp.max_commute_minutes || 45,
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      const payload = {
        role: 'find_accommodation',
        role_profile: {
          max_budget: Number(prefs.max_budget) || null,
          preferred_bhk: Number(prefs.preferred_bhk) || null,
          preferred_localities: prefs.preferred_localities
            ? prefs.preferred_localities.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          preferred_furnishing: prefs.preferred_furnishing,
          lifestyle_preference: prefs.lifestyle_preference,
          commute_mode: prefs.commute_mode,
          work_area: prefs.work_area,
          max_commute_minutes: Number(prefs.max_commute_minutes) || 45,
        }
      };
      await updateRoleProfile(payload);
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
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-text-primary">{user?.email}</h2>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
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
            <h3 className="font-bold text-sm text-text-primary">Housing Preferences</h3>

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

            <h3 className="font-bold text-sm text-text-primary pt-2 border-t border-border">Commute Preferences</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Work / Destination Area"
                placeholder="e.g. Navrangpura"
                value={prefs.work_area}
                onChange={(e) => setPrefs({ ...prefs, work_area: e.target.value })}
              />
              <Input
                label="Max Commute Time (minutes)"
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
        <Card className="bg-white border border-border space-y-5">
          <h3 className="font-bold text-sm text-text-primary">Account Security</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800 font-medium">
            🔒 Password changes are performed through the authentication system. Log out and use the Forgot Password flow to reset your password securely.
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary mb-2">Active Sessions</h4>
            <div className="bg-surface border border-border p-3 rounded-lg text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Current Session</span>
                <span className="text-emerald-600 font-bold">Active Now</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-600 mb-2">Danger Zone</h4>
            <div className="border border-rose-200 bg-rose-50 rounded-lg p-4 space-y-2">
              <p className="text-xs text-rose-700">Deleting your account is permanent and cannot be undone. All saved properties, visit requests, and messages will be removed.</p>
              <Button variant="danger" size="sm" onClick={() => alert('Account deletion requires email confirmation. This feature contacts support@movesmart.in')}>
                Request Account Deletion
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
