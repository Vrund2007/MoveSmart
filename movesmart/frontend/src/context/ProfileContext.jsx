// context/ProfileContext.jsx — User profile context for role-specific profile data (Architecture.md §4.1, PRD §7.1)
// Carries: Find Accommodation profile (salary, work_location, rent_budget, lifestyle_pref, commute_tolerance)
//          and Company/HR office_locations profile data
import React, { createContext, useState } from 'react';

export const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  // profile shape depends on role — see database.md §3.1 role_profile shapes

  // TODO: implement loadProfile() — fetches GET /api/profile and stores in state
  // TODO: implement updateProfile(data) — calls PUT /api/profile and updates state

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
