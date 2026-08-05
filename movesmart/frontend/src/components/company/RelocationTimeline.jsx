// src/components/company/RelocationTimeline.jsx — Milestone Progress Timeline
import React from 'react';
import Card from '../common/Card';

const MILESTONES = [
  { id: 'initiated', label: 'Offer Accepted' },
  { id: 'broker_assigned', label: 'Broker Assigned' },
  { id: 'property_shortlisted', label: 'Property Shortlisted' },
  { id: 'visit_scheduled', label: 'Visits Scheduled' },
  { id: 'property_selected', label: 'Property Selected' },
  { id: 'approved', label: 'Approval Complete' },
  { id: 'moved', label: 'Move Completed' }
];

export default function RelocationTimeline({ currentStatus = 'initiated', employeeName = '' }) {
  const currentIdx = MILESTONES.findIndex(m => m.id === currentStatus);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <Card className="p-5 bg-white border border-[#D9D9D9] space-y-4">
      <div className="flex justify-between items-center border-b border-[#D9D9D9] pb-3">
        <h4 className="font-bold text-sm text-[#222831]">
          Relocation Milestone Progression {employeeName ? `— ${employeeName}` : ''}
        </h4>
        <span className="text-xs font-bold text-[#00ADB5] uppercase">
          Stage {activeIdx + 1} of {MILESTONES.length}
        </span>
      </div>

      <div className="relative flex items-center justify-between pt-2 pb-4 px-2">
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-[#EEEEEE] -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-4 h-1 bg-[#00ADB5] -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(activeIdx / (MILESTONES.length - 1)) * 95}%` }}
        />

        {MILESTONES.map((m, idx) => {
          const isPassed = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          return (
            <div key={m.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                  isCurrent ? 'bg-[#00ADB5] text-white border-[#00ADB5] ring-4 ring-[#00ADB5]/20' :
                  isPassed ? 'bg-[#00ADB5] text-white border-[#00ADB5]' :
                  'bg-white text-gray-400 border-[#D9D9D9]'
                }`}
              >
                {isPassed ? '✓' : idx + 1}
              </div>
              <span className={`text-[10px] font-semibold mt-2 text-center max-w-[70px] ${isCurrent ? 'text-[#00ADB5] font-extrabold' : isPassed ? 'text-[#222831]' : 'text-gray-400'}`}>
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
