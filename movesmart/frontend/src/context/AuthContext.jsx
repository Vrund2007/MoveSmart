// context/AuthContext.jsx — Auth context carrying user identity and role (PRD §6, Architecture.md §4.0)
// role field is set once at signup and is immutable from the client thereafter (FR-1)
// admin role is never set through the public flow (FR-2)
// context/AuthContext.jsx — Auth context carrying user identity and role (PRD §6, Architecture.md §4.0)
// role field is set once at signup and is immutable from the client thereafter (FR-1)
// admin role is never set through the public flow (FR-2)
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('movesmart_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    // Simulated authentication success
    const mockUser = {
      id: 'usr-demo-123',
      email: email,
      role: email.includes('admin') ? 'admin' : (email.includes('owner') ? 'property_owner' : (email.includes('broker') ? 'broker' : (email.includes('hr') ? 'company_hr' : 'find_accommodation'))),
      token: 'mock-jwt-token-xyz-123'
    };
    setUser(mockUser);
    localStorage.setItem('movesmart_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('movesmart_user');
    localStorage.removeItem('movesmart_onboarding_completed');
  };

  const register = async (email, password, chosenRole = 'find_accommodation') => {
    const mockUser = {
      id: 'usr-new-' + Math.floor(Math.random() * 1000),
      email: email,
      role: chosenRole,
      token: 'mock-jwt-token-new-456'
    };
    setUser(mockUser);
    localStorage.setItem('movesmart_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const setRole = async (chosenRole) => {
    if (!user) return;
    // Exclude 'admin' from public role setting flow (FR-2)
    if (chosenRole === 'admin') return;

    const updatedUser = { ...user, role: chosenRole };
    setUser(updatedUser);
    localStorage.setItem('movesmart_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

