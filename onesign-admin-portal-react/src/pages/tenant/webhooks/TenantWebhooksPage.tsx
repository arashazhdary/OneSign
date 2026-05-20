import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { tenantService } from '@/lib/api/services/tenant.service';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Webhook,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Send,
  Trash2,
  Edit3,
  Eye,
  Play,
  RotateCcw,
  Link2,
  Bell,
  Activity,
  X,
  Key,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import Modal from '@/components/common/Modal';

interface WebhookData {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastDelivery: string;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  statusCode?: number;
  requestBody: string;
  responseBody?: string;
  attemptCount: number;
  deliveredAt: string;
  error?: string;
}

export default function TenantWebhooksPage() {
  const { t } = useTranslation();
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeliveriesModal, setShowDeliveriesModal] = useState(false);
  const [showDeliveryDetailsModal, setShowDeliveryDetailsModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookData | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  // Form states
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formSecret, setFormSecret] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchWebhooks();
    }
  }, [tenantId]);

  const fetchWebhooks = async () => {
    if (!tenantId) return;

    try {
      const data = await tenantService.getWebhooks();
      setWebhooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async (webhookId: string) => {
    if (!tenantId) return;

    try {
      const data = await tenantService.getWebhookEvents(webhookId);
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching webhook deliveries:', error);
      setDeliveries([]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenantId) return;

    try {
      await tenantService.createWebhook({
        url: formUrl,
        events: formEvents,
        secret: formSecret,
        isActive: formIsActive,
      });
      setSuccess(t('tenant.webhooks.messages.created'));
      setShowCreateModal(false);
      resetForm();
      fetchWebhooks();
    } catch (error: any) {
      setError(error?.message || t('common.failedToCreateWebhook'));
      console.error('Error creating webhook:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!tenantId || !selectedWebhook) return;

    try {
      await tenantService.updateWebhook(selectedWebhook.id, {
        url: formUrl,
        events: formEvents,
        secret: formSecret,
        isActive: formIsActive,
      });
      setSuccess(t('tenant.webhooks.messages.updated'));
      setShowEditModal(false);
      setSelectedWebhook(null);
      resetForm();
      fetchWebhooks();
    } catch (error: any) {
      setError(error?.message || t('common.failedToUpdateWebhook'));
      console.error('Error updating webhook:', error);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!tenantId) return;
    if (!confirm(t('tenant.webhooks.confirmDelete'))) return;

    setError('');
    setSuccess('');

    try {
      await tenantService.deleteWebhook(webhookId);
      setSuccess(t('tenant.webhooks.messages.deleted'));
      fetchWebhooks();
    } catch (error: any) {
      setError(error?.message || t('common.failedToDeleteWebhook'));
      console.error('Error deleting webhook:', error);
    }
  };

  const handleTest = async (webhookId: string) => {
    if (!tenantId) return;

    setError('');
    setSuccess('');

    try {
      const result = await tenantService.testWebhook(webhookId);
      if (result.success) {
        setSuccess(t('tenant.webhooks.messages.testSuccess'));
      } else {
        setError(result.message || t('tenant.webhooks.messages.testFailed'));
      }
    } catch (error: any) {
      setError(error?.message || t('common.failedToTestWebhook'));
      console.error('Error testing webhook:', error);
    }
  };

  const handleToggleActive = async (webhook: WebhookData) => {
    if (!tenantId) return;

    try {
      await tenantService.updateWebhook(webhook.id, {
        isActive: !webhook.isActive,
      });
      setSuccess(!webhook.isActive ? t('tenant.webhooks.messages.enabled') : t('tenant.webhooks.messages.disabled'));
      fetchWebhooks();
    } catch (error: any) {
      setError(error?.message || t('common.failedToToggleWebhookStatus'));
      console.error('Error toggling webhook:', error);
    }
  };

  const handleRetryDelivery = async (deliveryId: string) => {
    if (!tenantId) return;
    setError('');
    setSuccess('');

    try {
      await tenantService.retryWebhookDelivery(tenantId, deliveryId);
      setSuccess(t('tenant.webhooks.messages.retryInitiated'));
    } catch (error: any) {
      setError(error?.message || t('common.failedToRetryDelivery'));
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (webhook: WebhookData) => {
    setSelectedWebhook(webhook);
    setFormUrl(webhook.url);
    setFormEvents(webhook.events);
    setFormSecret('');
    setFormIsActive(webhook.isActive);
    setShowEditModal(true);
  };

  const openDeliveriesModal = (webhook: WebhookData) => {
    setSelectedWebhook(webhook);
    fetchDeliveries(webhook.id);
    setShowDeliveriesModal(true);
  };

  const openDeliveryDetailsModal = (delivery: WebhookDelivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryDetailsModal(true);
  };

  const resetForm = () => {
    setFormUrl('');
    setFormEvents([]);
    setFormSecret('');
    setFormIsActive(true);
  };

  const toggleEvent = (event: string) => {
    setFormEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Calculate statistics
  const totalWebhooks = webhooks.length;
  const activeWebhooks = webhooks.filter(w => w.isActive).length;
  const totalSuccess = webhooks.reduce((acc, w) => acc + w.successCount, 0);
  const totalFailures = webhooks.reduce((acc, w) => acc + w.failureCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Webhook className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">{t('tenant.webhooks.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>{t('tenant.webhooks.title')} - OneSign</title>
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
              <Webhook className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {t('tenant.webhooks.title')}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t('tenant.webhooks.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchWebhooks}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.refresh')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4" />
              {t('tenant.webhooks.createWebhook')}
            </motion.button>
          </div>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
            className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Webhooks"
            value={totalWebhooks}
            icon={Webhook}
            color="bg-gradient-to-br from-indigo-500 to-purple-600"
            delay={0}
          />
          <StatCard
            title="Active Webhooks"
            value={activeWebhooks}
            icon={Activity}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={1}
          />
          <StatCard
            title="Successful Deliveries"
            value={totalSuccess.toLocaleString()}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
            delay={2}
          />
          <StatCard
            title="Failed Deliveries"
            value={totalFailures.toLocaleString()}
            icon={XCircle}
            color="bg-gradient-to-br from-red-500 to-rose-600"
            delay={3}
          />
        </div>

        {/* Webhooks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-500" />
              Configured Webhooks
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Endpoint URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Deliveries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Last Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {webhooks.map((webhook, index) => (
                  <motion.tr
                    key={webhook.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Link2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {webhook.url}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Created {new Date(webhook.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {webhook.events.length} events
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(webhook)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          webhook.isActive
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {webhook.isActive ? (
                          <>
                            <ToggleRight className="w-4 h-4" />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-4 h-4" />
                          {webhook.successCount}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <span className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                          <XCircle className="w-4 h-4" />
                          {webhook.failureCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDate(webhook.lastDelivery)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleTest(webhook.id)}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                          title="Test webhook"
                        >
                          <Play className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openDeliveriesModal(webhook)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View delivery logs"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditModal(webhook)}
                          className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                          title="Edit webhook"
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(webhook.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete webhook"
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

          {webhooks.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Webhook className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No webhooks configured
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first webhook to receive event notifications
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Webhook
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('tenant.webhooks.modal.createWebhook')}
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Webhook URL *
              </div>
            </label>
            <input
              type="url"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="https://api.example.com/webhooks"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Secret Key (optional)
              </div>
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter a secret key for HMAC signature"
              value={formSecret}
              onChange={(e) => setFormSecret(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Events to Subscribe *
              </div>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-slate-50 dark:bg-slate-700/50">
              {availableEvents.map((event) => (
                <label key={event} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={formEvents.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{event}</span>
                </label>
              ))}
            </div>
            {formEvents.length === 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Select at least one event
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 w-5 h-5"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active immediately</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={formEvents.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
            >
              <Plus className="w-4 h-4" />
              Create Webhook
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal && !!selectedWebhook}
        onClose={() => {
          setShowEditModal(false);
          setSelectedWebhook(null);
        }}
        title={t('tenant.webhooks.modal.editWebhook')}
      >
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Webhook URL *
              </div>
            </label>
            <input
              type="url"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Secret Key (leave empty to keep existing)
              </div>
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter new secret key"
              value={formSecret}
              onChange={(e) => setFormSecret(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Events to Subscribe *
              </div>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-slate-50 dark:bg-slate-700/50">
              {availableEvents.map((event) => (
                <label key={event} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={formEvents.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-500 text-indigo-600 focus:ring-indigo-500 w-5 h-5"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={formEvents.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
            >
              <Edit3 className="w-4 h-4" />
              Update Webhook
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedWebhook(null);
              }}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Deliveries Modal */}
      <Modal
        isOpen={showDeliveriesModal && !!selectedWebhook}
        onClose={() => {
          setShowDeliveriesModal(false);
          setSelectedWebhook(null);
        }}
        title="Webhook Delivery Logs"
        size="xl"
      >
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            {selectedWebhook?.url}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Attempts</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Delivered</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {deliveries.map((delivery, index) => (
                <motion.tr
                  key={delivery.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{delivery.event}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusBadge(delivery.status)}`}>
                      {getStatusIcon(delivery.status)}
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{delivery.statusCode || '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{delivery.attemptCount}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(delivery.deliveredAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openDeliveryDetailsModal(delivery)}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      {delivery.status === 'failed' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRetryDelivery(delivery.id)}
                          className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {deliveries.length === 0 && (
          <div className="text-center py-8">
            <Send className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">No deliveries found for this webhook</p>
          </div>
        )}
      </Modal>

      {/* Delivery Details Modal */}
      <Modal
        isOpen={showDeliveryDetailsModal && !!selectedDelivery}
        onClose={() => setShowDeliveryDetailsModal(false)}
        title="Delivery Details"
        size="lg"
      >
        {selectedDelivery && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Event</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedDelivery.event}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusBadge(selectedDelivery.status)}`}>
                  {getStatusIcon(selectedDelivery.status)}
                  {selectedDelivery.status}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Attempts</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedDelivery.attemptCount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Delivered</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(selectedDelivery.deliveredAt)}</p>
              </div>
            </div>

            {selectedDelivery.error && (
              <div>
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Error
                </h3>
                <pre className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl text-xs overflow-x-auto text-red-700 dark:text-red-400">
                  {selectedDelivery.error}
                </pre>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-500" />
                Request Body
              </h3>
              <pre className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-4 rounded-xl text-xs overflow-x-auto text-slate-700 dark:text-slate-300">
                {JSON.stringify(JSON.parse(selectedDelivery.requestBody), null, 2)}
              </pre>
            </div>

            {selectedDelivery.responseBody && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Response Body
                </h3>
                <pre className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-4 rounded-xl text-xs overflow-x-auto text-slate-700 dark:text-slate-300">
                  {JSON.stringify(JSON.parse(selectedDelivery.responseBody), null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {selectedDelivery.status === 'failed' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleRetryDelivery(selectedDelivery.id);
                    setShowDeliveryDetailsModal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry Delivery
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeliveryDetailsModal(false)}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                Close
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
