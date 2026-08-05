// src/components/admin/PlatformSettingsForm.jsx — Super Admin Platform Settings & Maintenance Mode
import React, { useState, useEffect } from 'react';
import { getPlatformSettings, updatePlatformSettings } from '../../api/platform';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

export default function PlatformSettingsForm() {
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    auto_approve_listings: false,
    max_upload_size_mb: 10,
    gemini_enabled: true,
    gemini_daily_quota: 10000
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getPlatformSettings();
      const payload = res.data || res;
      setSettings({
        maintenance_mode: Boolean(payload.maintenance_mode),
        auto_approve_listings: Boolean(payload.auto_approve_listings),
        max_upload_size_mb: Number(payload.max_upload_size_mb || 10),
        gemini_enabled: Boolean(payload.gemini_enabled !== false),
        gemini_daily_quota: Number(payload.gemini_daily_quota || 10000)
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updatePlatformSettings(settings);
      alert('Global platform settings saved successfully.');
      fetchSettings();
    } catch {
      alert('Failed to update platform settings.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
        <h3 className="font-extrabold text-base text-[#222831] border-b border-[#D9D9D9] pb-2">
          Global Platform Configuration & Maintenance
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-500">Loading settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-[#393E46]">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-amber-900">Enable Platform Maintenance Mode</span>
              </label>
              <p className="text-[10px] text-amber-700">
                When enabled, non-admin users receive a maintenance notice.
              </p>
            </div>

            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-[#EEEEEE]/50 rounded border">
              <input
                type="checkbox"
                checked={settings.auto_approve_listings}
                onChange={(e) => setSettings({ ...settings, auto_approve_listings: e.target.checked })}
                className="rounded text-[#00ADB5] focus:ring-[#00ADB5]"
              />
              <span className="font-semibold text-[#222831]">Auto-Approve Property Listings (Bypass Queue)</span>
            </label>

            <Input
              label="Max File Upload Limit (MB)"
              type="number"
              value={settings.max_upload_size_mb}
              onChange={(e) => setSettings({ ...settings, max_upload_size_mb: e.target.value })}
            />

            <div className="pt-2 border-t border-[#D9D9D9] space-y-3">
              <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider">AI & ML Settings</h4>

              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-[#EEEEEE]/50 rounded border">
                <input
                  type="checkbox"
                  checked={settings.gemini_enabled}
                  onChange={(e) => setSettings({ ...settings, gemini_enabled: e.target.checked })}
                  className="rounded text-[#00ADB5] focus:ring-[#00ADB5]"
                />
                <span className="font-semibold text-[#222831]">Enable Google Gemini AI Assistant Services</span>
              </label>

              <Input
                label="Gemini AI Daily Quota Request Limit"
                type="number"
                value={settings.gemini_daily_quota}
                onChange={(e) => setSettings({ ...settings, gemini_daily_quota: e.target.value })}
              />
            </div>

            <Button type="submit" variant="primary" loading={submitting} className="w-full">
              Save Global Settings
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
