import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  AppWindow,
  Shield,
  GitBranch,
  BarChart3,
  Edit,
  Plus,
  Trash2,
  ChevronRight,
  Folder,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  UserPlus,
  XCircle
} from 'lucide-react';

// Types
interface OrgUnit {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  path: string;
  level: number;
  status: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface OrgUnitUser {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  status: string;
  roles: string[];
  assignedAt: string;
  assignedByUserId?: string;
}

interface OrgUnitApplication {
  id: string;
  applicationId: string;
  name: string;
  type: string;
  category: string;
  status: string;
  assignedAt: string;
  userCount: number;
}

interface OrgUnitPolicy {
  id: string;
  policyId: string;
  name: string;
  category: string;
  type: string;
  isEnforced: boolean;
  appliedAt: string;
  appliedByUserId?: string;
}

interface OrgUnitHierarchy {
  id: string;
  name: string;
  parentId?: string;
  children: OrgUnitHierarchy[];
  userCount: number;
  applicationCount: number;
}

interface OrgUnitStatistics {
  orgUnitId: string;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalApplications: number;
  totalPolicies: number;
  directChildren: number;
  totalDescendants: number;
  complianceScore?: number;
  lastUpdated: string;
}

type Tab = 'overview' | 'users' | 'applications' | 'policies' | 'hierarchy' | 'statistics';

const tabs = [
  { key: 'overview', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
  { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { key: 'applications', label: 'Applications', icon: <AppWindow className="w-4 h-4" /> },
  { key: 'policies', label: 'Policies', icon: <Shield className="w-4 h-4" /> },
  { key: 'hierarchy', label: 'Hierarchy', icon: <GitBranch className="w-4 h-4" /> },
  { key: 'statistics', label: 'Statistics', icon: <BarChart3 className="w-4 h-4" /> },
];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, subtitle, icon, color, delay }: StatCardProps) => (
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
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantOrgUnitsDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const orgUnitId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [orgUnit, setOrgUnit] = useState<OrgUnit | null>(null);
  const [users, setUsers] = useState<OrgUnitUser[]>([]);
  const [applications, setApplications] = useState<OrgUnitApplication[]>([]);
  const [policies, setPolicies] = useState<OrgUnitPolicy[]>([]);
  const [hierarchy, setHierarchy] = useState<OrgUnitHierarchy | null>(null);
  const [statistics, setStatistics] = useState<OrgUnitStatistics | null>(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddApplicationModal, setShowAddApplicationModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
  });

  const tenantId = getTenantId();

  useEffect(() => {
    fetchOrgUnit();
  }, [orgUnitId]);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers();
    } else if (activeTab === 'applications' && applications.length === 0) {
      fetchApplications();
    } else if (activeTab === 'policies' && policies.length === 0) {
      fetchPolicies();
    } else if (activeTab === 'hierarchy' && !hierarchy) {
      fetchHierarchy();
    } else if (activeTab === 'statistics' && !statistics) {
      fetchStatistics();
    }
  }, [activeTab]);

  const fetchOrgUnit = async () => {
    setLoading(true);
    setError('');
    try {
      // Mock data for demo
      setOrgUnit({
        id: orgUnitId,
        tenantId: tenantId || '',
        name: 'Engineering Department',
        description: 'Main engineering organizational unit',
        path: '/root/engineering',
        level: 1,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setEditForm({
        name: 'Engineering Department',
        description: 'Main engineering organizational unit',
      });
    } catch (err: any) {
      setError(err?.message || t('common.failedToFetchOrgUnit'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsers([]);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      setApplications([]);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const fetchPolicies = async () => {
    try {
      setPolicies([]);
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    }
  };

  const fetchHierarchy = async () => {
    try {
      setHierarchy(null);
    } catch (err) {
      console.error('Failed to fetch hierarchy:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatistics({
        orgUnitId,
        totalUsers: 45,
        activeUsers: 42,
        inactiveUsers: 3,
        totalApplications: 12,
        totalPolicies: 8,
        directChildren: 4,
        totalDescendants: 15,
        complianceScore: 92,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleUpdateOrgUnit = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      setSuccess('Org unit updated successfully');
      setShowEditModal(false);
      fetchOrgUnit();
    } catch (err: any) {
      setError(err?.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the org unit?')) return;
    try {
      setSuccess('User removed successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err?.message);
    }
  };

  const handleRemoveApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to remove this application from the org unit?')) return;
    try {
      setSuccess('Application removed successfully');
      fetchApplications();
    } catch (err: any) {
      setError(err?.message);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderHierarchyTree = (node: OrgUnitHierarchy, level: number = 0) => {
    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.1 }}
        className={`${level > 0 ? 'ml-6' : ''}`}
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`flex items-center justify-between p-4 rounded-xl mb-2 cursor-pointer transition-all ${
            node.id === orgUnitId
              ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-500'
              : 'bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
          onClick={() => {
            if (node.id !== orgUnitId) {
              navigate(`/tenant/org-units/${node.id}`);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${level === 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-slate-600'}`}>
              {level === 0 ? <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <FolderOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{node.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {node.userCount} users • {node.applicationCount} apps
              </div>
            </div>
          </div>
          {node.id === orgUnitId && (
            <span className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full">Current</span>
          )}
        </motion.div>
        {node.children && node.children.length > 0 && (
          <div className="border-l-2 border-gray-200 dark:border-slate-600 ml-4">
            {node.children.map((child) => renderHierarchyTree(child, level + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!orgUnit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl flex items-center gap-3"
        >
          <AlertCircle className="w-6 h-6" />
          Org unit not found
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
      <Helmet>
        <title>{orgUnit.name} - Org Unit Details - OneSign</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {orgUnit.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                {orgUnit.path}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-medium"
          >
            <Edit className="w-5 h-5" />
            Edit Org Unit
          </motion.button>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200 dark:border-slate-700"
      >
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`relative flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeOrgUnitTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Org Unit Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                <div className="text-gray-900 dark:text-white font-medium">{orgUnit.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                <StatusBadge status={orgUnit.status} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Path</label>
                <div className="text-gray-900 dark:text-white font-mono text-sm bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded-lg">{orgUnit.path}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Level</label>
                <div className="text-gray-900 dark:text-white">{orgUnit.level}</div>
              </div>
              {orgUnit.parentName && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Parent Org Unit</label>
                  <div className="text-gray-900 dark:text-white">{orgUnit.parentName}</div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created At</label>
                <div className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(orgUnit.createdAt)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Updated At</label>
                <div className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(orgUnit.updatedAt)}
                </div>
              </div>
            </div>
            {orgUnit.description && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <div className="text-gray-900 dark:text-white">{orgUnit.description}</div>
              </div>
            )}
          </div>

          {orgUnit.metadata && Object.keys(orgUnit.metadata).length > 0 && (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Metadata</h3>
              <pre className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl overflow-auto text-sm text-gray-800 dark:text-gray-200">
                {JSON.stringify(orgUnit.metadata, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Users ({users.length})
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </motion.button>
          </div>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No users assigned to this org unit</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{user.displayName}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={user.status} />
                      {user.roles.length > 0 && (
                        <div className="flex gap-1">
                          {user.roles.map((role, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-xs">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Assigned: {formatDate(user.assignedAt)}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveUser(user.userId)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AppWindow className="w-5 h-5 text-blue-500" />
              Applications ({applications.length})
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddApplicationModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Application
            </motion.button>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <AppWindow className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No applications assigned to this org unit</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{app.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {app.type} • {app.category}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{app.userCount} users</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Assigned: {formatDate(app.assignedAt)}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveApplication(app.applicationId)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Policies ({policies.length})
          </h3>
          {policies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No policies applied to this org unit</p>
            </div>
          ) : (
            <div className="space-y-4">
              {policies.map((policy, index) => (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{policy.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {policy.category} • {policy.type}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Applied: {formatDate(policy.appliedAt)}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        policy.isEnforced
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {policy.isEnforced ? 'Enforced' : 'Not Enforced'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-500" />
            Organizational Hierarchy
          </h3>
          {!hierarchy ? (
            <div className="text-center py-12">
              <GitBranch className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading hierarchy...</p>
            </div>
          ) : (
            <div className="space-y-2">{renderHierarchyTree(hierarchy)}</div>
          )}
        </motion.div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {!statistics ? (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading statistics...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={statistics.totalUsers}
                  subtitle={`${statistics.activeUsers} active • ${statistics.inactiveUsers} inactive`}
                  icon={<Users className="w-6 h-6 text-white" />}
                  color="from-blue-500 to-blue-600"
                  delay={0}
                />
                <StatCard
                  title="Applications"
                  value={statistics.totalApplications}
                  icon={<AppWindow className="w-6 h-6 text-white" />}
                  color="from-green-500 to-emerald-600"
                  delay={1}
                />
                <StatCard
                  title="Policies"
                  value={statistics.totalPolicies}
                  icon={<Shield className="w-6 h-6 text-white" />}
                  color="from-purple-500 to-purple-600"
                  delay={2}
                />
                <StatCard
                  title="Direct Children"
                  value={statistics.directChildren}
                  subtitle={`${statistics.totalDescendants} total descendants`}
                  icon={<GitBranch className="w-6 h-6 text-white" />}
                  color="from-orange-500 to-amber-600"
                  delay={3}
                />
              </div>

              {statistics.complianceScore !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Compliance Score</h3>
                  <div className="flex items-center gap-8">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          className="text-gray-200 dark:text-slate-700"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke={
                            statistics.complianceScore >= 90
                              ? '#10b981'
                              : statistics.complianceScore >= 70
                              ? '#3b82f6'
                              : statistics.complianceScore >= 50
                              ? '#f59e0b'
                              : '#dc2626'
                          }
                          strokeWidth="8"
                          fill="transparent"
                          initial={{ strokeDasharray: '0 352' }}
                          animate={{ strokeDasharray: `${(statistics.complianceScore / 100) * 352} 352` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-3xl font-bold text-gray-900 dark:text-white"
                          >
                            {statistics.complianceScore}
                          </motion.div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Compliance score indicates how well this org unit adheres to configured policies.
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Last updated: {formatDate(statistics.lastUpdated)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`${t('common.edit')} ${t('common.orgUnit')}`}
        footer={
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpdateOrgUnit}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title={`${t('common.add')} ${t('common.user')} ${t('common.to')} ${t('common.orgUnit')}`}
        footer={
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddUserModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Add User
            </motion.button>
          </>
        }
      >
        <div className="text-gray-600 dark:text-gray-400 text-center py-8">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          User selection interface would go here.
        </div>
      </Modal>

      {/* Add Application Modal */}
      <Modal
        isOpen={showAddApplicationModal}
        onClose={() => setShowAddApplicationModal(false)}
        title={`${t('common.add')} ${t('common.application')} ${t('common.to')} ${t('common.orgUnit')}`}
        footer={
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddApplicationModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-700 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Add Application
            </motion.button>
          </>
        }
      >
        <div className="text-gray-600 dark:text-gray-400 text-center py-8">
          <AppWindow className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          Application selection interface would go here.
        </div>
      </Modal>
    </div>
  );
}
