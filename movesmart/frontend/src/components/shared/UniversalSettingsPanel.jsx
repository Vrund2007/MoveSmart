// src/components/shared/UniversalSettingsPanel.jsx — Universal Settings Component
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

export default function UniversalSettingsPanel() {
  const { user } = useContext(AuthContext);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new_password: '', confirm: '' });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm) {
      alert('Passwords do not match.');
      return;
    }
    alert('Security credentials updated successfully.');
    setPasswordForm({ current: '', new_password: '', confirm: '' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
        <h3 className="font-extrabold text-base text-[#222831] border-b border-[#D9D9D9] pb-2">
          Account Profile & Security Settings
        </h3>

        <div className="text-xs text-[#393E46] space-y-1">
          <p>Logged in as: <strong className="text-[#222831] font-bold">{user?.email}</strong></p>
          <p>Account Role: <strong className="text-[#00ADB5] uppercase font-extrabold">{user?.role}</strong></p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
          <Input
            label="Current Password"
            type="password"
            required
            value={passwordForm.current}
            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
          />
          <Input
            label="New Password"
            type="password"
            required
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
          />
          <Input
            label="Confirm New Password"
            type="password"
            required
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
          />
          <Button type="submit" variant="primary" className="w-full">
            Update Security Password
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
        <h3 className="font-extrabold text-base text-[#222831] border-b border-[#D9D9D9] pb-2">
          Universal Notification Preferences
        </h3>

        <div className="space-y-3 text-xs text-[#393E46]">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="rounded text-[#00ADB5] focus:ring-[#00ADB5]"
            />
            <span>Receive email notifications for visits, approvals, and messages</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={smsNotifs}
              onChange={(e) => setSmsNotifs(e.target.checked)}
              className="rounded text-[#00ADB5] focus:ring-[#00ADB5]"
            />
            <span>Receive SMS text alerts for urgent reminders</span>
          </label>
        </div>
      </Card>
    </div>
  );
}
