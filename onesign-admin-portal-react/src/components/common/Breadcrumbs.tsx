import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

export interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4" />,
  showHome = true,
  className,
}) => {
  const location = useLocation();
  const { t } = useTranslation();

  // Auto-generate breadcrumbs from path if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(location.pathname, t);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      {/* Home */}
      {showHome && (
        <>
          <Link
            to="/"
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.home', { defaultValue: 'Home' })}</span>
          </Link>
          {breadcrumbItems.length > 0 && (
            <span className="text-slate-400 dark:text-slate-600">{separator}</span>
          )}
        </>
      )}

      {/* Breadcrumb Items */}
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <React.Fragment key={item.path}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2"
            >
              {isLast ? (
                <span className="flex items-center gap-1 text-slate-900 dark:text-white font-medium">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )}
            </motion.div>
            {!isLast && (
              <span className="text-slate-400 dark:text-slate-600">{separator}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Helper function to auto-generate breadcrumbs from path
function generateBreadcrumbs(pathname: string, t: any): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  paths.forEach((path) => {
    currentPath += `/${path}`;

    // Capitalize and format the path segment
    const label = path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Try to get translation, fallback to formatted label
    const translatedLabel = t(`nav.${path}`, { defaultValue: label });

    breadcrumbs.push({
      label: translatedLabel,
      path: currentPath,
    });
  });

  return breadcrumbs;
}

export default Breadcrumbs;
