'use client';

/**
 * TopBar Component
 * Top navigation bar with breadcrumbs, search, notifications, and user menu
 */

import React, { useState, useContext } from 'react';
import { Icon } from './Icon';
import Breadcrumbs from './Breadcrumbs';
import NotificationDropdown from './NotificationDropdown';
import { User, Notification, Tenant } from '../types/navigation';
import { NotificationContext } from '../contexts/NotificationContext';

interface TopBarProps {
  user?: User;
  notifications?: Notification[];
  tenant?: Tenant;
  tenants?: Tenant[];
  onTenantChange?: (tenant: Tenant) => void;
  onThemeToggle?: () => void;
  onLanguageChange?: (language: string) => void;
  currentTheme?: 'light' | 'dark';
  currentLanguage?: string;
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  breadcrumbLabels?: Record<string, string>;
  className?: string;
  onNotificationMarkAsRead?: (id: string) => void;
  onNotificationMarkAllAsRead?: () => void;
  onNotificationClearAll?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  user,
  notifications = [],
  tenant,
  tenants = [],
  onTenantChange,
  onThemeToggle,
  onLanguageChange,
  currentTheme = 'light',
  currentLanguage = 'en',
  onLogout,
  onSearch,
  breadcrumbLabels,
  className = '',
  onNotificationMarkAsRead,
  onNotificationMarkAllAsRead,
  onNotificationClearAll,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Get NotificationContext as fallback
  const notificationContext = useContext(NotificationContext);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleNotificationMarkAsRead = (id: string) => {
    // Use callback prop if provided, otherwise use NotificationContext
    if (onNotificationMarkAsRead) {
      onNotificationMarkAsRead(id);
    } else if (notificationContext) {
      notificationContext.markAsRead(id);
    }
  };

  const handleNotificationMarkAllAsRead = () => {
    // Use callback prop if provided, otherwise use NotificationContext
    if (onNotificationMarkAllAsRead) {
      onNotificationMarkAllAsRead();
    } else if (notificationContext) {
      notificationContext.markAllAsRead();
    }
  };

  const handleNotificationClearAll = () => {
    // Use callback prop if provided, otherwise use NotificationContext
    if (onNotificationClearAll) {
      onNotificationClearAll();
    } else if (notificationContext) {
      notificationContext.clearAll();
    }
  };

  return (
    <header
      className={`
        bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800
        sticky top-0 z-30
        ${className}
      `}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Breadcrumbs */}
          <div className="flex-1 min-w-0">
            <Breadcrumbs customLabels={breadcrumbLabels} />
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2 ml-4">
            {/* Search */}
            <div className="relative">
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 px-3 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <Icon
                    name="MagnifyingGlassIcon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Icon name="XMarkIcon" className="text-gray-500" size={20} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Search"
                >
                  <Icon name="MagnifyingGlassIcon" className="text-gray-700 dark:text-gray-300" size={20} />
                </button>
              )}
            </div>

            {/* Tenant Selector (Desktop Only) */}
            {tenants.length > 1 && tenant && (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setShowTenantDropdown(!showTenantDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon name="BuildingOfficeIcon" className="text-gray-500 dark:text-gray-400" size={18} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white max-w-[150px] truncate">
                    {tenant.name}
                  </span>
                  <Icon name="ChevronUpDownIcon" className="text-gray-400" size={16} />
                </button>

                {showTenantDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowTenantDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                      {tenants.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            onTenantChange?.(t);
                            setShowTenantDropdown(false);
                          }}
                          className={`
                            w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                            ${t.id === tenant.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                          `}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              <Icon
                name={currentTheme === 'dark' ? 'SunIcon' : 'MoonIcon'}
                className="text-gray-700 dark:text-gray-300"
                size={20}
              />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Change language"
              >
                <Icon name="LanguageIcon" className="text-gray-700 dark:text-gray-300" size={20} />
              </button>

              {showLanguageMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLanguageMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange?.(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`
                          w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2
                          ${lang.code === currentLanguage ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                        `}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <NotificationDropdown
              notifications={notifications}
              onMarkAsRead={handleNotificationMarkAsRead}
              onMarkAllAsRead={handleNotificationMarkAllAsRead}
              onClearAll={handleNotificationClearAll}
            />

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                    ) : (
                      <span className="text-white font-semibold text-xs">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {user.role}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <a
                          href="/settings/account"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Icon name="UserCircleIcon" className="text-gray-500" size={18} />
                          <span>My Profile</span>
                        </a>
                        <a
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Icon name="Cog6ToothIcon" className="text-gray-500" size={18} />
                          <span>Settings</span>
                        </a>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                        <button
                          onClick={() => {
                            onLogout?.();
                            setShowUserMenu(false);
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Icon name="ArrowRightOnRectangleIcon" className="text-red-600 dark:text-red-400" size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
