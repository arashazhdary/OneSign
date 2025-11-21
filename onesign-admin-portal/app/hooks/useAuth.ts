'use client';

import { useContext } from 'react';
import { AuthContext } from '@/app/contexts/AuthContext';

/**
 * Hook for accessing authentication state
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <LoginPage />;
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
