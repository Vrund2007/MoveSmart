// src/components/company/ApprovalCard.jsx — Interactive Enterprise Approval Card
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function ApprovalCard({ approval, onProcessApproval }) {
  const [reasonInput, setReasonInput] = useState('');
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const handleAction = (status) => {
    if (status === 'approved') {
      onProcessApproval(approval._id, 'approved', '');
    } else {
      setPendingAction(status);
      setShowReasonBox(true);
    }
  };

  const handleReasonSubmit = (e) => {
    e.preventDefault();
    if (!pendingAction) return;
    onProcessApproval(approval._id, pendingAction, reasonInput.trim());
    setShowReasonBox(false);
    setReasonInput('');
    setPendingAction(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'needs_revision':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <Card className="p-4 bg-white border border-[#D9D9D9] space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00ADB5] block">
            {approval.approval_type?.replace('_', ' ')}
          </span>
          <h4 className="font-bold text-sm text-[#222831]">Employee ID: {approval.employee_id}</h4>
        </div>

        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${getStatusBadge(approval.status)}`}>
          {approval.status}
        </span>
      </div>

      {approval.reason && (
        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 italic">
          "{approval.reason}"
        </p>
      )}

      {approval.status === 'pending' && !showReasonBox && (
        <div className="pt-2 border-t border-[#D9D9D9] flex justify-end space-x-2 text-xs font-semibold">
          <button
            onClick={() => handleAction('approved')}
            className="bg-green-600 text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => handleAction('needs_revision')}
            className="bg-amber-500 text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-amber-600"
          >
            Request Revision
          </button>
          <button
            onClick={() => handleAction('rejected')}
            className="bg-red-600 text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      )}

      {showReasonBox && (
        <form onSubmit={handleReasonSubmit} className="pt-2 space-y-2 border-t border-[#D9D9D9]">
          <label className="text-[11px] font-semibold text-[#393E46] block">
            Reason for {pendingAction?.replace('_', ' ')}:
          </label>
          <input
            required
            type="text"
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder="Provide decision rationale..."
            className="w-full bg-[#EEEEEE] border border-[#D9D9D9] rounded p-2 text-xs text-[#222831]"
          />
          <div className="flex justify-end space-x-2 pt-1">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowReasonBox(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm {pendingAction}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
