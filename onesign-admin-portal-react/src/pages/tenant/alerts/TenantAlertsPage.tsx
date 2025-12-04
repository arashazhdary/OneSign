import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import Modal from '@/components/common/Modal';
import { securityService } from '@/lib/api/services/security.service';
import { Helmet } from 'react-helmet-async';
import {
  Bell,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Edit3,
  Trash2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Zap,
  Mail,
  MessageSquare,
  Webhook,
  Smartphone,
  Eye,
  History,
  X,
  FileText,
  Activity,
  Shield,
} from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: {
    type: 'threshold' | 'pattern' | 'anomaly';
    metric: string;
    operator: string;
    value: number | string;
  };
  channels: Array<{
    type: 'email' | 'sms' | 'slack' | 'webhook';
    config: any;
  }>;
  isEnabled: boolean;
  isMuted: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AlertHistory {
  id: string;
  alertRuleId: string;
  alertRuleName: string;
  triggeredAt: string;
  severity: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

type Tab = 'rules' | 'history' | 'templates';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  delay?: number;
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, color, delay = 0, subtitle }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function TenantAlertsPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('rules');

  // Alert Rules
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRule, setDeletingRule] = useState<AlertRule | null>(null);

  // Alert History
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<AlertHistory | null>(null);

  // Form
  const [form, setForm] = useState({
    name: '',
    description: '',
    conditionType: 'threshold' as 'threshold' | 'pattern' | 'anomaly',
    metric: '',
    operator: '>',
    value: '',
    channels: [] as Array<{ type: 'email' | 'sms' | 'slack' | 'webhook'; config: string }>,
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    isEnabled: true,
  });

  const tabs = [
    { id: 'rules' as Tab, label: 'Alert Rules', icon: Bell, count: alertRules.length },
    { id: 'history' as Tab, label: 'Alert History', icon: History, count: alertHistory.length },
    { id: 'templates' as Tab, label: 'Templates', icon: FileText, count: 0 },
  ];

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'rules') fetchAlertRules();
      if (activeTab === 'history') fetchAlertHistory();
    }
  }, [tenantId, activeTab]);

  const fetchAlertRules = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await securityService.getAlertRules();

      const mockRules: AlertRule[] = [
        {
          id: '1',
          name: 'High CPU Usage Alert',
          description: 'Alert when CPU usage exceeds 80%',
          condition: { type: 'threshold', metric: 'cpu_usage', operator: '>', value: 80 },
          channels: [
            { type: 'email', config: { recipients: ['admin@example.com'] } },
            { type: 'slack', config: { webhook: 'https://hooks.slack.com/...' } },
          ],
          isEnabled: true,
          isMuted: false,
          severity: 'high',
          createdAt: new Date().toISOString(),
          lastTriggered: new Date(Date.now() - 3600000).toISOString(),
          triggerCount: 12,
        },
        {
          id: '2',
          name: 'Failed Login Attempts',
          description: 'Alert on 5 or more failed login attempts',
          condition: { type: 'pattern', metric: 'failed_logins', operator: '>=', value: 5 },
          channels: [{ type: 'email', config: { recipients: ['security@example.com'] } }],
          isEnabled: true,
          isMuted: false,
          severity: 'critical',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastTriggered: new Date(Date.now() - 7200000).toISOString(),
          triggerCount: 45,
        },
      ];

      setAlertRules(data || mockRules);
    } catch (err: any) {
      console.error('Error fetching alert rules:', err);
      setError(err?.message || t('common.failedToFetchAlertRules'));
      setAlertRules([
        {
          id: '1',
          name: 'High CPU Usage Alert',
          description: 'Alert when CPU usage exceeds 80%',
          condition: { type: 'threshold', metric: 'cpu_usage', operator: '>', value: 80 },
          channels: [{ type: 'email', config: { recipients: ['admin@example.com'] } }],
          isEnabled: true,
          isMuted: false,
          severity: 'high',
          createdAt: new Date().toISOString(),
          lastTriggered: new Date(Date.now() - 3600000).toISOString(),
          triggerCount: 12,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertHistory = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await securityService.getAlerts();

      const historyData: AlertHistory[] = data?.map((alert: any) => ({
        id: alert.id,
        alertRuleId: alert.ruleId || alert.id,
        alertRuleName: alert.ruleName || alert.title,
        triggeredAt: alert.createdAt || alert.timestamp,
        severity: alert.severity,
        message: alert.message || alert.description,
        status: alert.status,
      })) || [
        {
          id: '1',
          alertRuleId: '1',
          alertRuleName: 'High CPU Usage Alert',
          triggeredAt: new Date(Date.now() - 3600000).toISOString(),
          severity: 'high',
          message: 'CPU usage reached 85%',
          status: 'resolved',
        },
        {
          id: '2',
          alertRuleId: '2',
          alertRuleName: 'Failed Login Attempts',
          triggeredAt: new Date(Date.now() - 7200000).toISOString(),
          severity: 'critical',
          message: '7 failed login attempts detected',
          status: 'acknowledged',
        },
      ];

      setAlertHistory(historyData);
    } catch (err: any) {
      console.error('Error fetching alert history:', err);
      setError(err?.message || t('common.failedToFetchAlertHistory'));
      setAlertHistory([
        {
          id: '1',
          alertRuleId: '1',
          alertRuleName: 'High CPU Usage Alert',
          triggeredAt: new Date(Date.now() - 3600000).toISOString(),
          severity: 'high',
          message: 'CPU usage reached 85%',
          status: 'resolved',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setForm({
      name: '',
      description: '',
      conditionType: 'threshold',
      metric: '',
      operator: '>',
      value: '',
      channels: [],
      severity: 'medium',
      isEnabled: true,
    });
    setShowRuleModal(true);
  };

  const handleEditRule = (rule: AlertRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      description: rule.description,
      conditionType: rule.condition.type,
      metric: rule.condition.metric,
      operator: rule.condition.operator,
      value: String(rule.condition.value),
      channels: rule.channels.map((ch) => ({ type: ch.type, config: JSON.stringify(ch.config) })),
      severity: rule.severity,
      isEnabled: rule.isEnabled,
    });
    setShowRuleModal(true);
  };

  const handleSubmitRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setLoading(true);
    try {
      const ruleData = {
        name: form.name,
        description: form.description,
        condition: {
          type: form.conditionType,
          metric: form.metric,
          operator: form.operator,
          value: form.value,
        },
        channels: form.channels.map((ch) => ({
          type: ch.type,
          config: ch.config ? JSON.parse(ch.config) : {},
        })),
        severity: form.severity,
        isEnabled: form.isEnabled,
      };

      if (editingRule) {
        await securityService.updateAlertRule(editingRule.id, ruleData);
      } else {
        await securityService.createAlertRule(ruleData);
      }
      setSuccess(editingRule ? t('common.alertRuleUpdatedSuccessfully') : t('common.alertRuleCreatedSuccessfully'));
      setShowRuleModal(false);
      fetchAlertRules();
    } catch (err: any) {
      setError(err?.message || t('common.failedToSaveAlertRule'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async () => {
    if (!tenantId || !deletingRule) return;
    setLoading(true);
    try {
      await securityService.deleteAlertRule(deletingRule.id);
      setSuccess(t('common.alertRuleDeletedSuccessfully'));
      setShowDeleteModal(false);
      setDeletingRule(null);
      fetchAlertRules();
    } catch (err: any) {
      setError(err?.message || t('common.failedToDeleteAlertRule'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (id: string, isEnabled: boolean) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      await securityService.toggleAlertRule(id);
      setSuccess(`${t('common.alertRule')} ${isEnabled ? t('common.enabled') : t('common.disabled')} ${t('common.successfully')}`);
      fetchAlertRules();
    } catch (err: any) {
      setError(err?.message || t('common.failedToToggleAlertRule'));
    } finally {
      setLoading(false);
    }
  };

  const handleMuteRule = async (id: string) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      await securityService.muteAlertRule(id);
      setSuccess(t('common.alertRuleMutedSuccessfully'));
      fetchAlertRules();
    } catch (err: any) {
      setError(err?.message || t('common.failedToMuteAlertRule'));
    } finally {
      setLoading(false);
    }
  };

  const addChannel = () => {
    setForm({
      ...form,
      channels: [...form.channels, { type: 'email', config: '' }],
    });
  };

  const removeChannel = (index: number) => {
    setForm({
      ...form,
      channels: form.channels.filter((_, i) => i !== index),
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'slack':
        return <MessageSquare className="w-4 h-4" />;
      case 'webhook':
        return <Webhook className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStats = () => {
    const totalRules = alertRules.length;
    const activeRules = alertRules.filter((r) => r.isEnabled).length;
    const criticalAlerts = alertRules.filter((r) => r.severity === 'critical').length;
    const totalTriggers = alertRules.reduce((sum, r) => sum + r.triggerCount, 0);
    return { totalRules, activeRules, criticalAlerts, totalTriggers };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Alert Configuration - OneSign</title>
      </Helmet>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Alert Configuration
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Manage alert rules, channels, and notification history
                </p>
              </div>
            </div>
            {activeTab === 'rules' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateRule}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Alert Rule
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Rules"
            value={stats.totalRules}
            icon={Bell}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            title="Active Rules"
            value={stats.activeRules}
            icon={Activity}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            delay={1}
          />
          <StatCard
            title="Critical Alerts"
            value={stats.criticalAlerts}
            icon={Shield}
            color="bg-gradient-to-br from-red-500 to-red-600"
            delay={2}
          />
          <StatCard
            title="Total Triggers"
            value={stats.totalTriggers}
            icon={Zap}
            color="bg-gradient-to-br from-amber-500 to-amber-600"
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
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
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
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6"
        >
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all relative ${
                  activeTab === tab.id
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeAlertTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          </motion.div>
        )}

        {/* Alert Rules Tab */}
        {!loading && activeTab === 'rules' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {alertRules.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Alert Rules Configured
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Create alert rules to get notified when important events occur.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateRule}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Alert Rule
                </motion.button>
              </div>
            ) : (
              <div className="grid gap-4">
                {alertRules.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            rule.isEnabled
                              ? 'bg-indigo-100 dark:bg-indigo-900/30'
                              : 'bg-slate-100 dark:bg-slate-700'
                          }`}
                        >
                          <Bell
                            className={`w-6 h-6 ${
                              rule.isEnabled
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {rule.name}
                            </h3>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getSeverityColor(
                                rule.severity
                              )}`}
                            >
                              {getSeverityIcon(rule.severity)}
                              {rule.severity}
                            </span>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                rule.isEnabled
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {rule.isEnabled ? t('common.active') : t('common.disabled')}
                            </span>
                            {rule.isMuted && (
                              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                <VolumeX className="w-3 h-3" />
                                Muted
                              </span>
                            )}
                          </div>
                          {rule.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {rule.description}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Activity className="w-4 h-4 text-slate-400" />
                              <span>Condition:</span>
                              <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">
                                {rule.condition.metric} {rule.condition.operator} {rule.condition.value}
                              </code>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <span>Channels:</span>
                              <div className="flex gap-1">
                                {rule.channels.map((ch, idx) => (
                                  <span
                                    key={idx}
                                    className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded"
                                    title={ch.type}
                                  >
                                    {getChannelIcon(ch.type)}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-slate-400" />
                              {rule.triggerCount} triggers
                            </div>
                            {rule.lastTriggered && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-slate-400" />
                                Last: {new Date(rule.lastTriggered).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleRule(rule.id, !rule.isEnabled)}
                          className={`p-2 rounded-lg transition-all ${
                            rule.isEnabled
                              ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                              : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                          }`}
                          title={rule.isEnabled ? 'Disable' : 'Enable'}
                        >
                          {rule.isEnabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </motion.button>
                        {!rule.isMuted && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMuteRule(rule.id)}
                            className="p-2 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all"
                            title="Mute"
                          >
                            <VolumeX className="w-5 h-5" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditRule(rule)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setDeletingRule(rule);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Alert History Tab */}
        {!loading && activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {alertHistory.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Alert History
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Alert history will appear here once alerts are triggered.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {alertHistory.map((history, index) => (
                  <motion.div
                    key={history.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            history.status === 'active'
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : history.status === 'acknowledged'
                              ? 'bg-amber-100 dark:bg-amber-900/30'
                              : 'bg-emerald-100 dark:bg-emerald-900/30'
                          }`}
                        >
                          {history.status === 'active' ? (
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                          ) : history.status === 'acknowledged' ? (
                            <Eye className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              {history.alertRuleName}
                            </h3>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getSeverityColor(history.severity)}`}>
                              {history.severity}
                            </span>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                history.status === 'active'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : history.status === 'acknowledged'
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              }`}
                            >
                              {history.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {history.message}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Clock className="w-4 h-4 text-slate-400" />
                            Triggered: {new Date(history.triggeredAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedHistory(history);
                          setShowHistoryModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Templates Tab */}
        {!loading && activeTab === 'templates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center"
          >
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Alert Templates Coming Soon
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Pre-built alert templates will help you quickly configure common alerting scenarios.
            </p>
          </motion.div>
        )}

        {/* Create/Edit Alert Rule Modal */}
        <Modal
          isOpen={showRuleModal}
          onClose={() => setShowRuleModal(false)}
          title={editingRule ? t('common.editAlertRule') : t('common.createAlertRule')}
          size="lg"
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRule}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : editingRule ? (
                  'Update Rule'
                ) : (
                  'Create Rule'
                )}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Condition Type
                </label>
                <select
                  value={form.conditionType}
                  onChange={(e) => setForm({ ...form, conditionType: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                >
                  <option value="threshold">Threshold</option>
                  <option value="pattern">Pattern</option>
                  <option value="anomaly">Anomaly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Severity
                </label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Metric <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.metric}
                  onChange={(e) => setForm({ ...form, metric: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  placeholder="cpu_usage"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Operator
                </label>
                <select
                  value={form.operator}
                  onChange={(e) => setForm({ ...form, operator: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                >
                  <option value=">">&gt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<">&lt;</option>
                  <option value="<=">&lt;=</option>
                  <option value="=">=</option>
                  <option value="!=">!=</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Alert Channels
                </label>
                <button
                  type="button"
                  onClick={addChannel}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  + Add Channel
                </button>
              </div>
              {form.channels.map((channel, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={channel.type}
                    onChange={(e) => {
                      const newChannels = [...form.channels];
                      newChannels[index].type = e.target.value as any;
                      setForm({ ...form, channels: newChannels });
                    }}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="slack">Slack</option>
                    <option value="webhook">Webhook</option>
                  </select>
                  <input
                    type="text"
                    value={channel.config}
                    onChange={(e) => {
                      const newChannels = [...form.channels];
                      newChannels[index].config = e.target.value;
                      setForm({ ...form, channels: newChannels });
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white"
                    placeholder="Configuration (JSON)"
                  />
                  <button
                    type="button"
                    onClick={() => removeChannel(index)}
                    className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <button
                type="button"
                onClick={() => setForm({ ...form, isEnabled: !form.isEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  form.isEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    form.isEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Enable this alert rule
              </span>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingRule(null);
          }}
          title=t('common.deleteAlertRule')
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingRule(null);
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRule}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  t('common.deleteRule')
                )}
              </button>
            </div>
          }
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-slate-700 dark:text-slate-300">
                Are you sure you want to delete the alert rule{' '}
                <strong className="text-slate-900 dark:text-white">"{deletingRule?.name}"</strong>?
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal>

        {/* Alert History Details Modal */}
        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title=t('common.alertDetails')
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          }
        >
          {selectedHistory && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Alert Rule</label>
                <p className="text-slate-900 dark:text-white font-medium">{selectedHistory.alertRuleName}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Triggered At</label>
                <p className="text-slate-900 dark:text-white">{new Date(selectedHistory.triggeredAt).toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Severity</label>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedHistory.severity)}`}>
                  {selectedHistory.severity}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Message</label>
                <p className="text-slate-900 dark:text-white">{selectedHistory.message}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    selectedHistory.status === 'active'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : selectedHistory.status === 'acknowledged'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {selectedHistory.status}
                </span>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
