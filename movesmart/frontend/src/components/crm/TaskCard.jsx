// src/components/crm/TaskCard.jsx — Task Item Component
import React from 'react';
import Card from '../common/Card';

const PRIORITY_BADGES = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-amber-100 text-amber-700 border-amber-200',
  medium: 'bg-blue-100 text-blue-700 border-blue-200',
  low: 'bg-gray-100 text-gray-700 border-gray-200'
};

export default function TaskCard({ task, onToggleStatus, onDelete }) {
  const isCompleted = task.status === 'completed';

  return (
    <Card className={`p-4 bg-white border border-[#D9D9D9] flex items-start justify-between gap-3 ${isCompleted ? 'opacity-60 bg-[#EEEEEE]/40' : ''}`}>
      <div className="flex items-start space-x-3 flex-1">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggleStatus(task._id, isCompleted ? 'todo' : 'completed')}
          className="mt-1 h-4 w-4 text-[#00ADB5] rounded border-[#D9D9D9] focus:ring-[#00ADB5]"
        />
        <div className="space-y-1 flex-1">
          <div className="flex items-center space-x-2">
            <h4 className={`font-bold text-sm text-[#222831] ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h4>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium}`}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-[#393E46] line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center space-x-4 text-[11px] text-[#393E46] pt-1">
            <span>📅 Due: {task.due_date || 'Today'}</span>
            <span className="capitalize font-semibold">Status: {task.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(task._id)}
        className="text-gray-400 hover:text-red-600 font-bold text-xs p-1"
        title="Delete Task"
      >
        ✕
      </button>
    </Card>
  );
}
