// context/AuthContext.jsx — Auth context carrying user identity and role (PRD §6, Architecture.md §4.0)
// role field is set once at signup and is immutable from the client thereafter (FR-1)
// admin role is never set through the public flow (FR-2)
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { getUserProfile, logoutUser } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Helper to extract response payload safely (handles api_response wrapped and direct formats)
  const extractData = (res) => (res.data && res.data.data ? res.data.data : res.data);

  // Restore user session on initial mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await getUserProfile();
          const payload = extractData({ data: res });
          if (payload && payload.user) {
            setUser(payload.user);
            localStorage.setItem('user', JSON.stringify(payload.user));
          }
        } catch (err) {
          // Token invalid or expired — clear local storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Login: POST /api/auth/login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const payload = extractData(res);
      const { user: userData, access, refresh } = payload;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || data?.detail || data?.errors?.detail || 'Login failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Register: POST /api/auth/register
  const register = async (name, email, password, confirmPassword) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        confirm_password: confirmPassword,
      });
      const payload = extractData(res);
      const { user: userData, access, refresh } = payload;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const data = err.response?.data;
      const errors = data?.errors || data || {};
      const msg = data?.message || errors.detail || errors.email || errors.confirm_password || 'Registration failed.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Set Role: PATCH /api/auth/role (FR-1 & FR-2)
  const setRole = async (role) => {
    setLoading(true);
    try {
      const res = await api.patch('/auth/role', { role });
      const payload = extractData(res);
      const updatedUser = payload.user;
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || data?.errors?.detail || data?.errors?.role?.[0] || 'Failed to set role.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile: PUT /api/profile or /api/auth/profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await api.put('/profile', profileData);
      const payload = extractData(res);
      const updatedUser = payload.user;
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message || data?.errors?.detail || 'Failed to update profile.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user && !!localStorage.getItem('access_token'),
        login,
        register,
        setRole,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
