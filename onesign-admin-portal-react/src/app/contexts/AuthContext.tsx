import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { User, Tenant } from '@/types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, tenant?: Tenant) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authStore = useAuthStore();

  return (
    <AuthContext.Provider value={authStore}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return from zustand store directly if no provider
    return useAuthStore();
  }
  return context;
};

export default AuthContext;
