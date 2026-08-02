// hooks/useAuth.js — Custom hook for consuming AuthContext (Architecture.md §5, Rules.md §6)
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// TODO: return { user, role, isAuthenticated, login, logout, register, setRole } from AuthContext
// TODO: throw an error if used outside AuthProvider
export function useAuth() {
  const context = useContext(AuthContext);
  // TODO: if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
