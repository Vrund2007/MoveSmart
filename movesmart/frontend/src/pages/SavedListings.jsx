// pages/SavedListings.jsx — Saved/bookmarked listings for Find Accommodation user (PRD §7.1, Architecture.md §4.1)
import React from 'react';
import { Navigate } from 'react-router-dom';

function SavedListings() {
  return <Navigate to="/dashboard?tab=saved" replace />;
}
export default SavedListings;

