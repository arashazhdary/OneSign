import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Activity,
  X,
  Trash2,
  Lock,
  Unlock,
  Server,
  Globe
} from 'lucide-react';
import Modal from '@/components/common/Modal';

interface Token {
  id: string;
  name: string;
  type: 'access' | 'refresh' | 'api_key';
  token: string;
  prefix: string;
  permissions: string[];
  status: 'active' | 'expired' | 'revoked';
  expiresAt?: string;
  lastUsed?: string;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  ipWhitelist?: string[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function TenantTokensPage() {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showToken, setShowToken] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenType, setNewTokenType] = useState('api_key');
  const [newTokenPermissions, setNewTokenPermissions] = useState(['read', 'write']);
  const [newTokenIpWhitelist, setNewTokenIpWhitelist] = useState('');

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const data = await tenantService.getTokens();
      if (data && data.length > 0) {
        setTokens(data);
      } else {
        setTokens([]);
      }
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await tenantService.createToken({
        name: newTokenName,
        type: newTokenType as any,
        permissions: newTokenPermissions,
      });
      setSuccess('Token created successfully');
      setShowCreate(false);
      setNewTokenName('');
      setNewTokenType('api_key');
      setNewTokenPermissions(['read', 'write']);
      setNewTokenIpWhitelist('');
      fetchTokens();
    } catch (error) {
      setError('Failed to create token');
      console.error('Failed to create token:', error);
    }
  };

  const handleRevoke = async (tokenId: string) => {
    if (!confirm(t('tenant.tokens.confirmRevoke'))) return;
    setError('');
    setSuccess('');
    try {
      await tenantService.revokeToken(tokenId);
      setSuccess('Token revoked successfully');
      fetchTokens();
    } catch (error) {
      setError('Failed to revoke token');
      console.error('Failed to revoke token:', error);
    }
  };

  const handleRotate = async (tokenId: string) => {
    if (!confirm(t('tenant.tokens.confirmRotate'))) return;
    setError('');
    setSuccess('');
    try {
      await tenantService.rotateToken(tokenId);
      setSuccess('Token rotated successfully');
      fetchTokens();
    } catch (error) {
      setError('Failed to rotate token');
      console.error('Failed to rotate token:', error);
    }
  };

  const handleCopy = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePermission = (perm: string) => {
    setNewTokenPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      access: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      refresh: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      api_key: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-700';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      revoked: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400',
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-700';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'revoked': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const maskToken = (token: string, prefix: string) => {
    return prefix + '•'.repeat(20) + token.slice(-8);
  };

  const filteredTokens = filterType
    ? tokens.filter(t => t.type === filterType)
    : tokens;

  // Stats
  const totalTokens = tokens.length;
  const activeTokens = tokens.filter(t => t.status === 'active').length;
  const revokedTokens = tokens.filter(t => t.status === 'revoked').length;
  const totalApiCalls = tokens.reduce((acc, t) => acc + t.usageCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Key className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">Loading tokens...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Access Tokens - OneSign</title>
      </Helmet>

      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Key className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Access Tokens
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage API keys and access tokens
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchTokens}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4" />
              Create Token
            </motion.button>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <XCircle className="w-5 h-5 flex-shrink-0" />
              {error}
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              {success}
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tokens"
            value={totalTokens}
            icon={Key}
            color="bg-gradient-to-br from-indigo-500 to-purple-600"
            delay={0}
          />
          <StatCard
            title="Active"
            value={activeTokens}
            icon={Unlock}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={1}
          />
          <StatCard
            title="Revoked"
            value={revokedTokens}
            icon={Lock}
            color="bg-gradient-to-br from-slate-500 to-slate-600"
            delay={2}
          />
          <StatCard
            title="Total API Calls"
            value={totalApiCalls.toLocaleString()}
            icon={Activity}
            color="bg-gradient-to-br from-blue-500 to-cyan-600"
            delay={3}
          />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              <option value="api_key">API Key</option>
              <option value="access">Access Token</option>
              <option value="refresh">Refresh Token</option>
            </select>
          </div>
        </motion.div>

        {/* Tokens List */}
        <div className="space-y-4">
          {filteredTokens.map((token, index) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full">
                  {/* Token Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{token.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium ${getTypeBadge(token.type)}`}>
                      {token.type === 'api_key' ? 'API Key' : token.type === 'access' ? 'Access' : 'Refresh'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium ${getStatusBadge(token.status)}`}>
                      {getStatusIcon(token.status)}
                      {token.status}
                    </span>
                  </div>

                  {/* Token Display */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-sm font-mono text-slate-700 dark:text-slate-300 break-all">
                        {showToken === token.id ? token.token : maskToken(token.token, token.prefix)}
                      </code>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowToken(showToken === token.id ? null : token.id)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title={showToken === token.id ? 'Hide' : 'Show'}
                        >
                          {showToken === token.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopy(token.token, token.id)}
                          className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                          title="Copy"
                        >
                          {copiedId === token.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mb-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Permissions:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {token.permissions.map((perm, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          <Shield className="w-3 h-3" />
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Token Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created</p>
                      <p className="font-medium text-slate-900 dark:text-white">{new Date(token.createdAt).toLocaleDateString()}</p>
                    </div>
                    {token.expiresAt && (
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Expires</p>
                        <p className="font-medium text-slate-900 dark:text-white">{new Date(token.expiresAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    {token.lastUsed && (
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Last Used</p>
                        <p className="font-medium text-slate-900 dark:text-white">{new Date(token.lastUsed).toLocaleString()}</p>
                      </div>
                    )}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">API Calls</p>
                      <p className="font-medium text-slate-900 dark:text-white">{token.usageCount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* IP Whitelist */}
                  {token.ipWhitelist && token.ipWhitelist.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        IP Whitelist:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {token.ipWhitelist.map((ip, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-lg font-mono text-slate-700 dark:text-slate-300">
                            {ip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expiry Warning */}
                  {token.expiresAt && token.status === 'active' && (
                    (() => {
                      const daysUntilExpiry = Math.ceil((new Date(token.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      if (daysUntilExpiry <= 30) {
                        return (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm flex items-center gap-3"
                          >
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-amber-800 dark:text-amber-300">Expiring Soon</p>
                              <p className="text-amber-700 dark:text-amber-400">This token will expire in {daysUntilExpiry} days. Consider rotating it before expiry.</p>
                            </div>
                          </motion.div>
                        );
                      }
                      return null;
                    })()
                  )}
                </div>

                {/* Actions */}
                {token.status === 'active' && (
                  <div className="flex lg:flex-col gap-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRotate(token.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Rotate
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRevoke(token.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Revoke
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {filteredTokens.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center"
            >
              <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Key className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No tokens found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first access token to get started
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Token
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Create Token Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title={t('tenant.tokens.createNewToken')}
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Token Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Production API Key"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Token Type
            </label>
            <select
              value={newTokenType}
              onChange={(e) => setNewTokenType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="api_key">API Key (No expiration)</option>
              <option value="access">Access Token (Expires in 90 days)</option>
              <option value="refresh">Refresh Token (Expires in 1 year)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Permissions
            </label>
            <div className="space-y-2">
              {['read', 'write', 'delete', 'admin'].map((perm) => (
                <label key={perm} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={newTokenPermissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                  />
                  <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{perm}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              IP Whitelist (Optional)
            </label>
            <input
              type="text"
              placeholder="192.168.1.0/24, 10.0.0.0/16"
              value={newTokenIpWhitelist}
              onChange={(e) => setNewTokenIpWhitelist(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Comma-separated list of IP addresses or CIDR ranges
            </p>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Important:</strong> The token will be displayed only once after creation. Make sure to copy and store it securely.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              <Key className="w-4 h-4" />
              Create Token
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
