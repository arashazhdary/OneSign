'use client';

import { createContext, useState, useCallback, ReactNode } from 'react';

export interface Modal {
  id: string;
  isOpen: boolean;
  data?: any;
}

export interface UIContextType {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modals
  modals: Record<string, Modal>;
  openModal: (id: string, data?: any) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
  getModalData: (id: string) => any;

  // Loading states
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;

  // Global loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

/**
 * UI Context Provider
 *
 * @example
 * <UIProvider>
 *   <App />
 * </UIProvider>
 */
export function UIProvider({ children }: UIProviderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modals, setModals] = useState<Record<string, Modal>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [globalLoading, setGlobalLoading] = useState(false);

  // Sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Modals
  const openModal = useCallback((id: string, data?: any) => {
    setModals((prev) => ({
      ...prev,
      [id]: { id, isOpen: true, data },
    }));
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
  }, []);

  const isModalOpen = useCallback(
    (id: string) => {
      return modals[id]?.isOpen || false;
    },
    [modals]
  );

  const getModalData = useCallback(
    (id: string) => {
      return modals[id]?.data;
    },
    [modals]
  );

  // Loading states
  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return loadingStates[key] || false;
    },
    [loadingStates]
  );

  const value: UIContextType = {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    modals,
    openModal,
    closeModal,
    isModalOpen,
    getModalData,
    loadingStates,
    setLoading,
    isLoading,
    globalLoading,
    setGlobalLoading,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
