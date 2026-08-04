// context/ProfileContext.jsx — User profile context for role-specific profile data (Architecture.md §4.1, PRD §7.1)
// Carries: Find Accommodation profile (salary, work_location, rent_budget, lifestyle_pref, commute_tolerance)
//          and Company/HR office_locations profile data
// context/ProfileContext.jsx — User profile context for role-specific profile data (Architecture.md §4.1, PRD §7.1)
import React, { createContext, useState, useEffect } from 'react';

export const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('movesmart_profile');
    if (saved) return JSON.parse(saved);
    
    // Default fallback seeker profile
    return {
      salary: 120000,
      work_location: 'Vastrapur',
      rent_budget: 35000,
      commute_tolerance: 20, // minutes
      family_status: 'family',
      bhk_pref: 3,
      lifestyle_pref: {
        safety: 5,
        schools: 4,
        greenery: 3,
        cost: 3,
      }
    };
  });

  const loadProfile = async () => {
    const saved = localStorage.getItem('movesmart_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  };

  const updateProfile = async (data) => {
    const updated = { ...profile, ...data };
    setProfile(updated);
    localStorage.setItem('movesmart_profile', JSON.stringify(updated));
    return updated;
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loadProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

