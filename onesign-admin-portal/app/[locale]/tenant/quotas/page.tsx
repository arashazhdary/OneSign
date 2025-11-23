'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { billingService } from '@/lib/api/services';

// Types
interface Quota {
  id: string;
  resourceType: string;
  resourceName: string;
  limit: number;
  used: number;
  unit: string;
  resetDate?: string;
  warningThreshold: number;
  criticalThreshold: number;
}

interface QuotaHistory {
  date: string;
  used: number;
  limit: number;
}

export default function QuotasPage() {
  const t = useTranslations();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [selectedQuota, setSelectedQuota] = useState<Quota | null>(null);
  const [quotaHistory, setQuotaHistory] = useState<QuotaHistory[]>([]);

  // Modals
  const [showIncreaseModal, setShowIncreaseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Form state
  const [requestedLimit, setRequestedLimit] = useState<number>(0);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchQuotas();
    }
  }, [tenantId]);

  const fetchQuotas = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError('');

    try {
      // Fetch from real API
      const quotaData = await billingService.getQuotaStatus(tenantId);
      setQuotas(quotaData.quotas || mockQuotasFallback);
    } catch (err: any) {
      console.error('Error fetching quotas:', err);
      setError(err?.message || 'Failed to load quotas');
      // Fallback to mock data
      setQuotas(mockQuotasFallback);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
  const mockQuotasFallback: Quota[] = [
        {
          id: '1',
          resourceType: 'users',
          resourceName: 'Users',
          limit: 1000,
          used: 847,
          unit: 'users',
          resetDate: new Date(Date.now() + 86400000 * 15).toISOString(),
          warningThreshold: 80,
          criticalThreshold: 95,
        },
        {
          id: '2',
          resourceType: 'storage',
          resourceName: 'Storage',
          limit: 100,
          used: 68.5,
          unit: 'GB',
          warningThreshold: 80,
          criticalThreshold: 90,
        },
        {
          id: '3',
          resourceType: 'api_calls',
          resourceName: 'API Calls',
          limit: 1000000,
          used: 523456,
          unit: 'calls/month',
          resetDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          warningThreshold: 75,
          criticalThreshold: 90,
        },
        {
          id: '4',
          resourceType: 'applications',
          resourceName: 'Applications',
          limit: 50,
          used: 23,
          unit: 'apps',
          warningThreshold: 80,
          criticalThreshold: 95,
        },
        {
          id: '5',
          resourceType: 'mfa_devices',
          resourceName: 'MFA Devices',
          limit: 2000,
          used: 1234,
          unit: 'devices',
          warningThreshold: 80,
          criticalThreshold: 90,
        },
        {
          id: '6',
          resourceType: 'roles',
          resourceName: 'Custom Roles',
          limit: 100,
          used: 45,
          unit: 'roles',
          warningThreshold: 80,
          criticalThreshold: 95,
        },
        {
          id: '7',
          resourceType: 'webhooks',
          resourceName: 'Webhooks',
          limit: 25,
          used: 18,
          unit: 'webhooks',
          warningThreshold: 80,
          criticalThreshold: 90,
        },
        {
          id: '8',
          resourceType: 'api_keys',
          resourceName: 'API Keys',
          limit: 100,
          used: 32,
          unit: 'keys',
          warningThreshold: 80,
          criticalThreshold: 95,
        },
      ];

  const fetchQuotaHistory = (quota: Quota) => {
    // Mock historical data
    const history: QuotaHistory[] = [];
    const days = 30;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const trend = (days - i) / days;
      const variance = Math.random() * 0.1 - 0.05;
      const used = quota.used * (trend + variance);

      history.push({
        date: date.toISOString(),
        used: Math.max(0, used),
        limit: quota.limit,
      });
    }

    setQuotaHistory(history);
  };

  const handleRequestIncrease = async () => {
    if (!tenantId || !selectedQuota || !requestedLimit || !requestReason) {
      setError('Please fill in all required fields');
      return;
    }

    if (requestedLimit <= selectedQuota.limit) {
      setError('Requested limit must be greater than current limit');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess('Quota increase request submitted successfully. Our team will review it shortly.');
      setShowIncreaseModal(false);
      setSelectedQuota(null);
      setRequestedLimit(0);
      setRequestReason('');
    } catch (err) {
      setError('Failed to submit quota increase request');
      console.error('Error requesting quota increase:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (quota: Quota) => {
    setSelectedQuota(quota);
    fetchQuotaHistory(quota);
    setShowHistoryModal(true);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number, quota: Quota) => {
    if (percentage >= quota.criticalThreshold) return 'bg-red-500';
    if (percentage >= quota.warningThreshold) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAlertLevel = (percentage: number, quota: Quota): 'none' | 'warning' | 'critical' => {
    if (percentage >= quota.criticalThreshold) return 'critical';
    if (percentage >= quota.warningThreshold) return 'warning';
    return 'none';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const getDaysUntilReset = (resetDate?: string) => {
    if (!resetDate) return null;
    const days = Math.ceil((new Date(resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Quota Management
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor resource usage and manage quotas
        </p>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg shadow-sm">
          {success}
        </div>
      )}

      {/* Alerts Section */}
      <div className="mb-8">
        {quotas.filter((q) => getAlertLevel(getUsagePercentage(q.used, q.limit), q) !== 'none').length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Alerts</h2>
            <div className="space-y-3">
              {quotas
                .filter((q) => getAlertLevel(getUsagePercentage(q.used, q.limit), q) !== 'none')
                .map((quota) => {
                  const percentage = getUsagePercentage(quota.used, quota.limit);
                  const level = getAlertLevel(percentage, quota);

                  return (
                    <div
                      key={quota.id}
                      className={`border rounded-lg p-4 ${
                        level === 'critical'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {level === 'critical' ? '🔴' : '⚠️'} {quota.resourceName}
                            </span>
                            <span className="text-sm text-gray-600">
                              {percentage.toFixed(1)}% used
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {level === 'critical'
                              ? `Critical: You've used ${percentage.toFixed(1)}% of your ${quota.resourceName.toLowerCase()} quota`
                              : `Warning: Approaching ${quota.resourceName.toLowerCase()} limit at ${percentage.toFixed(1)}%`}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedQuota(quota);
                            setRequestedLimit(quota.limit * 2);
                            setShowIncreaseModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Request Increase
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Quotas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotas.map((quota) => {
          const percentage = getUsagePercentage(quota.used, quota.limit);
          const daysUntilReset = getDaysUntilReset(quota.resetDate);

          return (
            <div
              key={quota.id}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{quota.resourceName}</h3>
                  <p className="text-sm text-gray-500">{quota.resourceType}</p>
                </div>
                {getAlertLevel(percentage, quota) !== 'none' && (
                  <span className="text-2xl">
                    {getAlertLevel(percentage, quota) === 'critical' ? '🔴' : '⚠️'}
                  </span>
                )}
              </div>

              {/* Usage Stats */}
              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-bold text-gray-900">{formatNumber(quota.used)}</span>
                  <span className="text-sm text-gray-500">
                    of {formatNumber(quota.limit)} {quota.unit}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${getUsageColor(percentage, quota)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{percentage.toFixed(1)}% used</span>
                  {daysUntilReset !== null && (
                    <span>Resets in {daysUntilReset} days</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewHistory(quota)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  View History
                </button>
                <button
                  onClick={() => {
                    setSelectedQuota(quota);
                    setRequestedLimit(quota.limit * 2);
                    setShowIncreaseModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Request Increase
                </button>
              </div>
            </div>
          );
        })}

        {quotas.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {loading ? (
              <div>Loading quotas...</div>
            ) : (
              <div>
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No quotas available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Increase Modal */}
      {showIncreaseModal && selectedQuota && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Request Quota Increase</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Resource</label>
                <p className="text-lg font-semibold text-gray-900">{selectedQuota.resourceName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Current Limit</label>
                <p className="text-gray-900">
                  {formatNumber(selectedQuota.limit)} {selectedQuota.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Current Usage</label>
                <p className="text-gray-900">
                  {formatNumber(selectedQuota.used)} {selectedQuota.unit} (
                  {getUsagePercentage(selectedQuota.used, selectedQuota.limit).toFixed(1)}%)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requested Limit <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={requestedLimit}
                  onChange={(e) => setRequestedLimit(parseInt(e.target.value) || 0)}
                  min={selectedQuota.limit + 1}
                  placeholder="Enter new limit"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Increase <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  rows={4}
                  placeholder="Please explain why you need this quota increase..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {requestedLimit > selectedQuota.limit && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    You're requesting an increase from{' '}
                    <strong>
                      {formatNumber(selectedQuota.limit)} to {formatNumber(requestedLimit)}
                    </strong>{' '}
                    {selectedQuota.unit} (
                    {(((requestedLimit - selectedQuota.limit) / selectedQuota.limit) * 100).toFixed(0)}% increase)
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t">
              <button
                onClick={() => {
                  setShowIncreaseModal(false);
                  setSelectedQuota(null);
                  setRequestedLimit(0);
                  setRequestReason('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestIncrease}
                disabled={loading || !requestedLimit || !requestReason || requestedLimit <= selectedQuota.limit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedQuota && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-auto shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedQuota.resourceName} History</h2>
                  <p className="text-purple-100 text-sm mt-1">Usage over the last 30 days</p>
                </div>
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedQuota(null);
                    setQuotaHistory([]);
                  }}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Chart */}
              <div className="relative h-64 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white p-4 mb-6">
                <div className="absolute inset-0 flex items-end justify-around p-4 gap-0.5">
                  {quotaHistory.map((point, index) => {
                    const height = (point.used / point.limit) * 100;
                    const color = height >= selectedQuota.criticalThreshold
                      ? 'bg-red-500'
                      : height >= selectedQuota.warningThreshold
                      ? 'bg-yellow-500'
                      : 'bg-green-500';

                    return (
                      <div
                        key={index}
                        className="group relative flex-1 flex items-end"
                        title={`${new Date(point.date).toLocaleDateString()}: ${formatNumber(point.used)} / ${formatNumber(point.limit)}`}
                      >
                        <div
                          className={`w-full ${color} rounded-t transition-all duration-300 hover:opacity-80 relative`}
                          style={{ height: `${Math.max(height, 2)}%` }}
                        >
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            <div>{formatNumber(point.used)}</div>
                            <div className="text-gray-300">{new Date(point.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                  <span>{formatNumber(selectedQuota.limit)}</span>
                  <span>{formatNumber(selectedQuota.limit * 0.75)}</span>
                  <span>{formatNumber(selectedQuota.limit * 0.5)}</span>
                  <span>{formatNumber(selectedQuota.limit * 0.25)}</span>
                  <span>0</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-blue-700 font-semibold mb-1">Current Usage</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {formatNumber(selectedQuota.used)}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-xs text-green-700 font-semibold mb-1">Quota Limit</div>
                  <div className="text-2xl font-bold text-green-800">
                    {formatNumber(selectedQuota.limit)}
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-xs text-purple-700 font-semibold mb-1">Remaining</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {formatNumber(selectedQuota.limit - selectedQuota.used)}
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-xs text-orange-700 font-semibold mb-1">Usage Percentage</div>
                  <div className="text-2xl font-bold text-orange-800">
                    {getUsagePercentage(selectedQuota.used, selectedQuota.limit).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
