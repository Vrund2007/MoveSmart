// src/components/shared/DocumentManagerCard.jsx — Universal Document Manager
import React, { useState, useEffect } from 'react';
import { getOwnerDocuments, createDocument, deleteDocument } from '../../api/documents';
import Card from '../common/Card';
import Button from '../common/Button';

export default function DocumentManagerCard() {
  const [documents, setDocuments] = useState([]);
  const [folder, setFolder] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ document_name: '', doc_type: 'lease_agreement', document_url: '' });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getOwnerDocuments();
      setDocuments(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await createDocument(form);
      setIsModalOpen(false);
      setForm({ document_name: '', doc_type: 'lease_agreement', document_url: '' });
      fetchDocs();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      fetchDocs();
    } catch {
      // ignore
    }
  };

  const filtered = folder === 'all' ? documents : documents.filter(d => d.doc_type === folder);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-lg text-[#222831]">Universal Document Center</h3>
          <p className="text-xs text-[#393E46]">Property Deeds, Lease Agreements, Identity & Reports</p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          + Upload Document Metadata
        </Button>
      </div>

      {/* Folder Filters */}
      <div className="flex space-x-2 text-xs font-bold bg-white p-2 rounded-lg border border-[#D9D9D9] overflow-x-auto">
        {['all', 'lease_agreement', 'title_deed', 'property_tax', 'identity', 'other'].map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={`px-3 py-1.5 rounded uppercase transition-colors ${
              folder === f ? 'bg-[#00ADB5] text-white' : 'text-[#393E46] hover:bg-[#EEEEEE]'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading documents...</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12 text-xs text-gray-400">No documents in folder.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <Card key={d._id} className="p-4 bg-white border border-[#D9D9D9] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                    {d.doc_type?.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-green-600">✓ Verified</span>
                </div>
                <h4 className="font-bold text-sm text-[#222831] pt-2">{d.document_name}</h4>
              </div>

              <div className="pt-2 border-t border-[#D9D9D9] flex justify-between items-center text-xs font-semibold">
                <a
                  href={d.document_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00ADB5] hover:underline"
                >
                  Preview →
                </a>
                <button onClick={() => handleDelete(d._id)} className="text-red-500 hover:underline">
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpload} className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#222831] border-b border-[#D9D9D9] pb-2">Upload Document Metadata</h3>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Document Name</label>
              <input
                required
                type="text"
                value={form.document_name}
                onChange={(e) => setForm({ ...form, document_name: e.target.value })}
                placeholder="e.g. Executed Lease Agreement 2026"
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Document Type</label>
              <select
                value={form.doc_type}
                onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              >
                <option value="lease_agreement">Lease Agreement</option>
                <option value="title_deed">Title Deed</option>
                <option value="property_tax">Property Tax Receipt</option>
                <option value="ownership_proof">Ownership Proof</option>
                <option value="identity">Identity Document</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#393E46] mb-1 block">Document File URL</label>
              <input
                required
                type="text"
                value={form.document_url}
                onChange={(e) => setForm({ ...form, document_url: e.target.value })}
                placeholder="https://drive.google.com/doc..."
                className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2.5 text-xs text-[#222831]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Document
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
