// src/pages/Notifications.jsx — Dedicated Notification Center Page
import React from 'react';
import NotificationDrawer from '../components/shared/NotificationDrawer';

export default function Notifications() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-extrabold text-[#222831]">Platform Notification Center</h2>
      <p className="text-xs text-[#393E46]">Manage alerts, visit updates, approval requests, and system reminders.</p>
      <NotificationDrawer isOpen={true} onClose={() => window.history.back()} />
    </div>
  );
}
