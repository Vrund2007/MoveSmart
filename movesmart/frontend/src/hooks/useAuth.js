import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for consuming AuthContext.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
