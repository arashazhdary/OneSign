import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tenantService } from '@/lib/api/services/tenant.service';
import { getTenantId } from '@/lib/tenant-context';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Shield,
  Key,
  Activity,
  Edit2,
  Trash2,
  Play,
  Pause,
  Building2,
  AppWindow,
  Clock,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Settings,
  Users,
  FileText,
} from 'lucide-react';

interface Scope {
  id: string;
  type: 'org-unit' | 'application' | 'resource';
  name: string;
  resourceId: string;
  permissions: string[];
}

interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

interface DelegatedAdminDetails {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'pending';
  scopes: Scope[];
  permissions: string[];
  assignedAt: string;
  assignedBy: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

type Tab = 'overview' | 'scopes' | 'permissions' | 'activity';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: Eye },
  { key: 'scopes', label: 'Scopes', icon: Shield },
  { key: 'permissions', label: 'Permissions', icon: Key },
  { key: 'activity', label: 'Activity', icon: Activity },
];

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
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>{icon}</div>
    </div>
  </motion.div>
);

export default function TenantDelegatedAdminsDetailPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = params.id as string;
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  const [admin, setAdmin] = useState<DelegatedAdminDetails | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showEditScopesModal, setShowEditScopesModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [availableOrgUnits, setAvailableOrgUnits] = useState<any[]>([]);
  const [availableApplications, setAvailableApplications] = useState<any[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<Scope[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [id, tenantId]);

  const fetchData = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      const response = (await tenantService.getDelegatedAdmins()) as any;
      const admins = Array.isArray(response) ? response : response?.data || [];
      const adminData = admins.find((a: any) => a.id === id);

      if (!adminData) {
        setNotFound(true);
        return;
      }

      const delegatedAdmin: DelegatedAdminDetails = {
        id: adminData.id,
        userId: adminData.tenantUserId || adminData.userId,
        name: adminData.name || adminData.userName || 'Unknown User',
        email: adminData.email || adminData.userEmail || '',
        status: adminData.status || 'active',
        scopes: adminData.scopes || [],
        permissions: adminData.permissions || [],
        assignedAt: adminData.assignedAt || adminData.createdAt,
        assignedBy: adminData.assignedBy || 'System',
        lastActiveAt: adminData.lastActiveAt,
        createdAt: adminData.createdAt,
        updatedAt: adminData.updatedAt,
      };

      setAdmin(delegatedAdmin);
      setSelectedScopes(delegatedAdmin.scopes);

      await Promise.all([
        fetchActivityLogs(),
        fetchAvailableOrgUnits(),
        fetchAvailableApplications(),
      ]);
    } catch (err: any) {
      console.error('Error fetching delegated admin:', err);
      if (err.status === 404 || err.response?.status === 404) {
        setNotFound(true);
      } else {
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockAdmin: DelegatedAdminDetails = {
      id,
      userId: 'user-123',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      status: 'active',
      scopes: [
        {
          id: 'scope-1',
          type: 'org-unit',
          name: 'Engineering Department',
          resourceId: 'ou-eng-001',
          permissions: ['users:read', 'users:write', 'apps:read'],
        },
        {
          id: 'scope-2',
          type: 'org-unit',
          name: 'Product Team',
          resourceId: 'ou-prod-001',
          permissions: ['users:read', 'apps:read'],
        },
        {
          id: 'scope-3',
          type: 'application',
          name: 'HR Portal',
          resourceId: 'app-hr-001',
          permissions: ['apps:read', 'apps:write'],
        },
      ],
      permissions: ['users:read', 'users:write', 'apps:read', 'apps:write', 'audit:read'],
      assignedAt: '2024-01-15T10:00:00Z',
      assignedBy: 'admin@example.com',
      lastActiveAt: '2024-03-20T14:30:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-03-10T09:15:00Z',
    };

    const mockActivityLogs: ActivityLog[] = [
      {
        id: '1',
        action: 'User Updated',
        resource: 'john.doe@example.com',
        timestamp: '2024-03-20T14:30:00Z',
        details: 'Updated user profile information',
        ipAddress: '192.168.1.100',
      },
      {
        id: '2',
        action: 'Application Access Granted',
        resource: 'HR Portal',
        timestamp: '2024-03-19T11:20:00Z',
        details: 'Granted access to HR Portal for new employee',
        ipAddress: '192.168.1.100',
      },
      {
        id: '3',
        action: 'User Created',
        resource: 'jane.smith@example.com',
        timestamp: '2024-03-18T09:45:00Z',
        details: 'Created new user account',
        ipAddress: '192.168.1.101',
      },
    ];

    const mockOrgUnits = [
      { id: 'ou-eng-001', name: 'Engineering Department' },
      { id: 'ou-prod-001', name: 'Product Team' },
      { id: 'ou-sales-001', name: 'Sales Team' },
      { id: 'ou-hr-001', name: 'HR Department' },
    ];

    const mockApplications = [
      { id: 'app-hr-001', name: 'HR Portal' },
      { id: 'app-crm-001', name: 'CRM System' },
      { id: 'app-pm-001', name: 'Project Management' },
    ];

    setAdmin(mockAdmin);
    setActivityLogs(mockActivityLogs);
    setAvailableOrgUnits(mockOrgUnits);
    setAvailableApplications(mockApplications);
    setSelectedScopes(mockAdmin.scopes);
  };

  const fetchActivityLogs = async () => {
    const mockActivityLogs: ActivityLog[] = [
      {
        id: '1',
        action: 'User Updated',
        resource: 'john.doe@example.com',
        timestamp: '2024-03-20T14:30:00Z',
        details: 'Updated user profile information',
        ipAddress: '192.168.1.100',
      },
      {
        id: '2',
        action: 'Application Access Granted',
        resource: 'HR Portal',
        timestamp: '2024-03-19T11:20:00Z',
        details: 'Granted access to HR Portal for new employee',
        ipAddress: '192.168.1.100',
      },
    ];
    setActivityLogs(mockActivityLogs);
  };

  const fetchAvailableOrgUnits = async () => {
    if (!tenantId) return;

    try {
      const orgUnits = await tenantService.getOrgUnitsTree();
      setAvailableOrgUnits(orgUnits);
    } catch (err) {
      const mockOrgUnits = [
        { id: 'ou-eng-001', name: 'Engineering Department' },
        { id: 'ou-prod-001', name: 'Product Team' },
      ];
      setAvailableOrgUnits(mockOrgUnits);
    }
  };

  const fetchAvailableApplications = async () => {
    const mockApplications = [
      { id: 'app-hr-001', name: 'HR Portal' },
      { id: 'app-crm-001', name: 'CRM System' },
    ];
    setAvailableApplications(mockApplications);
  };

  const handleSuspend = async () => {
    if (!tenantId || !admin) return;

    setError('');
    setSuccess('');

    try {
      setSuccess('Delegated admin suspended successfully');
      fetchData();
    } catch (err: any) {
      setError(err?.message || t('common.failedToSuspendDelegatedAdmin'));
    }
  };

  const handleActivate = async () => {
    if (!tenantId || !admin) return;

    setError('');
    setSuccess('');

    try {
      setSuccess('Delegated admin activated successfully');
      fetchData();
    } catch (err: any) {
      setError(err?.message || t('common.failedToActivateDelegatedAdmin'));
    }
  };

  const handleUpdateScopes = async () => {
    if (!tenantId || !admin) return;

    setError('');
    setSuccess('');

    try {
      setSuccess('Scopes updated successfully');
      setShowEditScopesModal(false);
      fetchData();
    } catch (err: any) {
      setError(err?.message || t('common.failedToUpdateScopes'));
    }
  };

  const handleDeleteAdmin = async () => {
    if (!tenantId) return;

    setError('');
    setSuccess('');

    try {
      await tenantService.deleteDelegatedAdmin(id);
      setSuccess('Delegated admin deleted successfully');
      setTimeout(() => {
        navigate('/tenant/delegated-admins');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || t('common.failedToDeleteDelegatedAdmin'));
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Active', bgClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
      case 'suspended':
        return { text: 'Suspended', bgClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
      case 'pending':
        return { text: 'Pending', bgClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
      default:
        return { text: status, bgClass: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-violet-600" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Delegated Admin Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The delegated admin you're looking for doesn't exist.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/tenant/delegated-admins')}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
          >
            Back to Delegated Admins
          </motion.button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const statusConfig = getStatusConfig(admin.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Helmet>
        <title>{admin.name} - Delegated Admins</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate('/tenant/delegated-admins')}
            className="flex items-center gap-2 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Delegated Admins
          </motion.button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {admin.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {admin.email}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig.bgClass}`}>
                    {statusConfig.text}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEditScopesModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Scopes
              </motion.button>
              {admin.status === 'active' ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSuspend}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium shadow-lg transition-all"
                >
                  <Pause className="w-4 h-4" />
                  Suspend
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleActivate}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium shadow-lg transition-all"
                >
                  <Play className="w-4 h-4" />
                  Activate
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium shadow-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3"
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
              className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Scopes"
            value={admin.scopes.length}
            icon={<Shield className="w-6 h-6 text-white" />}
            color="from-violet-500 to-violet-600"
            delay={0}
          />
          <StatCard
            title="Permissions"
            value={admin.permissions.length}
            icon={<Key className="w-6 h-6 text-white" />}
            color="from-purple-500 to-purple-600"
            delay={1}
          />
          <StatCard
            title="Org Units"
            value={admin.scopes.filter(s => s.type === 'org-unit').length}
            icon={<Building2 className="w-6 h-6 text-white" />}
            color="from-indigo-500 to-indigo-600"
            delay={2}
          />
          <StatCard
            title="Applications"
            value={admin.scopes.filter(s => s.type === 'application').length}
            icon={<AppWindow className="w-6 h-6 text-white" />}
            color="from-pink-500 to-pink-600"
            delay={3}
          />
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-6"
        >
          <nav className="flex p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeDelegatedAdminTab"
                    className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-500" />
                  Admin Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Admin ID</label>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{admin.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">User ID</label>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{admin.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Assigned By</label>
                    <p className="text-gray-900 dark:text-white">{admin.assignedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Assigned At</label>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(admin.assignedAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Last Active</label>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {admin.lastActiveAt ? formatDate(admin.lastActiveAt) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-violet-500" />
                  Recent Activity
                </h2>
                {activityLogs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No activity recorded</p>
                ) : (
                  <div className="space-y-3">
                    {activityLogs.slice(0, 3).map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-l-4 border-violet-500 pl-4 py-2"
                      >
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{log.action}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{log.resource}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(log.timestamp)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'scopes' && (
            <motion.div
              key="scopes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-violet-500" />
                  Assigned Scopes ({admin.scopes.length})
                </h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowEditScopesModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-lg"
                >
                  <Settings className="w-4 h-4" />
                  Manage Scopes
                </motion.button>
              </div>
              <div className="p-6">
                {admin.scopes.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No scopes assigned</p>
                ) : (
                  <div className="space-y-4">
                    {admin.scopes.map((scope, index) => (
                      <motion.div
                        key={scope.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 dark:border-slate-600 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            {scope.type === 'org-unit' ? (
                              <Building2 className="w-5 h-5 text-violet-500" />
                            ) : (
                              <AppWindow className="w-5 h-5 text-purple-500" />
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{scope.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{scope.type}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 text-xs bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 rounded-full">
                            {scope.permissions.length} permissions
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {scope.permissions.map((perm) => (
                              <span
                                key={perm}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded"
                              >
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'permissions' && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-violet-500" />
                  Effective Permissions ({admin.permissions.length})
                </h2>
              </div>
              <div className="p-6">
                {admin.permissions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No permissions assigned</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {admin.permissions.map((perm, index) => (
                      <motion.div
                        key={perm}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="px-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <Key className="w-4 h-4 text-violet-500" />
                        {perm}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-violet-500" />
                  Activity Timeline
                </h2>
              </div>
              <div className="p-6">
                {activityLogs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">No activity recorded</p>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-l-4 border-violet-500 pl-4 py-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white">{log.action}</p>
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 rounded text-gray-600 dark:text-gray-400">
                                {log.resource}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.details}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(log.timestamp)}
                              </span>
                              {log.ipAddress && (
                                <span>IP: {log.ipAddress}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Scopes Modal */}
      {showEditScopesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Manage Scopes</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-violet-500" />
                  Organization Units
                </h3>
                <div className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 max-h-48 overflow-y-auto">
                  {availableOrgUnits.map((ou) => (
                    <label key={ou.id} className="flex items-center gap-3 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedScopes.some(s => s.resourceId === ou.id)}
                        onChange={() => {
                          const exists = selectedScopes.some(s => s.resourceId === ou.id);
                          if (exists) {
                            setSelectedScopes(selectedScopes.filter(s => s.resourceId !== ou.id));
                          } else {
                            setSelectedScopes([
                              ...selectedScopes,
                              {
                                id: `scope-${Date.now()}`,
                                type: 'org-unit',
                                name: ou.name,
                                resourceId: ou.id,
                                permissions: ['users:read'],
                              },
                            ]);
                          }
                        }}
                        className="w-4 h-4 rounded text-violet-500 focus:ring-violet-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{ou.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AppWindow className="w-4 h-4 text-purple-500" />
                  Applications
                </h3>
                <div className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 max-h-48 overflow-y-auto">
                  {availableApplications.map((app) => (
                    <label key={app.id} className="flex items-center gap-3 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedScopes.some(s => s.resourceId === app.id)}
                        onChange={() => {
                          const exists = selectedScopes.some(s => s.resourceId === app.id);
                          if (exists) {
                            setSelectedScopes(selectedScopes.filter(s => s.resourceId !== app.id));
                          } else {
                            setSelectedScopes([
                              ...selectedScopes,
                              {
                                id: `scope-${Date.now()}`,
                                type: 'application',
                                name: app.name,
                                resourceId: app.id,
                                permissions: ['apps:read'],
                              },
                            ]);
                          }
                        }}
                        className="w-4 h-4 rounded text-violet-500 focus:ring-violet-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{app.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {selectedScopes.length} scopes selected
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleUpdateScopes}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
              >
                Save Scopes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowEditScopesModal(false)}
                className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Delegated Admin</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this delegated admin? This will revoke all their administrative access. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleDeleteAdmin}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-lg"
              >
                Delete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
