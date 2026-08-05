// src/pages/Activity.jsx — Activity Timeline Audit Log Page
import React from 'react';
import ActivityTimeline from '../components/shared/ActivityTimeline';

export default function Activity() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <ActivityTimeline />
    </div>
  );
}
