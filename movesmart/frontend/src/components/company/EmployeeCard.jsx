// src/components/company/EmployeeCard.jsx — Employee Card & Detail Workspace Modal
import React, { useState } from 'react';
import Card from '../common/Card';

const STATUS_BADGES = {
  initiated: 'bg-amber-100 text-amber-700 border-amber-200',
  broker_assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  property_shortlisted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  visit_scheduled: 'bg-purple-100 text-purple-700 border-purple-200',
  approved: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  moved: 'bg-green-100 text-green-700 border-green-200'
};

export default function EmployeeCard({ employee, onEdit, onDelete, onAssignBroker }) {
  const [showWorkspace, setShowWorkspace] = useState(false);

  return (
    <>
      <Card className="flex flex-col justify-between h-full bg-white relative hover:shadow-md transition-shadow border border-[#D9D9D9]">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-sm text-[#222831]">{employee.name}</h4>
              <span className="text-[10px] text-gray-500 font-mono">ID: {employee.employee_id}</span>
            </div>

            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${STATUS_BADGES[employee.relocation_status] || STATUS_BADGES.initiated}`}>
              {(employee.relocation_status || employee.relocation_stage || 'initiated').replace(/_/g, ' ')}
            </span>
          </div>

          <div className="space-y-1 mb-3 text-xs text-[#393E46]">
            <p className="font-semibold text-gray-600">{employee.designation} • <span className="text-[#222831] font-bold">{employee.department}</span></p>
            <p className="font-bold text-[#00ADB5]">Budget: ₹{employee.housing_budget?.toLocaleString()} <span className="font-normal text-gray-500">/ mo</span></p>
            <p className="text-[11px] truncate">🏢 Office: {employee.office_location || 'Ahmedabad HQ'}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#D9D9D9] flex justify-between items-center text-xs">
          <button onClick={() => setShowWorkspace(true)} className="font-bold text-[#00ADB5] hover:underline">
            Workspace →
          </button>
          <div className="space-x-2">
            {onAssignBroker && (
              <button onClick={() => onAssignBroker(employee)} className="text-blue-600 font-semibold hover:underline">
                Assign Broker
              </button>
            )}
            <button onClick={() => onEdit(employee)} className="text-gray-600 hover:text-black font-semibold">
              Edit
            </button>
            <button onClick={() => onDelete(employee)} className="text-red-500 hover:text-red-700 font-semibold">
              Delete
            </button>
          </div>
        </div>
      </Card>

      {/* Employee Detail Workspace Modal */}
      {showWorkspace && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b border-[#D9D9D9] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#222831]">{employee.name}</h3>
                <p className="text-xs text-[#393E46]">{employee.designation} • {employee.department} ({employee.employee_id})</p>
              </div>
              <button onClick={() => setShowWorkspace(false)} className="text-gray-400 hover:text-black font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#EEEEEE]/50 p-3 rounded-lg border border-[#D9D9D9]">
              <div>
                <span className="text-gray-500 block font-semibold">Contact Email</span>
                <span className="font-bold text-[#222831]">{employee.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold">Phone</span>
                <span className="font-bold text-[#222831]">{employee.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold">Monthly Housing Budget</span>
                <span className="font-bold text-[#00ADB5] text-sm">₹{employee.housing_budget?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold">Lifestyle Preference</span>
                <span className="font-bold capitalize">{employee.lifestyle_preference || 'Quiet'}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold">Office Location</span>
                <span className="font-bold">{employee.office_location || 'Ahmedabad HQ'}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-semibold">Joining Date</span>
                <span className="font-bold">{employee.joining_date || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#222831] uppercase tracking-wider">Assigned Integration Links</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-gray-500 block font-semibold">Assigned Broker</span>
                  <span className="font-bold text-blue-700">{employee.assigned_broker_id ? `Broker ID: ${employee.assigned_broker_id}` : 'Unassigned'}</span>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-gray-500 block font-semibold">Allocated Property</span>
                  <span className="font-bold text-green-700">{employee.allocated_listing_id ? `Property ID: ${employee.allocated_listing_id}` : 'Not Allocated'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9D9D9] flex justify-end">
              <button
                onClick={() => setShowWorkspace(false)}
                className="bg-[#393E46] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#222831]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
