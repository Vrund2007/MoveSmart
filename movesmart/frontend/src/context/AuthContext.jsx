// context/AuthContext.jsx — Auth context carrying user identity and role (PRD §6, Architecture.md §4.0)
// role field is set once at signup and is immutable from the client thereafter (FR-1)
// admin role is never set through the public flow (FR-2)
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

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
      const { user: userData, access, refresh } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.email?.[0] || 'Login failed.';
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
      const { user: userData, access, refresh } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const errors = err.response?.data || {};
      const msg = errors.detail || errors.email || errors.confirm_password || 'Registration failed.';
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
      const updatedUser = res.data.user;
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.role?.[0] || 'Failed to set role.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Update Profile: PUT /api/auth/profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      const updatedUser = res.data.user;
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update profile.';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
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
