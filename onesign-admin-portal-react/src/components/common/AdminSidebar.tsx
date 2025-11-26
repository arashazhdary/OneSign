import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Key,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Globe,
  Server,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useDirection } from '@/hooks/useDirection';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  badge?: string | number;
}

const AdminSidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const { isRTL } = useDirection();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['admin', 'portals']);

  const menuGroups: { id: string; label: string; items: MenuItem[] }[] = [
    {
      id: 'admin',
      label: t('common.admin'),
      items: [
        { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, href: '/admin/dashboard' },
        { id: 'users', label: t('nav.users'), icon: Users, href: '/admin/users' },
        { id: 'tenants', label: t('nav.tenants'), icon: Building2, href: '/admin/tenants' },
        { id: 'roles', label: t('nav.roles'), icon: Shield, href: '/admin/roles' },
        { id: 'api-keys', label: t('sidebar.apiKeys'), icon: Key, href: '/admin/api-keys' },
        { id: 'settings', label: t('nav.settings'), icon: Settings, href: '/admin/settings' },
      ],
    },
    {
      id: 'portals',
      label: t('sidebar.switchPortal'),
      items: [
        { id: 'tenant-portal', label: t('sidebar.tenantPortal'), icon: Building2, href: '/tenant/dashboard' },
        { id: 'global-portal', label: t('sidebar.globalAdmin'), icon: Globe, href: '/global/platform' },
      ],
    },
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const filteredGroups = menuGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? '80px' : '280px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        "fixed top-0 h-screen bg-white dark:bg-slate-900 z-40 flex flex-col",
        isRTL 
          ? "right-0 border-l border-slate-200 dark:border-slate-800"
          : "left-0 border-r border-slate-200 dark:border-slate-800"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">OS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">OneSign</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('common.adminPortal')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {sidebarCollapsed 
            ? (isRTL ? <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />)
            : (isRTL ? <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />)
          }
        </motion.button>
      </div>

      {/* Search */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4"
          >
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400",
              isRTL ? "right-3" : "left-3"
            )} />
            <input
              type="text"
              placeholder={t('common.searchMenu')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all",
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              )}
            />
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {filteredGroups.map((group) => (
          <div key={group.id} className="mb-4">
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
              >
                {group.label}
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform',
                    expandedGroups.includes(group.id) && 'rotate-180'
                  )}
                />
              </button>
            )}
            <AnimatePresence>
              {(sidebarCollapsed || expandedGroups.includes(group.id)) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const isPortalLink = group.id === 'portals';

                    return (
                      <Link
                        key={item.id}
                        to={item.href || '#'}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                          active
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                            : isPortalLink
                            ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                          sidebarCollapsed && 'justify-center'
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon
                          className={cn(
                            'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110',
                            active ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                          )}
                        />
                        <AnimatePresence>
                          {!sidebarCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              className="font-medium text-sm whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {item.badge && !sidebarCollapsed && (
                          <span className="ml-auto px-2 py-0.5 bg-danger-500 text-white text-xs font-semibold rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.aside>
  );
};

export default AdminSidebar;
