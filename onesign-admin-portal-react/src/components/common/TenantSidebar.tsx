import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  AppWindow,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  FileText,
  Key,
  Bell,
  Activity,
  Lock,
  Globe,
  Database,
  Workflow,
  AlertTriangle,
  BarChart3,
  Palette,
  Building2,
  Clock,
  UserCog,
  FileCode,
  ServerCog,
  Webhook,
  ShieldCheck,
  Eye,
  Fingerprint,
  Network,
  HardDrive,
  FileUp,
  FileDown,
  Boxes,
  Bot,
  Zap,
  Target,
  Clipboard,
  CreditCard,
  Scale,
  BookOpen,
  Layers,
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
  children?: MenuItem[];
  badge?: string | number;
}

const TenantSidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const { isRTL } = useDirection();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['core', 'security']);

  const menuGroups: { id: string; label: string; items: MenuItem[] }[] = [
    {
      id: 'core',
      label: 'Core',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/tenant/dashboard' },
        { id: 'users', label: 'Users', icon: Users, href: '/tenant/users' },
        { id: 'apps', label: 'Applications', icon: AppWindow, href: '/tenant/apps' },
        { id: 'roles', label: 'Roles', icon: Shield, href: '/tenant/roles' },
        { id: 'audit', label: 'Audit Logs', icon: FileText, href: '/tenant/audit' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '/tenant/settings' },
      ],
    },
    {
      id: 'identity',
      label: 'Identity Management',
      items: [
        { id: 'org-units', label: 'Org Units', icon: Building2, href: '/tenant/org-units' },
        { id: 'delegated-admins', label: 'Delegated Admins', icon: UserCog, href: '/tenant/delegated-admins' },
        { id: 'service-accounts', label: 'Service Accounts', icon: ServerCog, href: '/tenant/service-accounts' },
        { id: 'federation', label: 'Federation', icon: Network, href: '/tenant/federation' },
        { id: 'sessions', label: 'Sessions', icon: Clock, href: '/tenant/sessions' },
        { id: 'tokens', label: 'Tokens', icon: Key, href: '/tenant/tokens' },
      ],
    },
    {
      id: 'security',
      label: 'Security',
      items: [
        { id: 'security', label: 'Security Overview', icon: ShieldCheck, href: '/tenant/security' },
        { id: 'adaptive-security', label: 'Adaptive Security', icon: Zap, href: '/tenant/adaptive-security' },
        { id: 'mfa-management', label: 'MFA Management', icon: Fingerprint, href: '/tenant/mfa-management' },
        { id: 'conditional-access', label: 'Conditional Access', icon: Lock, href: '/tenant/conditional-access' },
        { id: 'certificates', label: 'Certificates', icon: FileCode, href: '/tenant/certificates' },
        { id: 'ip-whitelist', label: 'IP Whitelist', icon: Globe, href: '/tenant/ip-whitelist' },
        { id: 'privileged-access', label: 'Privileged Access', icon: Shield, href: '/tenant/privileged-access' },
      ],
    },
    {
      id: 'access',
      label: 'Access Management',
      items: [
        { id: 'access-requests', label: 'Access Requests', icon: Clipboard, href: '/tenant/access-requests' },
        { id: 'access-certifications', label: 'Certifications', icon: FileText, href: '/tenant/access/certifications' },
        { id: 'access-reviews', label: 'Access Reviews', icon: Eye, href: '/tenant/access/reviews' },
        { id: 'scopes', label: 'Scopes', icon: Layers, href: '/tenant/scopes' },
        { id: 'policies', label: 'Policies', icon: Scale, href: '/tenant/policies' },
      ],
    },
    {
      id: 'governance',
      label: 'Governance & Compliance',
      items: [
        { id: 'governance', label: 'Governance', icon: Scale, href: '/tenant/governance' },
        { id: 'compliance', label: 'Compliance', icon: ShieldCheck, href: '/tenant/compliance' },
        { id: 'privacy', label: 'Privacy', icon: Lock, href: '/tenant/privacy' },
        { id: 'data-retention', label: 'Data Retention', icon: Database, href: '/tenant/data-retention' },
        { id: 'reports', label: 'Reports', icon: BarChart3, href: '/tenant/reports' },
      ],
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      items: [
        { id: 'insights', label: 'Insights', icon: Activity, href: '/tenant/insights' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/tenant/analytics' },
        { id: 'incidents', label: 'Incidents', icon: AlertTriangle, href: '/tenant/incidents' },
        { id: 'risk-events', label: 'Risk Events', icon: Target, href: '/tenant/risk-events' },
        { id: 'alerts', label: 'Alerts', icon: Bell, href: '/tenant/alerts' },
        { id: 'hunting', label: 'Threat Hunting', icon: Search, href: '/tenant/hunting' },
        { id: 'copilot', label: 'Security Copilot', icon: Bot, href: '/tenant/copilot' },
      ],
    },
    {
      id: 'automation',
      label: 'Automation',
      items: [
        { id: 'automation', label: 'Workflows', icon: Workflow, href: '/tenant/automation' },
        { id: 'schedules', label: 'Schedules', icon: Clock, href: '/tenant/schedules' },
        { id: 'lifecycle', label: 'Lifecycle', icon: Boxes, href: '/tenant/lifecycle' },
        { id: 'change-management', label: 'Change Management', icon: FileText, href: '/tenant/change-management' },
      ],
    },
    {
      id: 'integration',
      label: 'Integrations',
      items: [
        { id: 'integrations', label: 'Integrations', icon: Boxes, href: '/tenant/integrations' },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook, href: '/tenant/webhooks' },
        { id: 'api-keys', label: 'API Keys', icon: Key, href: '/tenant/api-keys' },
        { id: 'api-usage', label: 'API Usage', icon: Activity, href: '/tenant/api-usage' },
        { id: 'extensibility', label: 'Extensibility', icon: FileCode, href: '/tenant/extensibility' },
      ],
    },
    {
      id: 'operations',
      label: 'Operations',
      items: [
        { id: 'backups', label: 'Backups', icon: HardDrive, href: '/tenant/backups' },
        { id: 'imports', label: 'Imports', icon: FileUp, href: '/tenant/imports' },
        { id: 'exports', label: 'Exports', icon: FileDown, href: '/tenant/exports' },
        { id: 'observability', label: 'Observability', icon: Eye, href: '/tenant/observability' },
        { id: 'quotas', label: 'Quotas', icon: BarChart3, href: '/tenant/quotas' },
      ],
    },
    {
      id: 'customization',
      label: 'Customization',
      items: [
        { id: 'branding', label: 'Branding', icon: Palette, href: '/tenant/branding' },
        { id: 'templates', label: 'Templates', icon: FileText, href: '/tenant/templates' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/tenant/notifications' },
        { id: 'domains', label: 'Domains', icon: Globe, href: '/tenant/domains' },
      ],
    },
    {
      id: 'billing',
      label: 'Billing & Account',
      items: [
        { id: 'account', label: 'Account', icon: Users, href: '/tenant/account' },
        { id: 'billing', label: 'Billing', icon: CreditCard, href: '/tenant/billing' },
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">OS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">OneSign</h1>
                <p className="text-xs text-slate-500">Tenant Portal</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {sidebarCollapsed 
            ? (isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)
            : (isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)
          }
        </button>
      </div>

      {/* Search */}
      {!sidebarCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400",
              isRTL ? "right-3" : "left-3"
            )} />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
              )}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2">
        {filteredGroups.map((group) => (
          <div key={group.id} className="mb-2">
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
                    return (
                      <Link
                        key={item.id}
                        to={item.href || '#'}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                          active
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                          sidebarCollapsed && 'justify-center'
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-white' : 'text-slate-500')} />
                        {!sidebarCollapsed && (
                          <span className="font-medium text-sm truncate">{item.label}</span>
                        )}
                        {item.badge && !sidebarCollapsed && (
                          <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
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

        {/* Global Admin Link */}
        {!sidebarCollapsed && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/global/platform"
              className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">Global Admin</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className={cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default TenantSidebar;
