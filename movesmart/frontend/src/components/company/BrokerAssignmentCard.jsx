// src/components/company/BrokerAssignmentCard.jsx — Broker Assignment Item
import React from 'react';
import Card from '../common/Card';

export default function BrokerAssignmentCard({ assignment, onUpdateStatus }) {
  return (
    <Card className="p-4 bg-white border border-[#D9D9D9] flex flex-col justify-between space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold text-[#00ADB5] uppercase tracking-wider block">Broker Assignment</span>
          <h4 className="font-bold text-sm text-[#222831]">Employee ID: {assignment.employee_id}</h4>
        </div>

        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${
          assignment.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
          assignment.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
          'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
          {assignment.status}
        </span>
      </div>

      <div className="text-xs text-[#393E46] space-y-1 bg-[#EEEEEE]/40 p-2.5 rounded border border-[#D9D9D9]">
        <p>🤝 <strong>Broker Partner ID:</strong> {assignment.broker_id}</p>
        <p>📅 <strong>Assigned Date:</strong> {assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : 'Today'}</p>
        {assignment.notes && <p className="italic text-gray-500">"{assignment.notes}"</p>}
      </div>

      <div className="pt-2 border-t border-[#D9D9D9] flex justify-end space-x-2 text-xs font-semibold">
        {assignment.status === 'active' && (
          <button
            onClick={() => onUpdateStatus(assignment._id, 'completed')}
            className="bg-blue-600 text-white px-2.5 py-1 rounded text-[10px] font-bold hover:bg-blue-700"
          >
            Mark Completed
          </button>
        )}
        {assignment.status !== 'cancelled' && (
          <button
            onClick={() => onUpdateStatus(assignment._id, 'cancelled')}
            className="bg-red-100 text-red-700 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-red-200"
          >
            Cancel Assignment
          </button>
        )}
      </div>
    </Card>
  );
}
