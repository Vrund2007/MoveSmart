// src/pages/Messages.jsx — Dedicated Universal Messaging Portal Page
import React from 'react';
import UniversalChatWindow from '../components/shared/UniversalChatWindow';

export default function Messages() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-[#222831]">Universal Messaging Network</h2>
          <p className="text-xs text-[#393E46]">Connect with Seekers, Landlords, Brokers, HR Managers & Admins.</p>
        </div>
      </div>
      <UniversalChatWindow />
    </div>
  );
}
