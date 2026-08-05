// src/pages/Calendar.jsx — Dedicated Universal Calendar Page
import React from 'react';
import UniversalCalendarWidget from '../components/shared/UniversalCalendarWidget';

export default function Calendar() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <UniversalCalendarWidget />
    </div>
  );
}
