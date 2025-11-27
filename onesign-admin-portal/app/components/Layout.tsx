'use client';

/**
 * Layout Component
 * Main application layout with sidebar, topbar, and content area
 * Includes responsive behavior and mobile menu support
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Icon } from './Icon';
import { User, Notification, Tenant } from '../types/navigation';

interface LayoutProps {
  children: React.ReactNode;
  user?: User;
  notifications?: Notification[];
  tenant?: Tenant;
  tenants?: Tenant[];
  onTenantChange?: (tenant: Tenant) => void;
  onLogout?: () => void;
  breadcrumbLabels?: Record<string, string>;
  className?: string;
  onNotificationMarkAsRead?: (id: string) => void;
  onNotificationMarkAllAsRead?: () => void;
  onNotificationClearAll?: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  notifications = [],
  tenant,
  tenants = [],
  onTenantChange,
  onLogout,
  breadcrumbLabels,
  className = '',
  onNotificationMarkAsRead,
  onNotificationMarkAllAsRead,
  onNotificationClearAll,
}) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState('en');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    // In a real app, you would trigger a locale change here
    // For example with next-intl: router.push(pathname, { locale: newLanguage })
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Implement search functionality
  };

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMobileSidebar && !target.closest('.mobile-sidebar') && !target.closest('.mobile-menu-button')) {
        setShowMobileSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileSidebar]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (showMobileSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileSidebar]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${className}`}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileSidebar(true)}
        className="mobile-menu-button fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
        aria-label="Open menu"
      >
        <Icon name="Bars3Icon" className="text-gray-700 dark:text-gray-300" size={24} />
      </button>

      {/* Mobile Sidebar Backdrop */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          mobile-sidebar fixed inset-y-0 left-0 z-50 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="relative h-full">
          <Sidebar
            user={user}
            tenant={tenant}
            tenants={tenants}
            onTenantChange={onTenantChange}
          />
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close menu"
          >
            <Icon name="XMarkIcon" className="text-gray-700 dark:text-gray-300" size={20} />
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            user={user}
            tenant={tenant}
            tenants={tenants}
            onTenantChange={onTenantChange}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* TopBar */}
          <TopBar
            user={user}
            notifications={notifications}
            tenant={tenant}
            tenants={tenants}
            onTenantChange={onTenantChange}
            onThemeToggle={handleThemeToggle}
            onLanguageChange={handleLanguageChange}
            currentTheme={theme}
            currentLanguage={language}
            onLogout={onLogout}
            onSearch={handleSearch}
            breadcrumbLabels={breadcrumbLabels}
            onNotificationMarkAsRead={onNotificationMarkAsRead}
            onNotificationMarkAllAsRead={onNotificationMarkAllAsRead}
            onNotificationClearAll={onNotificationClearAll}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
