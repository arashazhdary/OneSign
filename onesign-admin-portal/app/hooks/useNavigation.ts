'use client';

/**
 * useNavigation Hook
 * Custom hook for managing navigation state
 */

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Notification, User, Tenant } from '../types/navigation';

interface UseNavigationOptions {
  initialTheme?: 'light' | 'dark';
  initialLanguage?: string;
  onThemeChange?: (theme: 'light' | 'dark') => void;
  onLanguageChange?: (language: string) => void;
}

export function useNavigation(options: UseNavigationOptions = {}) {
  const {
    initialTheme = 'light',
    initialLanguage = 'en',
    onThemeChange,
    onLanguageChange,
  } = options;

  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const [language, setLanguage] = useState(initialLanguage);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else if (prefersDark) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Initialize language from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') || initialLanguage;
      setLanguage(savedLanguage);
    }
  }, [initialLanguage]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    onThemeChange?.(newTheme);
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    onLanguageChange?.(newLanguage);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return {
    // State
    theme,
    language,
    pathname,
    isSidebarCollapsed,
    isMobileSidebarOpen,

    // Actions
    setTheme,
    setLanguage,
    toggleTheme,
    changeLanguage,
    toggleSidebar,
    toggleMobileSidebar,
    setIsSidebarCollapsed,
    setIsMobileSidebarOpen,
  };
}

/**
 * useNotifications Hook
 * Manage notifications state
 */
export function useNotifications(initialNotifications: Notification[] = []) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
    removeNotification,
    setNotifications,
  };
}

/**
 * useTenant Hook
 * Manage tenant/organization switching
 */
export function useTenant(
  initialTenant?: Tenant,
  availableTenants: Tenant[] = []
) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | undefined>(
    initialTenant
  );

  const switchTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentTenantId', tenant.id);
    }
  };

  // Load tenant from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialTenant && availableTenants.length > 0) {
      const savedTenantId = localStorage.getItem('currentTenantId');
      if (savedTenantId) {
        const savedTenant = availableTenants.find((t) => t.id === savedTenantId);
        if (savedTenant) {
          setCurrentTenant(savedTenant);
        }
      }
    }
  }, [initialTenant, availableTenants]);

  return {
    currentTenant,
    availableTenants,
    switchTenant,
    setCurrentTenant,
  };
}
