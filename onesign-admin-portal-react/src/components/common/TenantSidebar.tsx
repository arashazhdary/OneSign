import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const { isRTL } = useDirection();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['core', 'security']);

  const menuGroups: { id: string; label: string; items: MenuItem[] }[] = [
    {
      id: 'core',
      label: t('sidebar.core'),
      items: [
        { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, href: '/tenant/dashboard' },
        { id: 'users', label: t('nav.users'), icon: Users, href: '/tenant/users' },
        { id: 'apps', label: t('sidebar.applications'), icon: AppWindow, href: '/tenant/apps' },
        { id: 'roles', label: t('nav.roles'), icon: Shield, href: '/tenant/roles' },
        { id: 'audit', label: t('sidebar.auditLogs'), icon: FileText, href: '/tenant/audit' },
        { id: 'settings', label: t('nav.settings'), icon: Settings, href: '/tenant/settings' },
      ],
    },
    {
      id: 'identity',
      label: t('sidebar.identityManagement'),
      items: [
        { id: 'org-units', label: t('sidebar.orgUnits'), icon: Building2, href: '/tenant/org-units' },
        { id: 'delegated-admins', label: t('sidebar.delegatedAdmins'), icon: UserCog, href: '/tenant/delegated-admins' },
        { id: 'service-accounts', label: t('sidebar.serviceAccounts'), icon: ServerCog, href: '/tenant/service-accounts' },
        { id: 'federation', label: t('sidebar.federation'), icon: Network, href: '/tenant/federation' },
        { id: 'sessions', label: t('sidebar.sessions'), icon: Clock, href: '/tenant/sessions' },
        { id: 'tokens', label: t('sidebar.tokens'), icon: Key, href: '/tenant/tokens' },
      ],
    },
    {
      id: 'security',
      label: t('sidebar.security'),
      items: [
        { id: 'security', label: t('sidebar.securityOverview'), icon: ShieldCheck, href: '/tenant/security' },
        { id: 'adaptive-security', label: t('sidebar.adaptiveSecurity'), icon: Zap, href: '/tenant/adaptive-security' },
        { id: 'mfa-management', label: t('sidebar.mfaManagement'), icon: Fingerprint, href: '/tenant/mfa-management' },
        { id: 'conditional-access', label: t('sidebar.conditionalAccess'), icon: Lock, href: '/tenant/conditional-access' },
        { id: 'certificates', label: t('sidebar.certificates'), icon: FileCode, href: '/tenant/certificates' },
        { id: 'ip-whitelist', label: t('sidebar.ipWhitelist'), icon: Globe, href: '/tenant/ip-whitelist' },
        { id: 'privileged-access', label: t('sidebar.privilegedAccess'), icon: Shield, href: '/tenant/privileged-access' },
      ],
    },
    {
      id: 'access',
      label: t('common.accessManagement'),
      items: [
        { id: 'access-requests', label: t('common.accessRequests'), icon: Clipboard, href: '/tenant/access-requests' },
        { id: 'access-certifications', label: t('common.certifications'), icon: FileText, href: '/tenant/access/certifications' },
        { id: 'access-reviews', label: t('common.accessReviews'), icon: Eye, href: '/tenant/access/reviews' },
        { id: 'scopes', label: t('sidebar.scopes'), icon: Layers, href: '/tenant/scopes' },
        { id: 'policies', label: t('sidebar.policies'), icon: Scale, href: '/tenant/policies' },
      ],
    },
    {
      id: 'governance',
      label: t('sidebar.governanceCompliance'),
      items: [
        { id: 'governance', label: t('sidebar.governance'), icon: Scale, href: '/tenant/governance' },
        { id: 'compliance', label: t('sidebar.compliance'), icon: ShieldCheck, href: '/tenant/compliance' },
        { id: 'privacy', label: t('sidebar.privacy'), icon: Lock, href: '/tenant/privacy' },
        { id: 'data-retention', label: t('sidebar.dataRetention'), icon: Database, href: '/tenant/data-retention' },
        { id: 'reports', label: t('sidebar.reports'), icon: BarChart3, href: '/tenant/reports' },
      ],
    },
    {
      id: 'intelligence',
      label: t('sidebar.intelligence'),
      items: [
        { id: 'insights', label: t('sidebar.insights'), icon: Activity, href: '/tenant/insights' },
        { id: 'analytics', label: t('sidebar.analytics'), icon: BarChart3, href: '/tenant/analytics' },
        { id: 'incidents', label: t('sidebar.incidents'), icon: AlertTriangle, href: '/tenant/incidents' },
        { id: 'risk-events', label: t('sidebar.riskEvents'), icon: Target, href: '/tenant/risk-events' },
        { id: 'alerts', label: t('sidebar.alerts'), icon: Bell, href: '/tenant/alerts' },
        { id: 'hunting', label: t('sidebar.threatHunting'), icon: Search, href: '/tenant/hunting' },
        { id: 'copilot', label: t('sidebar.securityCopilot'), icon: Bot, href: '/tenant/copilot' },
      ],
    },
    {
      id: 'automation',
      label: t('sidebar.automation'),
      items: [
        { id: 'automation', label: t('sidebar.workflows'), icon: Workflow, href: '/tenant/automation' },
        { id: 'schedules', label: t('sidebar.schedules'), icon: Clock, href: '/tenant/schedules' },
        { id: 'lifecycle', label: t('sidebar.lifecycle'), icon: Boxes, href: '/tenant/lifecycle' },
        { id: 'change-management', label: t('sidebar.changeManagement'), icon: FileText, href: '/tenant/change-management' },
      ],
    },
    {
      id: 'integration',
      label: t('sidebar.integrations'),
      items: [
        { id: 'integrations', label: t('sidebar.integrations'), icon: Boxes, href: '/tenant/integrations' },
        { id: 'webhooks', label: t('sidebar.webhooks'), icon: Webhook, href: '/tenant/webhooks' },
        { id: 'api-keys', label: t('sidebar.apiKeys'), icon: Key, href: '/tenant/api-keys' },
        { id: 'api-usage', label: t('sidebar.apiUsage'), icon: Activity, href: '/tenant/api-usage' },
        { id: 'extensibility', label: t('sidebar.extensibility'), icon: FileCode, href: '/tenant/extensibility' },
      ],
    },
    {
      id: 'operations',
      label: t('sidebar.operations'),
      items: [
        { id: 'backups', label: t('sidebar.backups'), icon: HardDrive, href: '/tenant/backups' },
        { id: 'imports', label: t('common.imports'), icon: FileUp, href: '/tenant/imports' },
        { id: 'exports', label: t('common.exports'), icon: FileDown, href: '/tenant/exports' },
        { id: 'observability', label: t('sidebar.observability'), icon: Eye, href: '/tenant/observability' },
        { id: 'quotas', label: t('sidebar.quotas'), icon: BarChart3, href: '/tenant/quotas' },
      ],
    },
    {
      id: 'customization',
      label: t('common.customization'),
      items: [
        { id: 'branding', label: t('sidebar.branding'), icon: Palette, href: '/tenant/branding' },
        { id: 'templates', label: t('sidebar.templates'), icon: FileText, href: '/tenant/templates' },
        { id: 'notifications', label: t('common.notifications'), icon: Bell, href: '/tenant/notifications' },
        { id: 'domains', label: t('sidebar.domains'), icon: Globe, href: '/tenant/domains' },
      ],
    },
    {
      id: 'billing',
      label: t('sidebar.billingAccount'),
      items: [
        { id: 'account', label: t('sidebar.account'), icon: Users, href: '/tenant/account' },
        { id: 'billing', label: t('sidebar.billing'), icon: CreditCard, href: '/tenant/billing' },
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
        "fixed top-0 h-screen bg-slate-900 z-40 flex flex-col",
        isRTL
          ? "right-0 border-l border-slate-700"
          : "left-0 border-r border-slate-700"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">OS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-400">OneSign</h1>
                <p className="text-xs text-slate-400">{t('sidebar.tenantPortal', 'Tenant Portal')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
        >
          {sidebarCollapsed
            ? (isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)
            : (isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)
          }
        </button>
      </div>

      {/* Go to Global Admin */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-b border-slate-700">
          <Link
            to="/global/platform"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            {t('sidebar.goToGlobalAdmin', 'Global Admin')}
          </Link>
        </div>
      )}

      {/* Search */}
      {!sidebarCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500",
              isRTL ? "right-3" : "left-3"
            )} />
            <input
              type="text"
              placeholder={t('common.searchMenu')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
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
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300"
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
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                            : 'text-slate-300 hover:bg-slate-800',
                          sidebarCollapsed && 'justify-center'
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-white' : 'text-slate-400')} />
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
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-slate-700">
          <div className={cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default TenantSidebar;
