'use client';

import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';

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

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      // Mock data
      setLicenses([
        {
          id: '1',
          licenseKey: 'ONESIGN-ENT-2024-ABC123-DEF456',
          type: 'enterprise',
          status: 'active',
          issuedTo: 'Acme Corporation',
          issuedDate: '2024-01-01T00:00:00Z',
          expiryDate: '2025-01-01T00:00:00Z',
          autoRenew: true,
          features: [
            'Unlimited Tenants',
            'Priority Support',
            'Custom Integrations',
            'Advanced Analytics',
            'SSO/SAML',
            'Audit Logs',
          ],
          limits: {
            tenants: -1,
            users: -1,
            apiCalls: -1,
            storage: 'Unlimited',
          },
          usage: {
            tenants: 1250,
            users: 45678,
            apiCalls: 8567234,
            storage: '12.5 TB',
          },
          activations: 1,
          maxActivations: 1,
        },
        {
          id: '2',
          licenseKey: 'ONESIGN-PRO-2024-XYZ789-GHI012',
          type: 'professional',
          status: 'active',
          issuedTo: 'Tech Startup Inc',
          issuedDate: '2024-03-15T00:00:00Z',
          expiryDate: '2025-03-15T00:00:00Z',
          autoRenew: true,
          features: [
            'Up to 100 Tenants',
            'Standard Support',
            'API Access',
            'Basic Analytics',
          ],
          limits: {
            tenants: 100,
            users: 10000,
            apiCalls: 1000000,
            storage: '1 TB',
          },
          usage: {
            tenants: 45,
            users: 3456,
            apiCalls: 456789,
            storage: '345 GB',
          },
          activations: 1,
          maxActivations: 1,
        },
        {
          id: '3',
          licenseKey: 'ONESIGN-TRIAL-2024-MNO345-PQR678',
          type: 'trial',
          status: 'active',
          issuedTo: 'Beta Testers LLC',
          issuedDate: '2024-11-01T00:00:00Z',
          expiryDate: '2024-12-01T00:00:00Z',
          autoRenew: false,
          features: [
            'Up to 5 Tenants',
            'Email Support',
            'Limited API Access',
          ],
          limits: {
            tenants: 5,
            users: 100,
            apiCalls: 10000,
            storage: '10 GB',
          },
          usage: {
            tenants: 3,
            users: 45,
            apiCalls: 2345,
            storage: '2.3 GB',
          },
          activations: 1,
          maxActivations: 1,
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    // await platformService.createLicense({...});
    setShowAdd(false);
    fetchLicenses();
  };

  const handleSuspend = async (licenseId: string) => {
    if (!confirm('Suspend this license?')) return;
    // await platformService.suspendLicense(licenseId);
    fetchLicenses();
  };

  const handleRevoke = async (licenseId: string) => {
    if (!confirm('Revoke this license? This action cannot be undone.')) return;
    // await platformService.revokeLicense(licenseId);
    fetchLicenses();
  };

  const handleRenew = async (licenseId: string) => {
    // await platformService.renewLicense(licenseId);
    fetchLicenses();
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">License Management</h1>
          <p className="text-gray-600 mt-1">Manage platform licenses and subscriptions</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Issue License
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Licenses</div>
          <div className="text-2xl font-bold">{licenses.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {licenses.filter(l => l.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Expiring Soon</div>
          <div className="text-2xl font-bold text-yellow-600">
            {licenses.filter(l => {
              const daysUntilExpiry = Math.ceil((new Date(l.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return daysUntilExpiry <= 30 && l.status === 'active';
            }).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Revenue (Annual)</div>
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
                        Auto-Renew
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-4 font-mono text-sm">
                    {license.licenseKey}
                  </div>

                  {/* License Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Issued:</span>
                      <span className="ml-2">{new Date(license.issuedDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expires:</span>
                      <span className="ml-2">{new Date(license.expiryDate).toLocaleDateString()}</span>
                      {isExpiringSoon && (
                        <span className="ml-2 text-yellow-600">({daysUntilExpiry} days)</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">Activations:</span>
                      <span className="ml-2">{license.activations} / {license.maxActivations}</span>
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Tenants</span>
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
                        <span className="text-gray-600">Users</span>
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
                        <span className="text-gray-600">API Calls</span>
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
                    <span className="text-sm text-gray-500">Features:</span>
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
                      Renew
                    </button>
                  )}
                  {license.status === 'active' && (
                    <button
                      onClick={() => handleSuspend(license.id)}
                      className="px-3 py-1 text-sm border border-orange-300 text-orange-600 rounded hover:bg-orange-50"
                    >
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => handleRevoke(license.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Revoke
                  </button>
                </div>
              </div>

              {/* Expiry Warning */}
              {isExpiringSoon && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>⚠️ Expiring Soon:</strong> This license will expire in {daysUntilExpiry} days.
                  {license.autoRenew ? ' Auto-renewal is enabled.' : ' Please renew before expiry.'}
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
            <h2 className="text-xl font-bold mb-4">Issue New License</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Issued To</label>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">License Type</label>
                <select className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="enterprise">Enterprise</option>
                  <option value="professional">Professional</option>
                  <option value="starter">Starter</option>
                  <option value="trial">Trial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (Months)</label>
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
                  <span className="text-sm">Enable auto-renewal</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Issue License
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
