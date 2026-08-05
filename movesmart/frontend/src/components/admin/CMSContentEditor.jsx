// src/components/admin/CMSContentEditor.jsx — Super Admin CMS Content Manager Component
import React, { useState, useEffect } from 'react';
import { getCMSPage, updateCMSPage } from '../../api/cms';
import Card from '../common/Card';
import Button from '../common/Button';

export default function CMSContentEditor() {
  const [selectedSlug, setSelectedSlug] = useState('faqs');
  const [pageData, setPageData] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCMS = async (slug) => {
    setLoading(true);
    try {
      const res = await getCMSPage(slug);
      const payload = res.data || res;
      setPageData(payload);
      setJsonText(JSON.stringify(payload.content || {}, null, 2));
    } catch {
      setPageData(null);
      setJsonText('{}');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMS(selectedSlug);
  }, [selectedSlug]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsedContent = JSON.parse(jsonText);
      await updateCMSPage(selectedSlug, pageData?.title || selectedSlug, parsedContent);
      alert(`CMS content for '${selectedSlug}' updated successfully.`);
      fetchCMS(selectedSlug);
    } catch (err) {
      alert('Invalid JSON content format or update error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-[#D9D9D9]">
        <div>
          <h3 className="font-extrabold text-base text-[#222831]">CMS Content Manager</h3>
          <p className="text-xs text-[#393E46]">Manage homepage banners, FAQs, terms of service & announcements.</p>
        </div>

        <div className="flex space-x-2 text-xs font-bold">
          {['faqs', 'homepage_banners', 'terms', 'privacy', 'announcements'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSlug(s)}
              className={`px-3 py-1.5 rounded uppercase transition-colors ${
                selectedSlug === s ? 'bg-[#00ADB5] text-white' : 'bg-[#EEEEEE] text-[#393E46] hover:bg-gray-300'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading CMS page...</div>
      ) : (
        <Card className="p-6 bg-white border border-[#D9D9D9] space-y-4">
          <h4 className="font-bold text-sm text-[#222831]">
            Editing Slug: <span className="text-[#00ADB5] font-mono">{selectedSlug}</span>
          </h4>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">JSON Page Content Payload</label>
              <textarea
                required
                rows={12}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-4 text-xs font-mono text-[#222831] focus:ring-1 focus:ring-[#00ADB5]"
              />
            </div>

            <Button type="submit" variant="primary" loading={submitting}>
              Save CMS Page Content
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
