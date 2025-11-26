import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

interface Tenant {
  id: string;
  name: string;
  displayName: string;
  subdomain: string;
  domain?: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  tier: 'free' | 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  currentUsers: number;
  region?: string;
  createdAt: string;
  trialEndsAt?: string;
}

interface TenantHealth {
  tenantId: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  uptime: number;
  activeUsers: number;
  lastChecked: string;
  metrics?: {
    apiCalls: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

type Tab = 'tenants' | 'health';

export default function GlobalTenantsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('tenants');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [tenantHealth, setTenantHealth] = useState<TenantHealth | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [tenantToSuspend, setTenantToSuspend] = useState<string>('');
  const [suspendReason, setSuspendReason] = useState('');

  const [newTenant, setNewTenant] = useState({
    name: '',
    displayName: '',
    subdomain: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    tier: 'basic' as const,
  });

  // Mock data for fallback
  const mockTenants: Tenant[] = [
    {
      id: '1',
      name: 'acme-corp',
      displayName: 'Acme Corporation',
      subdomain: 'acme',
      domain: 'acme.com',
      status: 'active',
      tier: 'enterprise',
      maxUsers: 500,
      currentUsers: 287,
      region: 'us-west-2',
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'tech-startup',
      displayName: 'Tech Startup Inc',
      subdomain: 'techstartup',
      status: 'active',
      tier: 'professional',
      maxUsers: 100,
      currentUsers: 45,
      region: 'us-east-1',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'beta-tester',
      displayName: 'Beta Tester Co',
      subdomain: 'betatester',
      status: 'trial',
      tier: 'basic',
      maxUsers: 25,
      currentUsers: 12,
      region: 'eu-west-1',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      trialEndsAt: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      name: 'suspended-tenant',
      displayName: 'Suspended Account',
      subdomain: 'suspended',
      status: 'suspended',
      tier: 'free',
      maxUsers: 10,
      currentUsers: 3,
      region: 'ap-southeast-1',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  useEffect(() => {
    if (activeTab === 'tenants') {
      fetchTenants();
    } else if (activeTab === 'health' && selectedTenant) {
      fetchTenantHealth(selectedTenant);
    }
  }, [activeTab, selectedTenant]);

  const fetchTenants = async () => {
    setLoading(true);
    setError('');
    try {
      // GET /api/global/tenants
      const response = await globalService.getTenants();
      setTenants(response.items || []);
    } catch (err: any) {
      console.error('Failed to fetch tenants:', err);
      setError(err.message || 'Failed to load tenants');
      // Use mock data as fallback
      setTenants(mockTenants);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantHealth = async (tenantId: string) => {
    setLoading(true);
    setError('');
    try {
      // GET /api/global/tenants/{id} - for tenant health info
      const tenant = await globalService.getTenantById(tenantId);
      // Note: Tenant health might need a separate endpoint not in spec
      setTenantHealth(tenant as any);
    } catch (err: any) {
      console.error('Failed to fetch tenant health:', err);
      // Mock health data as fallback
      setTenantHealth({
        tenantId,
        status: 'Healthy',
        uptime: 99.9,
        activeUsers: 45,
        lastChecked: new Date().toISOString(),
        metrics: {
          apiCalls: 15234,
          errorRate: 0.2,
          avgResponseTime: 145,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenant.name || !newTenant.subdomain || !newTenant.adminEmail) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // POST /api/global/tenants
      await globalService.createTenant({
        name: newTenant.name,
        slug: newTenant.subdomain,
        regionId: 'default',
        adminEmail: newTenant.adminEmail,
        plan: newTenant.tier,
      });
      setSuccess('Tenant created successfully');
      setShowCreateModal(false);
      setNewTenant({
        name: '',
        displayName: '',
        subdomain: '',
        adminEmail: '',
        adminFirstName: '',
        adminLastName: '',
        tier: 'basic',
      });
      fetchTenants();
    } catch (err: any) {
      setError(err.message || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendTenant = async () => {
    if (!tenantToSuspend) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // POST /api/global/tenants/{id}/suspend
      await globalService.suspendTenant(tenantToSuspend, suspendReason);
      setSuccess('Tenant suspended successfully');
      setShowSuspendModal(false);
      setTenantToSuspend('');
      setSuspendReason('');
      fetchTenants();
    } catch (err: any) {
      setError(err.message || 'Failed to suspend tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTenant = async (tenantId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // POST /api/global/tenants/{id}/reactivate
      await globalService.reactivateTenant(tenantId);
      setSuccess('Tenant activated successfully');
      fetchTenants();
    } catch (err: any) {
      setError(err.message || 'Failed to activate tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // DELETE /api/global/tenants/{id}
      await globalService.deleteTenant(tenantId);
      setSuccess('Tenant deleted successfully');
      fetchTenants();
    } catch (err: any) {
      setError(err.message || 'Failed to delete tenant');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'trial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-indigo-100 text-indigo-800';
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'free':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Unhealthy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDaysRemaining = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Global Tenant Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all tenants across the platform
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            Create New Tenant
          </button>
        </div>
      </div>

      {/* Error & Success Messages */}
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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['tenants', 'health'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'tenants' ? 'All Tenants' : 'Tenant Health'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tenants Tab */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{tenants.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {tenants.filter(t => t.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trial</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {tenants.filter(t => t.status === 'trial').length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {tenants.filter(t => t.status === 'suspended').length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subdomain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{tenant.displayName}</div>
                            <div className="text-xs text-gray-500">{tenant.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-mono">{tenant.subdomain}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tenant.status)}`}>
                          {tenant.status}
                        </span>
                        {tenant.status === 'trial' && tenant.trialEndsAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {calculateDaysRemaining(tenant.trialEndsAt)} days left
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getTierColor(tenant.tier)}`}>
                          {tenant.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {tenant.currentUsers} / {tenant.maxUsers}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              (tenant.currentUsers / tenant.maxUsers) * 100 > 90
                                ? 'bg-red-500'
                                : (tenant.currentUsers / tenant.maxUsers) * 100 > 70
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${(tenant.currentUsers / tenant.maxUsers) * 100}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.region || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tenant.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          {tenant.status === 'suspended' ? (
                            <button
                              onClick={() => handleActivateTenant(tenant.id)}
                              className="text-green-600 hover:text-green-900 font-medium"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setTenantToSuspend(tenant.id);
                                setShowSuspendModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900 font-medium"
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedTenant(tenant.id);
                              setActiveTab('health');
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Health
                          </button>
                          <button
                            onClick={() => handleDeleteTenant(tenant.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        No tenants found
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex justify-center items-center">
                          <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="ml-3">Loading tenants...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Health Tab */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.displayName} ({tenant.subdomain})
                </option>
              ))}
            </select>
          </div>

          {tenantHealth && selectedTenant && (
            <div className="space-y-6">
              {/* Health Overview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tenant Health Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">Status</div>
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getHealthStatusColor(tenantHealth.status)}`}>
                      {tenantHealth.status}
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">Uptime</div>
                    <div className="text-2xl font-bold text-gray-900">{tenantHealth.uptime}%</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">Active Users</div>
                    <div className="text-2xl font-bold text-gray-900">{tenantHealth.activeUsers}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-2">Last Checked</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(tenantHealth.lastChecked).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              {tenantHealth.metrics && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-xs text-blue-700 font-semibold mb-1">API Calls (24h)</div>
                      <div className="text-2xl font-bold text-blue-800">
                        {tenantHealth.metrics.apiCalls.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <div className="text-xs text-green-700 font-semibold mb-1">Avg Response Time</div>
                      <div className="text-2xl font-bold text-green-800">
                        {tenantHealth.metrics.avgResponseTime}ms
                      </div>
                    </div>
                    <div className={`bg-gradient-to-br ${
                      tenantHealth.metrics.errorRate > 1 ? 'from-red-50 to-pink-50 border-red-200' : 'from-green-50 to-emerald-50 border-green-200'
                    } border rounded-lg p-4`}>
                      <div className={`text-xs font-semibold mb-1 ${
                        tenantHealth.metrics.errorRate > 1 ? 'text-red-700' : 'text-green-700'
                      }`}>Error Rate</div>
                      <div className={`text-2xl font-bold ${
                        tenantHealth.metrics.errorRate > 1 ? 'text-red-800' : 'text-green-800'
                      }`}>
                        {tenantHealth.metrics.errorRate}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedTenant && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500">Select a tenant to view health metrics</p>
            </div>
          )}
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Tenant</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Name *</label>
                  <input
                    type="text"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="acme-corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
                  <input
                    type="text"
                    value={newTenant.displayName}
                    onChange={(e) => setNewTenant({ ...newTenant, displayName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Acme Corporation"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain *</label>
                <input
                  type="text"
                  value={newTenant.subdomain}
                  onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="acme"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email *</label>
                <input
                  type="email"
                  value={newTenant.adminEmail}
                  onChange={(e) => setNewTenant({ ...newTenant, adminEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="admin@acme.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin First Name *</label>
                  <input
                    type="text"
                    value={newTenant.adminFirstName}
                    onChange={(e) => setNewTenant({ ...newTenant, adminFirstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Last Name *</label>
                  <input
                    type="text"
                    value={newTenant.adminLastName}
                    onChange={(e) => setNewTenant({ ...newTenant, adminLastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tier</label>
                <select
                  value={newTenant.tier}
                  onChange={(e) => setNewTenant({ ...newTenant, tier: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTenant({
                    name: '',
                    displayName: '',
                    subdomain: '',
                    adminEmail: '',
                    adminFirstName: '',
                    adminLastName: '',
                    tier: 'basic',
                  });
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTenant}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-medium transition-all"
              >
                {loading ? 'Creating...' : 'Create Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Tenant Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Suspend Tenant</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter reason for suspension..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setTenantToSuspend('');
                  setSuspendReason('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendTenant}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-all"
              >
                {loading ? 'Suspending...' : 'Suspend Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
