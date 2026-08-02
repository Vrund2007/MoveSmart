// context/ProfileContext.jsx — User profile context for role-specific profile data (Architecture.md §4.1, PRD §7.1)
// Carries: Find Accommodation profile (salary, work_location, rent_budget, lifestyle_pref, commute_tolerance)
//          and Company/HR office_locations profile data
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../lib/api';

export const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data.user?.role_profile || {});
      return { success: true, profile: res.data.user?.role_profile };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Failed to load profile.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (data) => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', data);
      setProfile(res.data.user?.role_profile || {});
      return { success: true, profile: res.data.user?.role_profile };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Failed to update profile.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loadProfile, updateProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
