// context/AuthContext.jsx — Auth context carrying user identity and role (PRD §6, Architecture.md §4.0)
// role field is set once at signup and is immutable from the client thereafter (FR-1)
// admin role is never set through the public flow (FR-2)
import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // TODO: initialise from stored JWT on mount (decode token to extract role, userId, email)
  const [user, setUser] = useState(null);
  // user shape: { id, email, role: 'find_accommodation'|'property_owner'|'broker'|'company_hr'|'admin', token }

  // TODO: implement login(email, password) — calls api/auth.js, stores JWT, sets user state
  // TODO: implement logout() — clears JWT, resets user state
  // TODO: implement register(email, password) — calls api/auth.js, stores JWT
  // TODO: implement setRole(role) — calls PATCH /api/auth/role (once only), updates user.role

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
