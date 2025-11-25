'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { billingService } from '@/lib/api/services';

interface UsageSummary {
  period: string;
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  totalAuthEvents: number;
  totalApiCalls: number;
  storageUsedMB: number;
}

interface QuotaStatus {
  maxUsers: number;
  currentUsers: number;
  maxApplications: number;
  currentApplications: number;
  maxApiCallsPerMonth: number;
  currentApiCalls: number;
  maxStorageGB: number;
  currentStorageGB: number;
}

interface Subscription {
  planName: string;
  planTier: string;
  status: string;
  startDate: string;
  renewalDate: string;
  billingCycle: string;
  price: number;
  currency: string;
}

export default function BillingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState('Premium');
  const [upgradeComments, setUpgradeComments] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
  }, []);

  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      Promise.all([
        fetchUsageSummary(),
        fetchQuotaStatus(),
        fetchSubscription()
      ]).finally(() => setLoading(false));
    }
  }, [tenantId]);

  const fetchUsageSummary = async () => {
    if (!tenantId) return;

    try {
      const data = await billingService.getBillingSummary(tenantId);
      setUsageSummary(data);
    } catch (error) {
      console.error('Error fetching usage summary:', error);
    }
  };

  const fetchQuotaStatus = async () => {
    if (!tenantId) return;

    try {
      const data = await billingService.getQuotaStatus(tenantId);
      setQuotaStatus(data);
    } catch (error) {
      console.error('Error fetching quota status:', error);
    }
  };

  const fetchSubscription = async () => {
    if (!tenantId) return;

    try {
      const data = await billingService.getCurrentSubscription(tenantId);
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleRequestUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await billingService.requestUpgrade(tenantId, targetPlan, upgradeComments);
      setShowUpgradeModal(false);
      setUpgradeComments('');
      setSuccess(t('tenant.billing.upgradeRequested') || 'Upgrade request submitted successfully. Our team will contact you soon.');
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error requesting upgrade:', error);
    }
  };

  const getUsagePercentage = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('tenant.billing.title') || 'Billing & Usage'}</h1>
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {t('tenant.billing.requestUpgrade') || 'Request Upgrade'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Subscription Info */}
      {subscription && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('tenant.billing.subscription') || 'Current Subscription'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('tenant.billing.plan') || 'Plan'}</h3>
              <p className="text-2xl font-bold text-indigo-600">{subscription.planName}</p>
              <p className="text-sm text-gray-600">{subscription.planTier}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('tenant.billing.status') || 'Status'}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                subscription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {subscription.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{t('tenant.billing.price') || 'Price'}</h3>
              <p className="text-2xl font-bold">{subscription.price} {subscription.currency}</p>
              <p className="text-sm text-gray-600">{subscription.billingCycle}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('tenant.billing.startDate') || 'Start Date'}</h3>
              <p className="text-sm">{new Date(subscription.startDate).toLocaleDateString(locale)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('tenant.billing.renewalDate') || 'Renewal Date'}</h3>
              <p className="text-sm">{new Date(subscription.renewalDate).toLocaleDateString(locale)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quota Status */}
      {quotaStatus && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('tenant.billing.quotaStatus') || 'Quota & Usage'}</h2>

          {/* Users */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{t('tenant.billing.users') || 'Users'}</span>
              <span className="text-sm text-gray-600">{quotaStatus.currentUsers} / {quotaStatus.maxUsers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getUsageColor(getUsagePercentage(quotaStatus.currentUsers, quotaStatus.maxUsers))}`}
                style={{ width: `${getUsagePercentage(quotaStatus.currentUsers, quotaStatus.maxUsers)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getUsagePercentage(quotaStatus.currentUsers, quotaStatus.maxUsers).toFixed(1)}% {t('tenant.billing.used') || 'used'}
            </p>
          </div>

          {/* Applications */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{t('tenant.billing.applications') || 'Applications'}</span>
              <span className="text-sm text-gray-600">{quotaStatus.currentApplications} / {quotaStatus.maxApplications}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getUsageColor(getUsagePercentage(quotaStatus.currentApplications, quotaStatus.maxApplications))}`}
                style={{ width: `${getUsagePercentage(quotaStatus.currentApplications, quotaStatus.maxApplications)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getUsagePercentage(quotaStatus.currentApplications, quotaStatus.maxApplications).toFixed(1)}% {t('tenant.billing.used') || 'used'}
            </p>
          </div>

          {/* API Calls */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{t('tenant.billing.apiCalls') || 'API Calls (Monthly)'}</span>
              <span className="text-sm text-gray-600">{quotaStatus.currentApiCalls.toLocaleString()} / {quotaStatus.maxApiCallsPerMonth.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getUsageColor(getUsagePercentage(quotaStatus.currentApiCalls, quotaStatus.maxApiCallsPerMonth))}`}
                style={{ width: `${getUsagePercentage(quotaStatus.currentApiCalls, quotaStatus.maxApiCallsPerMonth)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getUsagePercentage(quotaStatus.currentApiCalls, quotaStatus.maxApiCallsPerMonth).toFixed(1)}% {t('tenant.billing.used') || 'used'}
            </p>
          </div>

          {/* Storage */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{t('tenant.billing.storage') || 'Storage'}</span>
              <span className="text-sm text-gray-600">{quotaStatus.currentStorageGB.toFixed(2)} GB / {quotaStatus.maxStorageGB} GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${getUsageColor(getUsagePercentage(quotaStatus.currentStorageGB, quotaStatus.maxStorageGB))}`}
                style={{ width: `${getUsagePercentage(quotaStatus.currentStorageGB, quotaStatus.maxStorageGB)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getUsagePercentage(quotaStatus.currentStorageGB, quotaStatus.maxStorageGB).toFixed(1)}% {t('tenant.billing.used') || 'used'}
            </p>
          </div>
        </div>
      )}

      {/* Usage Summary */}
      {usageSummary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('tenant.billing.usageSummary') || 'Usage Summary'}</h2>
          <p className="text-sm text-gray-600 mb-4">{t('tenant.billing.period') || 'Period'}: {usageSummary.period}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="text-sm font-medium text-gray-500">{t('tenant.billing.totalUsers') || 'Total Users'}</h3>
              <p className="text-3xl font-bold text-gray-900">{usageSummary.totalUsers}</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-sm font-medium text-gray-500">{t('tenant.billing.activeUsers') || 'Active Users'}</h3>
              <p className="text-3xl font-bold text-gray-900">{usageSummary.activeUsers}</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-sm font-medium text-gray-500">{t('tenant.billing.applications') || 'Applications'}</h3>
              <p className="text-3xl font-bold text-gray-900">{usageSummary.totalApplications}</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-sm font-medium text-gray-500">{t('tenant.billing.authEvents') || 'Auth Events'}</h3>
              <p className="text-3xl font-bold text-gray-900">{usageSummary.totalAuthEvents.toLocaleString()}</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-sm font-medium text-gray-500">{t('tenant.billing.apiCalls') || 'API Calls'}</h3>
              <p className="text-3xl font-bold text-gray-900">{usageSummary.totalApiCalls.toLocaleString()}</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-sm font-medium text-gray-500">{t('tenant.billing.storage') || 'Storage Used'}</h3>
              <p className="text-3xl font-bold text-gray-900">{usageSummary.storageUsedMB.toFixed(0)} MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('tenant.billing.requestUpgrade') || 'Request Plan Upgrade'}</h2>
            <form onSubmit={handleRequestUpgrade}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.billing.targetPlan') || 'Target Plan'}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={targetPlan}
                  onChange={(e) => setTargetPlan(e.target.value)}
                >
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.billing.comments') || 'Comments (Optional)'}</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  rows={4}
                  value={upgradeComments}
                  onChange={(e) => setUpgradeComments(e.target.value)}
                  placeholder={t('tenant.billing.commentsPlaceholder') || 'Tell us about your requirements...'}
                />
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  {t('tenant.billing.submitRequest') || 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
