// src/pages/Search.jsx — Dedicated Global Search Page
import React from 'react';
import GlobalSearchBar from '../components/shared/GlobalSearchBar';

export default function Search() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[#222831]">Global Platform Search</h2>
        <p className="text-xs text-[#393E46]">Search properties, clients, employees, documents, and messages.</p>
      </div>
      <GlobalSearchBar />
    </div>
  );
}
