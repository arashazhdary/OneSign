import React, { createContext, useContext, ReactNode } from 'react';
import { OnesignConfig } from '../types';
import { useOnesignAuth } from '../hooks/useOnesignAuth';

interface OnesignContextType {
  login: () => void;
  logout: () => void;
  handleCallback: (code: string, state?: string) => Promise<any>;
  tokenInfo: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const OnesignContext = createContext<OnesignContextType | undefined>(undefined);

export function OnesignProvider({
  config,
  children
}: {
  config: OnesignConfig;
  children: ReactNode;
}) {
  const auth = useOnesignAuth(config);

  return (
    <OnesignContext.Provider value={auth}>
      {children}
    </OnesignContext.Provider>
  );
}

export function useOnesign() {
  const context = useContext(OnesignContext);
  if (context === undefined) {
    throw new Error('useOnesign must be used within OnesignProvider');
  }
  return context;
}

