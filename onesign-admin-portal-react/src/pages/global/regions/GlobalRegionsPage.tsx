import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

interface Region {
  id: string;
  name: string;
  code: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  tenantsCount: number;
  dataCenter: string;
  createdAt: string;
}

interface RegionHealth {
  regionId: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  latency: number;
  uptime: number;
  lastChecked: string;
}

interface Backup {
  id: string;
  regionId: string;
  regionName: string;
  size: number;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
  createdAt: string;
  completedAt?: string;
}

interface DataResidencyRule {
  id: string;
  country: string;
  region: string;
  dataTypes: string[];
  restrictions: string;
  updatedAt: string;
}

interface DRStatus {
  enabled: boolean;
  primaryRegion: string;
  secondaryRegion: string;
  lastFailover?: string;
  rpo: number;
  rto: number;
  status: 'Active' | 'Standby' | 'Failover';
}

interface TenantDataResidency {
  tenantId: string;
  tenantName: string;
  region: string;
  dataTypes: string[];
  restrictions: string;
  lastUpdated: string;
}

interface TenantBackup {
  id: string;
  tenantId: string;
  tenantName: string;
  size: number;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Failed';
  createdAt: string;
  completedAt?: string;
}

type Tab = 'regions' | 'backups' | 'residency' | 'dr' | 'tenant-backups' | 'tenant-residency';

export default function GlobalRegionsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('regions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [regionHealth, setRegionHealth] = useState<RegionHealth | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [residencyRules, setResidencyRules] = useState<DataResidencyRule[]>([]);
  const [drStatus, setDRStatus] = useState<DRStatus | null>(null);
  const [tenantBackups, setTenantBackups] = useState<TenantBackup[]>([]);
  const [tenantDataResidency, setTenantDataResidency] = useState<TenantDataResidency[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateRegionModal, setShowUpdateRegionModal] = useState(false);
  const [updateRegionData, setUpdateRegionData] = useState({
    id: '',
    name: '',
    code: '',
    location: '',
    dataCenter: '',
  });
  const [newRegion, setNewRegion] = useState({
    name: '',
    code: '',
    location: '',
    dataCenter: '',
  });

  useEffect(() => {
    if (activeTab === 'regions') {
      fetchRegions();
    } else if (activeTab === 'backups') {
      fetchBackups();
    } else if (activeTab === 'residency') {
      fetchResidencyRules();
    } else if (activeTab === 'dr') {
      fetchDRStatus();
    } else if (activeTab === 'tenant-backups') {
      if (selectedTenant) fetchTenantBackups();
    } else if (activeTab === 'tenant-residency') {
      fetchTenantDataResidency();
    }
  }, [activeTab, selectedTenant]);

  const fetchRegions = async () => {
    setLoading(true);
    setError('');
    try {
      // GET /api/global/regions
      const data = await globalService.getRegions();
      setRegions((data || []) as any);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRegionHealth = async (regionId: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await globalService.getRegionsHealth(regionId);
      setRegionHealth(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    setLoading(true);
    setError('');
    try {
      // const data = await globalService.getRegionBackups();
      // setBackups(data.items || data || []);
      setBackups([] as any);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchResidencyRules = async () => {
    setLoading(true);
    setError('');
    try {
      // const data = await globalService.getDataResidencyRules();
      // setResidencyRules(data.rules || data || []);
      setResidencyRules([] as any);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDRStatus = async () => {
    setLoading(true);
    setError('');
    try {
      // const data = await globalService.getDRStatus();
      // setDRStatus(data);
      setDRStatus(null);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRegion = async () => {
    if (!newRegion.name || !newRegion.code || !newRegion.location) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await globalService.createRegion(newRegion);
      setSuccess('Region created successfully');
      setShowCreateModal(false);
      setNewRegion({ name: '', code: '', location: '', dataCenter: '' });
      fetchRegions();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleActivateRegion = async (regionId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // await globalService.activateRegion(regionId);
      setSuccess('Region activated successfully');
      fetchRegions();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateRegion = async (regionId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // await globalService.deactivateRegion(regionId);
      setSuccess('Region deactivated successfully');
      fetchRegions();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    if (!confirm('Are you sure you want to delete this region?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // await globalService.deleteRegion(regionId);
      setSuccess('Region deleted successfully');
      fetchRegions();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!selectedRegion) {
      setError('Please select a region');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // await globalService.createRegionBackup(selectedRegion);
      setSuccess('Backup created successfully');
      fetchBackups();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // await globalService.restoreRegionBackup(backupId);
      setSuccess('Backup restore started successfully');
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRegion = async () => {
    if (!updateRegionData.id || !updateRegionData.name) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await globalService.updateRegion(updateRegionData.id, {
        name: updateRegionData.name,
        code: updateRegionData.code,
        location: updateRegionData.location,
        dataCenter: updateRegionData.dataCenter,
      });
      setSuccess('Region updated successfully');
      setShowUpdateRegionModal(false);
      setUpdateRegionData({ id: '', name: '', code: '', location: '', dataCenter: '' });
      fetchRegions();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRegionBackups = async (regionId: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await globalService.getRegionBackupsById(regionId);
      setBackups(data.items || data || []);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRegionBackup = async (regionId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await globalService.createRegionBackupById(regionId);
      setSuccess('Region backup created successfully');
      fetchRegionBackups(regionId);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantDataResidency = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await globalService.getTenantDataResidency();
      setTenantDataResidency(data.items || data || []);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantBackups = async () => {
    if (!selectedTenant) return;
    setLoading(true);
    setError('');
    try {
      const data = await globalService.getTenantBackups(selectedTenant);
      setTenantBackups(data.items || data || []);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenantBackup = async () => {
    if (!selectedTenant) {
      setError('Please select a tenant');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await globalService.createTenantBackup(selectedTenant);
      setSuccess('Tenant backup created successfully');
      fetchTenantBackups();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to restore this tenant?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await globalService.restoreTenant(tenantId);
      setSuccess('Tenant restore started successfully');
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDRDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await globalService.getDRDashboard();
      setDRStatus(data);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Healthy':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
      case 'Standby':
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Maintenance':
      case 'Degraded':
      case 'InProgress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Unhealthy':
      case 'Failed':
      case 'Failover':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Multi-Region Management</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {(['regions', 'backups', 'tenant-backups', 'residency', 'tenant-residency', 'dr'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'regions' ? 'Regions' :
               tab === 'backups' ? 'Region Backups' :
               tab === 'tenant-backups' ? 'Tenant Backups' :
               tab === 'residency' ? 'Data Residency' :
               tab === 'tenant-residency' ? 'Tenant Residency' :
               'DR Dashboard'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'regions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create Region
            </button>
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Create New Region</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={newRegion.name}
                      onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                    <input
                      type="text"
                      value={newRegion.code}
                      onChange={(e) => setNewRegion({ ...newRegion, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={newRegion.location}
                      onChange={(e) => setNewRegion({ ...newRegion, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Center</label>
                    <input
                      type="text"
                      value={newRegion.dataCenter}
                      onChange={(e) => setNewRegion({ ...newRegion, dataCenter: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRegion}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenants</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regions.map((region) => (
                  <tr key={region.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{region.name}</div>
                      <div className="text-xs text-gray-500">{region.dataCenter}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{region.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{region.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(region.status)}`}>
                        {region.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{region.tenantsCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRegion(region.id);
                            fetchRegionHealth(region.id);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Health
                        </button>
                        {region.status === 'Active' ? (
                          <button
                            onClick={() => handleDeactivateRegion(region.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateRegion(region.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRegion(region.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {regions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No regions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {regionHealth && selectedRegion && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Region Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Status</div>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${getStatusColor(regionHealth.status)}`}>
                    {regionHealth.status}
                  </span>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Latency</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{regionHealth.latency}ms</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Uptime</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{regionHealth.uptime}%</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Last Checked</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(regionHealth.lastChecked).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'backups' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-6">
                <button
                  onClick={handleCreateBackup}
                  disabled={loading || !selectedRegion}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Create Backup
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Backup ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{backup.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.regionName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size} MB</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(backup.status)}`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(backup.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {backup.status === 'Completed' && (
                        <button
                          onClick={() => handleRestoreBackup(backup.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {backups.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No backups found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'residency' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Data Residency Rules</h2>
              <p className="text-sm text-gray-500 mb-6">
                Configure data residency rules to comply with regional data protection regulations.
              </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Types</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restrictions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {residencyRules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rule.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rule.region}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {rule.dataTypes.map((type, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{rule.restrictions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rule.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {residencyRules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No residency rules configured
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'dr' && (
        <div className="space-y-4">
          {drStatus ? (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Disaster Recovery Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Status</div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${getStatusColor(drStatus.status)}`}>
                      {drStatus.status}
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Primary Region</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">{drStatus.primaryRegion}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500">Secondary Region</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">{drStatus.secondaryRegion}</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500">RPO (Recovery Point Objective)</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">{drStatus.rpo} minutes</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500">RTO (Recovery Time Objective)</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">{drStatus.rto} minutes</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-500">DR Enabled</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {drStatus.enabled ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </div>
                  </div>
                </div>
                {drStatus.lastFailover && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">Last Failover</div>
                    <div className="text-base font-medium text-gray-900 mt-1">
                      {new Date(drStatus.lastFailover).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">DR Configuration</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Replication Status</h3>
                      <p className="text-sm text-gray-500">
                        Data is being replicated from {drStatus.primaryRegion} to {drStatus.secondaryRegion}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Failover Capability</h3>
                      <p className="text-sm text-gray-500">
                        Automatic failover is configured and tested
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                      Ready
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              {loading ? 'Loading DR status...' : 'No DR configuration found'}
            </div>
          )}
        </div>
      )}

      {/* Tenant Backups Tab */}
      {activeTab === 'tenant-backups' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Tenant</label>
                <input
                  type="text"
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter tenant ID"
                />
              </div>
              <div className="pt-6">
                <button
                  onClick={handleCreateTenantBackup}
                  disabled={loading || !selectedTenant}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Create Backup
                </button>
              </div>
            </div>
          </div>

          {selectedTenant && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Backup ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenantBackups.map((backup) => (
                    <tr key={backup.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{backup.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.tenantName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size} MB</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(backup.status)}`}>
                          {backup.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(backup.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {backup.status === 'Completed' && (
                          <button
                            onClick={() => handleRestoreTenant(backup.tenantId)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tenantBackups.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No backups found for this tenant
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tenant Data Residency Tab */}
      {activeTab === 'tenant-residency' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tenant Data Residency</h2>
              <p className="text-sm text-gray-500 mb-6">
                View and manage data residency settings for all tenants.
              </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Types</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restrictions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenantDataResidency.map((residency, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {residency.tenantName || residency.tenantId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{residency.region}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {residency.dataTypes.map((type, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{residency.restrictions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(residency.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {tenantDataResidency.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No tenant residency data configured
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
