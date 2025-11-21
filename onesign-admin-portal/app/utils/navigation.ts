/**
 * Navigation Utilities
 * Helper functions for navigation system
 */

import { MenuItem, BreadcrumbItem } from '../types/navigation';

/**
 * Check if a menu item should be visible based on user roles
 */
export function isMenuItemVisible(
  item: MenuItem,
  userRoles: string[] = []
): boolean {
  if (!item.roles || item.roles.length === 0) {
    return true;
  }
  return item.roles.some((role) => userRoles.includes(role));
}

/**
 * Filter menu items based on user roles
 */
export function filterMenuItemsByRole(
  items: MenuItem[],
  userRoles: string[] = []
): MenuItem[] {
  return items
    .filter((item) => isMenuItemVisible(item, userRoles))
    .map((item) => ({
      ...item,
      children: item.children
        ? filterMenuItemsByRole(item.children, userRoles)
        : undefined,
    }));
}

/**
 * Search menu items by query
 */
export function searchMenuItems(
  items: MenuItem[],
  query: string
): MenuItem[] {
  const lowerQuery = query.toLowerCase();

  return items
    .map((item) => {
      const matchesLabel = item.label.toLowerCase().includes(lowerQuery);
      const matchingChildren = item.children
        ? searchMenuItems(item.children, query)
        : [];

      if (matchesLabel || matchingChildren.length > 0) {
        return {
          ...item,
          children: matchingChildren.length > 0 ? matchingChildren : item.children,
        };
      }
      return null;
    })
    .filter((item): item is MenuItem => item !== null);
}

/**
 * Find menu item by href
 */
export function findMenuItemByHref(
  items: MenuItem[],
  href: string
): MenuItem | null {
  for (const item of items) {
    if (item.href === href) {
      return item;
    }
    if (item.children) {
      const found = findMenuItemByHref(item.children, href);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Get all parent menu items for a given href
 */
export function getMenuItemParents(
  items: MenuItem[],
  href: string,
  parents: MenuItem[] = []
): MenuItem[] {
  for (const item of items) {
    if (item.href === href) {
      return parents;
    }
    if (item.children) {
      const found = getMenuItemParents(item.children, href, [...parents, item]);
      if (found.length > 0 || item.children.some((child) => child.href === href)) {
        return [...parents, item];
      }
    }
  }
  return [];
}

/**
 * Check if a path matches a href pattern
 */
export function isPathMatch(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true;
  }
  // Check if pathname starts with href and the next character is a slash
  return pathname.startsWith(href + '/');
}

/**
 * Generate breadcrumbs from pathname
 */
export function generateBreadcrumbs(
  pathname: string,
  customLabels: Record<string, string> = {}
): BreadcrumbItem[] {
  // Remove locale prefix if exists (e.g., /en, /fa)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');

  const segments = pathWithoutLocale
    .split('/')
    .filter((segment) => segment !== '');

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      href: '/',
    },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Use custom label if provided, otherwise format the segment
    const label =
      customLabels[currentPath] ||
      segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    breadcrumbs.push({
      label,
      href: index === segments.length - 1 ? undefined : currentPath,
    });
  });

  return breadcrumbs;
}

/**
 * Format relative timestamp
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Debounce function for search
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get badge color based on value
 */
export function getBadgeColor(badge: string | number): string {
  if (typeof badge === 'number') {
    return 'bg-red-500 text-white';
  }

  const lowerBadge = badge.toLowerCase();
  if (lowerBadge === 'new') {
    return 'bg-green-500 text-white';
  }
  if (lowerBadge === 'beta') {
    return 'bg-blue-500 text-white';
  }
  if (lowerBadge === 'pro') {
    return 'bg-purple-500 text-white';
  }

  return 'bg-gray-500 text-white';
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024;
}

/**
 * Get contrast color for background
 */
export function getContrastColor(hexColor: string): 'light' | 'dark' {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'dark' : 'light';
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}
