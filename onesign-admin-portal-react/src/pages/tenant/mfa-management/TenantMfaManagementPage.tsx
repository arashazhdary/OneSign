import { useState, useEffect } from 'react';
import { getTenantId } from '@/lib/tenant-context';
import { securityService } from '@/lib/api/services/security.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Smartphone,
  Mail,
  Key,
  Monitor,
  Tablet,
  Laptop,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Ban,
  Building2,
  Clock,
  Globe,
  Settings,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';

interface MFAMethod {
  id: string;
  userId: string;
  userEmail: string;
  methodType: 'TOTP' | 'Email' | 'SMS';
  isEnabled: boolean;
  enrolledAt: string;
}

interface TrustedDevice {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: string;
  trustedAt: string;
  lastUsedAt: string;
  ipAddress: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

type Tab = 'methods' | 'devices' | 'rules';

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

const getMethodIcon = (type: string) => {
  switch (type) {
    case 'TOTP': return <Key className="w-4 h-4" />;
    case 'Email': return <Mail className="w-4 h-4" />;
    case 'SMS': return <Smartphone className="w-4 h-4" />;
    default: return <Shield className="w-4 h-4" />;
  }
};

const getDeviceIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('phone') || lowerType.includes('mobile')) return <Smartphone className="w-4 h-4" />;
  if (lowerType.includes('tablet') || lowerType.includes('ipad')) return <Tablet className="w-4 h-4" />;
  if (lowerType.includes('laptop')) return <Laptop className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

export default function TenantMfaManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('methods');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [orgUnitRules, setOrgUnitRules] = useState<any[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'methods') fetchMFAMethods();
      else if (activeTab === 'devices') fetchTrustedDevices();
      else if (activeTab === 'rules') fetchOrgUnitRules();
    }
  }, [tenantId, activeTab]);

  const fetchMFAMethods = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data: MFAMethod[] = [];
      setMfaMethods(data || []);
    } catch (err) {
      console.error('Error fetching MFA methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrustedDevices = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data: TrustedDevice[] = [];
      setTrustedDevices(data || []);
    } catch (err) {
      console.error('Error fetching trusted devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgUnitRules = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await securityService.getOrgUnitMfaRules();
      setOrgUnitRules(data || []);
    } catch (err) {
      console.error('Error fetching org unit rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async (userId: string) => {
    if (!tenantId || !confirm(t('tenant.mfaManagement.confirmDisableMfa'))) return;
    setLoading(true);
    try {
      setSuccess(t('tenant.mfaManagement.messages.mfaDisabled'));
      fetchMFAMethods();
    } catch (err) {
      setError(t('tenant.mfaManagement.messages.failedToDisableMfa'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!tenantId || !confirm(t('tenant.mfaManagement.confirmDeleteMethod'))) return;
    setLoading(true);
    try {
      setSuccess(t('tenant.mfaManagement.messages.methodDeleted'));
      fetchMFAMethods();
    } catch (err) {
      setError(t('tenant.mfaManagement.messages.failedToDeleteMethod'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeTrust = async (deviceId: string) => {
    if (!tenantId || !confirm(t('tenant.mfaManagement.confirmRevokeTrust'))) return;
    setLoading(true);
    try {
      setSuccess(t('tenant.mfaManagement.messages.trustRevoked'));
      fetchTrustedDevices();
    } catch (err) {
      setError(t('tenant.mfaManagement.messages.failedToRevokeTrust'));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'methods' as Tab, label: 'MFA Methods', icon: Key },
    { id: 'devices' as Tab, label: 'Trusted Devices', icon: Monitor },
    { id: 'rules' as Tab, label: 'Org Unit Rules', icon: Building2 },
  ];

  const enabledMethods = mfaMethods.filter(m => m.isEnabled).length;
  const totpCount = mfaMethods.filter(m => m.methodType === 'TOTP').length;
  const emailCount = mfaMethods.filter(m => m.methodType === 'Email').length;

  if (loading && !mfaMethods.length && !trustedDevices.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">{t('tenant.mfaManagement.loading')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
      <Helmet>
        <title>{t('tenant.mfaManagement.pageTitle')}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('tenant.mfaManagement.title')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('tenant.mfaManagement.subtitle')}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total MFA Methods"
          value={mfaMethods.length}
          icon={<Key className="w-6 h-6 text-white" />}
          color="from-blue-500 to-cyan-600"
          delay={0}
        />
        <StatCard
          title="Enabled Methods"
          value={enabledMethods}
          icon={<ShieldCheck className="w-6 h-6 text-white" />}
          color="from-green-500 to-emerald-600"
          delay={1}
        />
        <StatCard
          title="Trusted Devices"
          value={trustedDevices.length}
          icon={<Monitor className="w-6 h-6 text-white" />}
          color="from-purple-500 to-indigo-600"
          delay={2}
        />
        <StatCard
          title="Org Unit Rules"
          value={orgUnitRules.length}
          icon={<Building2 className="w-6 h-6 text-white" />}
          color="from-orange-500 to-red-600"
          delay={3}
        />
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-2"
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
            className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 px-1 flex items-center gap-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeMfaTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* MFA Methods Tab */}
      {activeTab === 'methods' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrolled</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {mfaMethods.map((method, index) => (
                  <motion.tr
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                          <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{method.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 w-fit">
                        {getMethodIcon(method.methodType)}
                        {method.methodType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                        method.isEnabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {method.isEnabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {method.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(method.enrolledAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDisableMFA(method.userId)}
                          className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                          title="Disable All"
                        >
                          <ShieldOff className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteMethod(method.id)}
                          className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {mfaMethods.length === 0 && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700">
                  <Key className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No MFA methods found. Users can enroll MFA from their profile.</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Trusted Devices Tab */}
      {activeTab === 'devices' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trusted Since</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Used</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {trustedDevices.map((device, index) => (
                  <motion.tr
                    key={device.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          {getDeviceIcon(device.deviceType)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{device.deviceName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-gray-300">
                        {device.deviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Globe className="w-3 h-3" />
                        {device.ipAddress}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(device.trustedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(device.lastUsedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRevokeTrust(device.id)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        title="Revoke Trust"
                      >
                        <Ban className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {trustedDevices.length === 0 && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700">
                  <Monitor className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No trusted devices found.</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Org Unit Rules Tab */}
      {activeTab === 'rules' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Organization Unit MFA Rules</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure MFA requirements per organizational unit</p>
            </div>
          </div>

          {orgUnitRules.length > 0 ? (
            <div className="space-y-4">
              {orgUnitRules.map((rule, index) => (
                <motion.div
                  key={rule.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-slate-700 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                      <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{rule.orgUnitName || 'Organization Unit'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{rule.description || 'MFA requirement rule'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      rule.isRequired
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {rule.isRequired ? 'Required' : 'Optional'}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-700">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No organization unit MFA rules configured.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Rule
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
