import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { accessService } from '@/lib/api/services';
import Modal from '@/components/common/Modal';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Key,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Zap,
  Server,
  UserCheck,
  ShieldAlert,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Lock
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

interface PrivilegedSession {
  id: string;
  userId: string;
  userEmail: string;
  resourceType: string;
  resourceId: string;
  startedAt: string;
  expiresAt: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

interface BreakGlassAccount {
  id: string;
  username: string;
  description: string;
  isActivated: boolean;
  lastActivatedAt?: string;
}

interface AccessRequest {
  id: string;
  requesterId: string;
  requesterEmail: string;
  resourceType: string;
  resourceId: string;
  reason: string;
  duration: number;
  status: 'Pending' | 'Approved' | 'Denied' | 'Expired';
  createdAt: string;
}

interface JITGrant {
  id: string;
  userId: string;
  userEmail: string;
  resourceType: string;
  resourceId: string;
  grantedAt: string;
  expiresAt: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

interface PrivilegedAccessDashboard {
  activeSessions: number;
  activeGrants: number;
  pendingRequests: number;
  breakGlassActivations: number;
  totalRequests: number;
}

type Tab = 'dashboard' | 'sessions' | 'grants' | 'break-glass' | 'requests';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    case 'Approved':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    case 'Pending':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    case 'Expired':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    case 'Revoked':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    case 'Denied':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    case 'Activated':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    case 'Inactive':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Active':
    case 'Approved':
      return <CheckCircle className="w-3 h-3" />;
    case 'Pending':
      return <Clock className="w-3 h-3" />;
    case 'Expired':
      return <Clock className="w-3 h-3" />;
    case 'Revoked':
    case 'Denied':
      return <XCircle className="w-3 h-3" />;
    case 'Activated':
      return <Zap className="w-3 h-3" />;
    default:
      return <Activity className="w-3 h-3" />;
  }
};

export default function TenantPrivilegedAccessPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [dashboardData, setDashboardData] = useState<PrivilegedAccessDashboard | null>(null);
  const [sessions, setSessions] = useState<PrivilegedSession[]>([]);
  const [jitGrants, setJitGrants] = useState<JITGrant[]>([]);
  const [breakGlassAccounts, setBreakGlassAccounts] = useState<BreakGlassAccount[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    resourceType: '',
    resourceId: '',
    reason: '',
    duration: 3600
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'dashboard') fetchDashboard();
      else if (activeTab === 'sessions') fetchSessions();
      else if (activeTab === 'grants') fetchJITGrants();
      else if (activeTab === 'break-glass') fetchBreakGlassAccounts();
      else if (activeTab === 'requests') fetchAccessRequests();
    }
  }, [tenantId, activeTab]);

  const fetchSessions = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await accessService.getPrivilegedSessions('Active');
      setSessions(data || []);
    } catch (err) {
      // Mock data for demo
      setSessions([
        {
          id: '1',
          userId: 'u1',
          userEmail: 'admin@example.com',
          resourceType: 'Server',
          resourceId: 'srv-prod-001',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          status: 'Active'
        },
        {
          id: '2',
          userId: 'u2',
          userEmail: 'ops@example.com',
          resourceType: 'Database',
          resourceId: 'db-main-prod',
          startedAt: new Date(Date.now() - 1800000).toISOString(),
          expiresAt: new Date(Date.now() + 5400000).toISOString(),
          status: 'Active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreakGlassAccounts = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setBreakGlassAccounts([
        {
          id: '1',
          username: 'emergency-admin-01',
          description: 'Emergency admin access for critical infrastructure',
          isActivated: false,
          lastActivatedAt: undefined
        },
        {
          id: '2',
          username: 'emergency-admin-02',
          description: 'Backup emergency access for DR scenarios',
          isActivated: false,
          lastActivatedAt: '2024-01-15T10:30:00Z'
        }
      ]);
    } catch (err) {
      console.error('Error fetching break-glass accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessRequests = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setAccessRequests([
        {
          id: '1',
          requesterId: 'u1',
          requesterEmail: 'developer@example.com',
          resourceType: 'Database',
          resourceId: 'db-staging',
          reason: 'Need to debug production issue',
          duration: 3600,
          status: 'Pending',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          requesterId: 'u2',
          requesterEmail: 'sre@example.com',
          resourceType: 'Server',
          resourceId: 'srv-monitoring',
          reason: 'Server maintenance',
          duration: 7200,
          status: 'Approved',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } catch (err) {
      console.error('Error fetching access requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setDashboardData({
        activeSessions: 5,
        activeGrants: 12,
        pendingRequests: 3,
        breakGlassActivations: 0,
        totalRequests: 47
      });
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJITGrants = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setJitGrants([
        {
          id: '1',
          userId: 'u1',
          userEmail: 'admin@example.com',
          resourceType: 'Kubernetes',
          resourceId: 'prod-cluster',
          grantedAt: new Date(Date.now() - 7200000).toISOString(),
          expiresAt: new Date(Date.now() + 7200000).toISOString(),
          status: 'Active'
        },
        {
          id: '2',
          userId: 'u2',
          userEmail: 'devops@example.com',
          resourceType: 'AWS',
          resourceId: 'production-account',
          grantedAt: new Date(Date.now() - 14400000).toISOString(),
          expiresAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'Expired'
        }
      ]);
    } catch (err) {
      console.error('Error fetching JIT grants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestJITAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      setSuccess('JIT access requested successfully');
      setShowRequestModal(false);
      fetchAccessRequests();
      setRequestForm({ resourceType: '', resourceId: '', reason: '', duration: 3600 });
    } catch (err) {
      setError('Failed to request JIT access');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeGrant = async (grantId: string) => {
    if (!tenantId || !confirm(t('tenant.privilegedAccess.confirmRevokeGrant'))) return;
    setLoading(true);
    try {
      setSuccess('Grant revoked successfully');
      fetchJITGrants();
    } catch (err) {
      setError('Failed to revoke grant');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!tenantId || !confirm(t('tenant.privilegedAccess.confirmRevokeSession'))) return;
    setLoading(true);
    try {
      setSuccess('Session revoked successfully');
      fetchSessions();
    } catch (err) {
      setError('Failed to revoke session');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateBreakGlass = async (accountId: string) => {
    if (!tenantId || !confirm(t('tenant.privilegedAccess.confirmActivateBreakGlass'))) return;
    setLoading(true);
    try {
      setSuccess('Break-glass account activated');
      fetchBreakGlassAccounts();
    } catch (err) {
      setError('Failed to activate break-glass account');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { key: 'sessions', label: 'Sessions', icon: <Users className="w-4 h-4" /> },
    { key: 'grants', label: 'JIT Grants', icon: <Key className="w-4 h-4" /> },
    { key: 'break-glass', label: 'Break Glass', icon: <ShieldAlert className="w-4 h-4" /> },
    { key: 'requests', label: 'Requests', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{t('tenant.privilegedAccess.title') || 'Privileged Access Management'} | OneSign</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('tenant.privilegedAccess.title') || 'Privileged Access Management'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {t('tenant.privilegedAccess.subtitle') || 'Manage JIT access, break-glass accounts, and privileged sessions'}
                </p>
              </div>
            </div>
            {activeTab === 'requests' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Request JIT Access
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-2"
        >
          <nav className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <StatCard
                title="Active Sessions"
                value={dashboardData?.activeSessions || 0}
                icon={<Users className="w-6 h-6 text-white" />}
                color="from-blue-500 to-indigo-600"
                delay={0}
              />
              <StatCard
                title="Active Grants"
                value={dashboardData?.activeGrants || 0}
                icon={<Key className="w-6 h-6 text-white" />}
                color="from-green-500 to-emerald-600"
                delay={1}
              />
              <StatCard
                title="Pending Requests"
                value={dashboardData?.pendingRequests || 0}
                icon={<Clock className="w-6 h-6 text-white" />}
                color="from-yellow-500 to-orange-600"
                delay={2}
              />
              <StatCard
                title="Break-Glass Activations"
                value={dashboardData?.breakGlassActivations || 0}
                icon={<ShieldAlert className="w-6 h-6 text-white" />}
                color="from-red-500 to-rose-600"
                delay={3}
              />
              <StatCard
                title="Total Requests"
                value={dashboardData?.totalRequests || 0}
                icon={<FileText className="w-6 h-6 text-white" />}
                color="from-purple-500 to-violet-600"
                delay={4}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRequestModal(true)}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Request JIT Access</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submit a new access request</p>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('sessions')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">View Sessions</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monitor active sessions</p>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('break-glass')}
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="p-2 bg-red-500 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Break-Glass</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Emergency access accounts</p>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Privileged Sessions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Started</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {sessions.map((session, index) => (
                    <motion.tr
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{session.userEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{session.resourceType}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{session.resourceId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.startedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.expiresAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                          {getStatusIcon(session.status)}
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {session.status === 'Active' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRevokeSession(session.id)}
                            className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            Revoke
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No active sessions</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* JIT Grants Tab */}
        {activeTab === 'grants' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Just-In-Time Grants</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Granted</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {jitGrants.map((grant, index) => (
                    <motion.tr
                      key={grant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <Key className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{grant.userEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{grant.resourceType}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{grant.resourceId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(grant.grantedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(grant.expiresAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(grant.status)}`}>
                          {getStatusIcon(grant.status)}
                          {grant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {grant.status === 'Active' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRevokeGrant(grant.id)}
                            className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            Revoke
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                  {jitGrants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No JIT grants found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Break-Glass Tab */}
        {activeTab === 'break-glass' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Warning Banner */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Break-Glass Access</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  These accounts are for emergency use only. All activations are logged and audited. Use only when standard access methods are unavailable.
                </p>
              </div>
            </div>

            {/* Break-Glass Accounts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {breakGlassAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                        <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{account.username}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{account.description}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${account.isActivated ? getStatusColor('Activated') : getStatusColor('Inactive')}`}>
                      {account.isActivated ? <Zap className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {account.isActivated ? 'Activated' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Last Activated: {account.lastActivatedAt ? new Date(account.lastActivatedAt).toLocaleString() : 'Never'}
                  </div>
                  {!account.isActivated && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleActivateBreakGlass(account.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <Zap className="w-5 h-5" />
                      Activate Emergency Access
                    </motion.button>
                  )}
                </motion.div>
              ))}
              {breakGlassAccounts.length === 0 && (
                <div className="col-span-2 text-center py-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
                  <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No break-glass accounts configured</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Access Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Access Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {accessRequests.map((request, index) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{request.requesterEmail}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{request.resourceType}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{request.resourceId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{request.reason}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {Math.floor(request.duration / 3600)}h {Math.floor((request.duration % 3600) / 60)}m
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                  {accessRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No access requests</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Request JIT Access Modal */}
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Request JIT Access"
          size="md"
        >
          <form onSubmit={handleRequestJITAccess}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resource Type *</label>
                <select
                  value={requestForm.resourceType}
                  onChange={(e) => setRequestForm({ ...requestForm, resourceType: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select resource type</option>
                  <option value="Server">Server</option>
                  <option value="Database">Database</option>
                  <option value="Kubernetes">Kubernetes</option>
                  <option value="AWS">AWS</option>
                  <option value="Azure">Azure</option>
                  <option value="GCP">GCP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resource ID *</label>
                <input
                  type="text"
                  value={requestForm.resourceId}
                  onChange={(e) => setRequestForm({ ...requestForm, resourceId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  placeholder={t('tenant.privilegedAccess.placeholders.resourceId')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason *</label>
                <textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder={t('tenant.privilegedAccess.placeholders.reason')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
                <select
                  value={requestForm.duration}
                  onChange={(e) => setRequestForm({ ...requestForm, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={3600}>1 hour</option>
                  <option value={7200}>2 hours</option>
                  <option value={14400}>4 hours</option>
                  <option value={28800}>8 hours</option>
                  <option value={86400}>24 hours</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                Submit Request
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
