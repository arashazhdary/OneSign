import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

interface License {
  id: string;
  licenseKey: string;
  type: 'enterprise' | 'professional' | 'starter' | 'trial';
  status: 'active' | 'expired' | 'suspended' | 'pending';
  issuedTo: string;
  issuedDate: string;
  expiryDate: string;
  autoRenew: boolean;
  features: string[];
  limits: {
    tenants: number;
    users: number;
    apiCalls: number;
    storage: string;
  };
  usage: {
    tenants: number;
    users: number;
    apiCalls: number;
    storage: string;
  };
  activations: number;
  maxActivations: number;
}

export default function GlobalLicensesPage() {
  const { t } = useTranslation();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const data = await globalService.getLicenses();
      setLicenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching licenses:', err);
      setLicenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await globalService.issueLicense({
        type: 'trial',
        issuedTo: 'New Customer',
        features: [],
        limits: {
          tenants: 5,
          users: 100,
          apiCalls: 10000,
          storage: '10 GB',
        },
      });
      setShowAdd(false);
      fetchLicenses();
    } catch (error) {
      console.error('Failed to create license:', error);
    }
  };

  const handleSuspend = async (licenseId: string) => {
    if (!confirm(t('licenses.confirmSuspend'))) return;
    try {
      await globalService.suspendLicense(licenseId);
      fetchLicenses();
    } catch (error) {
      console.error('Failed to suspend license:', error);
    }
  };

  const handleRevoke = async (licenseId: string) => {
    if (!confirm(t('licenses.confirmRevoke'))) return;
    try {
      await globalService.revokeLicense(licenseId);
      fetchLicenses();
    } catch (error) {
      console.error('Failed to revoke license:', error);
    }
  };

  const handleRenew = async (licenseId: string) => {
    try {
      await globalService.renewLicense(licenseId);
      fetchLicenses();
    } catch (error) {
      console.error('Failed to renew license:', error);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      enterprise: 'bg-purple-100 text-purple-800',
      professional: 'bg-blue-100 text-blue-800',
      starter: 'bg-green-100 text-green-800',
      trial: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  const calculateUsagePercent = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) return <div className="p-6">{t('common.loading')}...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('licenses.title')}</h1>
          <p className="text-gray-600 mt-1">{t('licenses.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('licenses.issueLicense')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">{t('licenses.totalLicenses')}</div>
          <div className="text-2xl font-bold">{licenses.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">{t('licenses.active')}</div>
          <div className="text-2xl font-bold text-green-600">
            {licenses.filter(l => l.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">{t('licenses.expiringSoon')}</div>
          <div className="text-2xl font-bold text-yellow-600">
            {licenses.filter(l => {
              const daysUntilExpiry = Math.ceil((new Date(l.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return daysUntilExpiry <= 30 && l.status === 'active';
            }).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">{t('licenses.totalRevenueAnnual')}</div>
          <div className="text-2xl font-bold">$2.5M</div>
        </div>
      </div>

      {/* Licenses List */}
      <div className="space-y-4">
        {licenses.map((license) => {
          const daysUntilExpiry = Math.ceil((new Date(license.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

          return (
            <div key={license.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{license.issuedTo}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(license.type)}`}>
                      {license.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(license.status)}`}>
                      {license.status}
                    </span>
                    {license.autoRenew && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {t('licenses.autoRenew')}
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-4 font-mono text-sm">
                    {license.licenseKey}
                  </div>

                  {/* License Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">{t('licenses.issued')}:</span>
                      <span className="ml-2">{new Date(license.issuedDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{t('licenses.expires')}:</span>
                      <span className="ml-2">{new Date(license.expiryDate).toLocaleDateString()}</span>
                      {isExpiringSoon && (
                        <span className="ml-2 text-yellow-600">({daysUntilExpiry} {t('licenses.days')})</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">{t('licenses.activations')}:</span>
                      <span className="ml-2">{license.activations} / {license.maxActivations}</span>
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{t('licenses.tenants')}</span>
                        <span>
                          {license.usage.tenants.toLocaleString()}
                          {license.limits.tenants !== -1 && ` / ${license.limits.tenants.toLocaleString()}`}
                        </span>
                      </div>
                      {license.limits.tenants !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${calculateUsagePercent(license.usage.tenants, license.limits.tenants)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{t('licenses.users')}</span>
                        <span>
                          {license.usage.users.toLocaleString()}
                          {license.limits.users !== -1 && ` / ${license.limits.users.toLocaleString()}`}
                        </span>
                      </div>
                      {license.limits.users !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${calculateUsagePercent(license.usage.users, license.limits.users)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{t('licenses.apiCalls')}</span>
                        <span>
                          {license.usage.apiCalls.toLocaleString()}
                          {license.limits.apiCalls !== -1 && ` / ${license.limits.apiCalls.toLocaleString()}`}
                        </span>
                      </div>
                      {license.limits.apiCalls !== -1 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${calculateUsagePercent(license.usage.apiCalls, license.limits.apiCalls)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <span className="text-sm text-gray-500">{t('licenses.features')}:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {license.features.map((feature, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  {license.status === 'active' && isExpiringSoon && (
                    <button
                      onClick={() => handleRenew(license.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {t('licenses.renew')}
                    </button>
                  )}
                  {license.status === 'active' && (
                    <button
                      onClick={() => handleSuspend(license.id)}
                      className="px-3 py-1 text-sm border border-orange-300 text-orange-600 rounded hover:bg-orange-50"
                    >
                      {t('licenses.suspend')}
                    </button>
                  )}
                  <button
                    onClick={() => handleRevoke(license.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    {t('licenses.revoke')}
                  </button>
                </div>
              </div>

              {/* Expiry Warning */}
              {isExpiringSoon && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>⚠️ {t('licenses.expiringSoonWarning')}:</strong> {t('licenses.expiresInDays', { days: daysUntilExpiry })}
                  {license.autoRenew ? t('licenses.autoRenewalEnabled') : t('licenses.pleaseRenewBeforeExpiry')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add License Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('licenses.issueNewLicense')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('licenses.issuedTo')}</label>
                <input
                  type="text"
                  placeholder={t('licenses.companyNamePlaceholder')}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('licenses.licenseType')}</label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="enterprise">{t('licenses.enterprise')}</option>
                  <option value="professional">{t('licenses.professional')}</option>
                  <option value="starter">{t('licenses.starter')}</option>
                  <option value="trial">{t('licenses.trial')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('licenses.startDate')}</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('licenses.durationMonths')}</label>
                  <input
                    type="number"
                    defaultValue={12}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm">{t('licenses.enableAutoRenewal')}</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('licenses.issueLicense')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
