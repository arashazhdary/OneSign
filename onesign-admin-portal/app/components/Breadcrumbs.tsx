'use client';

/**
 * Breadcrumbs Component
 * Auto-generates breadcrumbs from route with custom labels support
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from './Icon';
import { BreadcrumbItem } from '../types/navigation';

interface BreadcrumbsProps {
  customLabels?: Record<string, string>;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  customLabels = {},
  className = '',
}) => {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
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
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href || crumb.label}>
          {index > 0 && (
            <Icon
              name="ChevronRightIcon"
              className="text-gray-400 dark:text-gray-600"
              size={16}
            />
          )}
          {crumb.href ? (
            <a
              href={crumb.href}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {crumb.label}
            </a>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
