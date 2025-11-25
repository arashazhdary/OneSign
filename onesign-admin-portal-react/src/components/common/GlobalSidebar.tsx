import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Activity,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  FileText,
  Key,
  Bell,
  Lock,
  Globe,
  Database,
  Workflow,
  AlertTriangle,
  BarChart3,
  Building2,
  Clock,
  Webhook,
  Eye,
  Network,
  HardDrive,
  Boxes,
  Bot,
  Zap,
  CreditCard,
  Scale,
  Cpu,
  Gauge,
  Wrench,
  Flag,
  MapPin,
  RefreshCw,
  FileSearch,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  badge?: string | number;
}

const GlobalSidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['platform', 'monitoring']);

  const menuGroups: { id: string; label: string; items: MenuItem[] }[] = [
    {
      id: 'platform',
      label: 'Platform',
      items: [
        { id: 'platform', label: 'Platform Overview', icon: Server, href: '/global/platform' },
        { id: 'tenants', label: 'Tenants', icon: Building2, href: '/global/tenants' },
        { id: 'settings', label: 'Global Settings', icon: Settings, href: '/global/settings' },
        { id: 'billing', label: 'Billing', icon: CreditCard, href: '/global/billing' },
        { id: 'licenses', label: 'Licenses', icon: Key, href: '/global/licenses' },
      ],
    },
    {
      id: 'monitoring',
      label: 'Monitoring & Health',
      items: [
        { id: 'health', label: 'Health', icon: Activity, href: '/global/health' },
        { id: 'monitoring', label: 'Monitoring', icon: Eye, href: '/global/monitoring' },
        { id: 'performance', label: 'Performance', icon: Gauge, href: '/global/performance' },
        { id: 'metrics', label: 'Metrics', icon: BarChart3, href: '/global/metrics' },
        { id: 'diagnostics', label: 'Diagnostics', icon: Wrench, href: '/global/diagnostics' },
        { id: 'observability', label: 'Observability', icon: Eye, href: '/global/observability' },
        { id: 'alerts', label: 'Alerts', icon: Bell, href: '/global/alerts' },
      ],
    },
    {
      id: 'security',
      label: 'Security',
      items: [
        { id: 'security', label: 'Security Overview', icon: Shield, href: '/global/security' },
        { id: 'crypto', label: 'Cryptography', icon: Lock, href: '/global/crypto' },
        { id: 'access-reviews', label: 'Access Reviews', icon: Eye, href: '/global/access-reviews' },
        { id: 'hunting', label: 'Threat Hunting', icon: Search, href: '/global/hunting' },
      ],
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      items: [
        { id: 'insights', label: 'Insights', icon: Activity, href: '/global/insights' },
        { id: 'copilot', label: 'AI Copilot', icon: Bot, href: '/global/copilot' },
        { id: 'audit', label: 'Audit Logs', icon: FileText, href: '/global/audit' },
      ],
    },
    {
      id: 'infrastructure',
      label: 'Infrastructure',
      items: [
        { id: 'environments', label: 'Environments', icon: Boxes, href: '/global/environments' },
        { id: 'regions', label: 'Regions', icon: MapPin, href: '/global/regions' },
        { id: 'rate-limiting', label: 'Rate Limiting', icon: Gauge, href: '/global/rate-limiting' },
        { id: 'backups', label: 'Backups', icon: HardDrive, href: '/global/backups' },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench, href: '/global/maintenance' },
      ],
    },
    {
      id: 'automation',
      label: 'Automation & Changes',
      items: [
        { id: 'automation', label: 'Automation', icon: Workflow, href: '/global/automation' },
        { id: 'change-management', label: 'Change Management', icon: RefreshCw, href: '/global/change-management' },
        { id: 'changes-audit', label: 'Changes Audit', icon: FileSearch, href: '/global/changes/audit' },
        { id: 'migrations', label: 'Migrations', icon: ArrowLeftRight, href: '/global/migrations' },
        { id: 'feature-flags', label: 'Feature Flags', icon: Flag, href: '/global/feature-flags' },
      ],
    },
    {
      id: 'integration',
      label: 'Integrations',
      items: [
        { id: 'integrations', label: 'Integrations', icon: Network, href: '/global/integrations' },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook, href: '/global/webhooks' },
        { id: 'api-management', label: 'API Management', icon: Cpu, href: '/global/api-management' },
        { id: 'templates', label: 'Templates', icon: FileText, href: '/global/templates' },
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
      className="fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-700 z-40 flex flex-col"
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">OS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-purple-400">OneSign</h1>
                <p className="text-xs text-slate-400">Global Admin</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Back to Tenant */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-b border-slate-700">
          <Link
            to="/tenant/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tenant
          </Link>
        </div>
      )}

      {/* Search */}
      {!sidebarCollapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">Global Admin</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default GlobalSidebar;
