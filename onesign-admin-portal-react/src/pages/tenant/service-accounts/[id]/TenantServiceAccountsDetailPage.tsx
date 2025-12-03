import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/common/Modal';
import {
  KeyRound,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Key,
  BarChart3,
  FileText,
  Users,
  Settings,
  RefreshCw
} from 'lucide-react';

interface ServiceAccount {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  clientId: string;
  status: 'Active' | 'Disabled' | 'Suspended';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastUsedAt: string | null;
  permissions: string[];
  secrets: ServiceAccountSecret[];
}

interface ServiceAccountSecret {
  id: string;
  name: string;
  hint: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  isActive: boolean;
}

interface ApiUsageStats {
  totalCalls: number;
  callsToday: number;
  callsThisWeek: number;
  callsThisMonth: number;
  rateLimit: number;
  rateLimitRemaining: number;
  rateLimitReset: string;
  topEndpoints: EndpointStat[];
  dailyUsage: DailyUsage[];
}

interface EndpointStat {
  endpoint: string;
  method: string;
  calls: number;
  avgResponseTime: number;
}

interface DailyUsage {
  date: string;
  calls: number;
  errors: number;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  status: 'Success' | 'Failed';
}

type Tab = 'overview' | 'credentials' | 'usage' | 'permissions' | 'audit';

const tabs = [
  { key: 'overview', label: 'Overview', icon: <KeyRound className="w-4 h-4" /> },
  { key: 'credentials', label: 'Credentials', icon: <Key className="w-4 h-4" /> },
  { key: 'usage', label: 'Usage', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'permissions', label: 'Permissions', icon: <Shield className="w-4 h-4" /> },
  { key: 'audit', label: 'Audit', icon: <FileText className="w-4 h-4" /> },
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
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>{icon}</div>
    </div>
  </motion.div>
);

export default function TenantServiceAccountsDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const accountId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [account, setAccount] = useState<ServiceAccount | null>(null);
  const [usageStats, setUsageStats] = useState<ApiUsageStats | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  const [showGenerateSecretModal, setShowGenerateSecretModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRevokeSecretModal, setShowRevokeSecretModal] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState<ServiceAccountSecret | null>(null);
  const [newSecretValue, setNewSecretValue] = useState('');

  const [secretName, setSecretName] = useState('');
  const [secretExpiry, setSecretExpiry] = useState('90');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchServiceAccount();
  }, [accountId]);

  useEffect(() => {
    if (activeTab === 'usage') fetchUsageStats();
    else if (activeTab === 'audit') fetchAuditLog();
  }, [activeTab]);

  const fetchServiceAccount = async () => {
    setLoading(true);
    try {
      const mockData: ServiceAccount = {
        id: accountId,
        tenantId: tenantId || '',
        name: 'Production API Service',
        description: 'Service account for production API access',
        clientId: 'sa_' + accountId.substring(0, 24),
        status: 'Active',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin@example.com',
        lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        permissions: ['api:read', 'api:write', 'users:read', 'workflows:execute'],
        secrets: [
          { id: '1', name: 'Primary Secret', hint: '****abc123', createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), isActive: true },
          { id: '2', name: 'Backup Secret', hint: '****xyz789', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), lastUsedAt: null, isActive: true },
        ],
      };
      setAccount(mockData);
    } catch (err) {
      setError('Failed to load service account');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    const mockStats: ApiUsageStats = {
      totalCalls: 125847, callsToday: 3421, callsThisWeek: 24563, callsThisMonth: 98234,
      rateLimit: 10000, rateLimitRemaining: 7234, rateLimitReset: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      topEndpoints: [
        { endpoint: '/api/tenant/users', method: 'GET', calls: 5234, avgResponseTime: 145 },
        { endpoint: '/api/tenant/workflows', method: 'POST', calls: 3421, avgResponseTime: 267 },
      ],
      dailyUsage: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        calls: Math.floor(Math.random() * 5000) + 2000,
        errors: Math.floor(Math.random() * 50),
      })),
    };
    setUsageStats(mockStats);
  };

  const fetchAuditLog = async () => {
    const mockAudit: AuditEntry[] = [
      { id: '1', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), action: 'API Call', actor: 'Service Account', ipAddress: '203.0.113.42', userAgent: 'OneSign-SDK/1.0', details: 'GET /api/tenant/users', status: 'Success' },
      { id: '2', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), action: 'Secret Rotated', actor: 'admin@example.com', ipAddress: '198.51.100.10', userAgent: 'Mozilla/5.0', details: 'Generated new secret', status: 'Success' },
    ];
    setAuditLog(mockAudit);
  };

  const handleGenerateSecret = async () => {
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const generatedSecret = 'sk_' + Array.from({ length: 32 }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('');
      setNewSecretValue(generatedSecret);
      setSuccess('Secret generated successfully');
      setTimeout(() => fetchServiceAccount(), 2000);
    } catch (err) {
      setError('Failed to generate secret');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />Service account not found
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
      <Helmet><title>{account.name} - Service Account - OneSign</title></Helmet>

      <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mb-6">
        <ArrowLeft className="w-5 h-5" />Back
      </motion.button>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{account.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{account.description}</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full font-semibold ${account.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
          {account.status}
        </span>
      </motion.div>

      <AnimatePresence>
        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</motion.div>}
        {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"><CheckCircle className="w-5 h-5" />{success}</motion.div>}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-2">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)} className={`relative flex-1 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === tab.key ? 'text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              {activeTab === tab.key && <motion.div layoutId="activeServiceTab" className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              <span className="relative z-10 flex items-center justify-center gap-2">{tab.icon}{tab.label}</span>
            </button>
          ))}
        </nav>
      </motion.div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Secrets" value={account.secrets.length} icon={<Key className="w-6 h-6 text-white" />} color="from-indigo-500 to-indigo-600" delay={0} />
            <StatCard title="Permissions" value={account.permissions.length} icon={<Shield className="w-6 h-6 text-white" />} color="from-purple-500 to-purple-600" delay={1} />
            <StatCard title="Active Secrets" value={account.secrets.filter(s => s.isActive).length} icon={<CheckCircle className="w-6 h-6 text-white" />} color="from-green-500 to-emerald-600" delay={2} />
            <StatCard title="Status" value={account.status} icon={<Activity className="w-6 h-6 text-white" />} color={account.status === 'Active' ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} delay={3} />
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><KeyRound className="w-5 h-5 text-indigo-500" />Client ID</h3>
            <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 flex items-center justify-between">
              <code className="text-sm font-mono text-gray-900 dark:text-white">{account.clientId}</code>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { navigator.clipboard.writeText(account.clientId); setSuccess('Copied!'); }} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                <Copy className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'credentials' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Key className="w-5 h-5 text-indigo-500" />API Secrets</h3>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowGenerateSecretModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg font-medium">
                <Plus className="w-4 h-4" />Generate Secret
              </motion.button>
            </div>
            <div className="space-y-4">
              {account.secrets.map((secret, index) => (
                <motion.div key={secret.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border border-gray-200 dark:border-slate-600 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 dark:text-white">{secret.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${secret.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                          {secret.isActive ? 'Active' : 'Revoked'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-mono">{secret.hint}</span> • Created: {formatDate(secret.createdAt)}
                      </div>
                    </div>
                    {secret.isActive && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedSecret(secret); setShowRevokeSecretModal(true); }} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'usage' && usageStats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Today" value={usageStats.callsToday.toLocaleString()} icon={<Activity className="w-6 h-6 text-white" />} color="from-blue-500 to-blue-600" delay={0} />
            <StatCard title="This Week" value={usageStats.callsThisWeek.toLocaleString()} icon={<BarChart3 className="w-6 h-6 text-white" />} color="from-green-500 to-emerald-600" delay={1} />
            <StatCard title="This Month" value={usageStats.callsThisMonth.toLocaleString()} icon={<BarChart3 className="w-6 h-6 text-white" />} color="from-purple-500 to-purple-600" delay={2} />
            <StatCard title="Total" value={usageStats.totalCalls.toLocaleString()} icon={<BarChart3 className="w-6 h-6 text-white" />} color="from-orange-500 to-amber-600" delay={3} />
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate Limits</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Usage</span>
                <span className="font-medium text-gray-900 dark:text-white">{usageStats.rateLimitRemaining.toLocaleString()} / {usageStats.rateLimit.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(usageStats.rateLimitRemaining / usageStats.rateLimit) * 100}%` }} className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'permissions' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500" />Assigned Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {account.permissions.map((permission, index) => (
              <motion.div key={permission} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className="border border-gray-200 dark:border-slate-600 rounded-xl p-4 flex items-center justify-between">
                <span className="font-mono text-sm text-gray-900 dark:text-white">{permission}</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'audit' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-500" />Audit Trail</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {auditLog.map((entry, index) => (
              <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{entry.action}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">by {entry.actor}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${entry.status === 'Success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                    {entry.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(entry.timestamp)} • {entry.ipAddress}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <Modal isOpen={showGenerateSecretModal} onClose={() => { setShowGenerateSecretModal(false); setNewSecretValue(''); }} title="Generate New Secret">
        {newSecretValue ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2"><AlertCircle className="w-5 h-5" />Copy now - you won't see it again!</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl font-mono text-sm break-all">{newSecretValue}</div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { navigator.clipboard.writeText(newSecretValue); setSuccess('Copied!'); }} className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl">
              <Copy className="w-4 h-4" />Copy to Clipboard
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secret Name</label>
              <input type="text" value={secretName} onChange={(e) => setSecretName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white" placeholder="e.g., Production Secret" />
            </div>
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerateSecret} disabled={processing} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl disabled:opacity-50">
                {processing ? 'Generating...' : 'Generate'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowGenerateSecretModal(false)} className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl">
                Cancel
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
