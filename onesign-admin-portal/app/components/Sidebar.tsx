'use client';

/**
 * Sidebar Component
 * Professional navigation sidebar with collapsible menu, search, and role-based visibility
 */

import React, { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';
import { MenuItem, Tenant, User } from '../types/navigation';
import { menuItems } from '../config/navigation';

interface SidebarProps {
  user?: User;
  tenant?: Tenant;
  tenants?: Tenant[];
  onTenantChange?: (tenant: Tenant) => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  tenant,
  tenants = [],
  onTenantChange,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const pathname = usePathname();

  // Filter menu items based on search query
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return menuItems;

    const query = searchQuery.toLowerCase();
    return menuItems
      .map((item) => {
        const matchesParent = item.label.toLowerCase().includes(query);
        const matchingChildren = item.children?.filter((child) =>
          child.label.toLowerCase().includes(query)
        );

        if (matchesParent || (matchingChildren && matchingChildren.length > 0)) {
          return {
            ...item,
            children: matchingChildren || item.children,
          };
        }
        return null;
      })
      .filter(Boolean) as MenuItem[];
  }, [searchQuery]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const hasActiveChild = (item: MenuItem): boolean => {
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const itemIsActive = isActive(item.href);
    const childIsActive = hasActiveChild(item);

    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.href) {
              window.location.href = item.href;
            }
          }}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg
            transition-all duration-200 text-sm font-medium
            ${level > 0 ? 'ml-4' : ''}
            ${
              itemIsActive || childIsActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
            ${isCollapsed && level === 0 ? 'justify-center' : ''}
          `}
        >
          <div className="flex items-center gap-3 min-w-0">
            {item.icon && (
              <Icon
                name={item.icon}
                className={`flex-shrink-0 ${
                  itemIsActive || childIsActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
                size={20}
              />
            )}
            {!isCollapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {item.badge && (
                <span
                  className={`
                    px-2 py-0.5 text-xs font-semibold rounded-full
                    ${
                      typeof item.badge === 'number'
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                    }
                  `}
                >
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <Icon
                  name={isExpanded ? 'ChevronDownIcon' : 'ChevronRightIcon'}
                  className={itemIsActive || childIsActive ? 'text-white' : 'text-gray-400'}
                  size={16}
                />
              )}
            </div>
          )}
        </button>

        {/* Render children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`
        ${isCollapsed ? 'w-20' : 'w-64'}
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 flex flex-col h-screen
        ${className}
      `}
    >
      {/* Header with Logo and Collapse Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OS</span>
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                OneSign
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon
              name={isCollapsed ? 'ChevronRightIcon' : 'ChevronDownIcon'}
              className="text-gray-500 dark:text-gray-400"
              size={20}
            />
          </button>
        </div>
      </div>

      {/* Tenant Switcher */}
      {!isCollapsed && tenants.length > 0 && tenant && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <button
              onClick={() => setShowTenantDropdown(!showTenantDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon name="BuildingOfficeIcon" className="text-gray-500 dark:text-gray-400" size={20} />
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {tenant.name}
                </span>
              </div>
              <Icon name="ChevronUpDownIcon" className="text-gray-400" size={16} />
            </button>

            {showTenantDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onTenantChange?.(t);
                      setShowTenantDropdown(false);
                    }}
                    className={`
                      w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                      ${t.id === tenant.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                    `}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Icon
              name="MagnifyingGlassIcon"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {filteredMenuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {isCollapsed ? (
            <button className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Icon name="UserCircleIcon" className="text-gray-500 dark:text-gray-400" size={24} />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
