'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { lifecycleService } from '@/lib/api/services';

interface AccessPackage {
  id: string;
  name: string;
  description: string;
  roles: string[];
  duration: number;
  approvalRequired: boolean;
}

interface LifecyclePolicy {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
}

interface LifecycleEvent {
  id: string;
  eventType: string;
  userId: string;
  timestamp: string;
  details: any;
}

interface UserTimelineEvent {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  actor: string;
}

interface HRSyncStatus {
  lastSyncAt?: string;
  nextSyncAt?: string;
  status: string;
  recordsSynced: number;
  errors: number;
}

export default function LifecyclePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'packages' | 'policies' | 'hr-sync' | 'timeline' | 'events'>('packages');

  // Access Packages
  const [accessPackages, setAccessPackages] = useState<AccessPackage[]>([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packageRoles, setPackageRoles] = useState('');
  const [packageDuration, setPackageDuration] = useState(30);
  const [packageApprovalRequired, setPackageApprovalRequired] = useState(true);

  // Lifecycle Policies
  const [lifecyclePolicies, setLifecyclePolicies] = useState<LifecyclePolicy[]>([]);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyName, setPolicyName] = useState('');
  const [policyTrigger, setPolicyTrigger] = useState('OnHire');
  const [policyActions, setPolicyActions] = useState('');
  const [policyEnabled, setPolicyEnabled] = useState(true);

  // HR Sync
  const [hrSyncStatus, setHRSyncStatus] = useState<HRSyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // User Timeline
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userTimeline, setUserTimeline] = useState<UserTimelineEvent[]>([]);

  // Lifecycle Events
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      setLoading(true);
      Promise.all([
        fetchAccessPackages(),
        fetchLifecyclePolicies(),
        fetchHRSyncStatus(),
        fetchLifecycleEvents()
      ]).finally(() => setLoading(false));
    }
  }, [tenantId]);

  const fetchAccessPackages = async () => {
    if (!tenantId) return;

    try {
      const data = await lifecycleService.getAccessPackages(tenantId);
      setAccessPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching access packages:', error);
    }
  };

  const fetchLifecyclePolicies = async () => {
    if (!tenantId) return;

    try {
      const data = await lifecycleService.getLifecyclePolicies(tenantId);
      setLifecyclePolicies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching lifecycle policies:', error);
    }
  };

  const fetchHRSyncStatus = async () => {
    if (!tenantId) return;

    try {
      const data = await lifecycleService.getProcessingStatus(tenantId);
      setHRSyncStatus(data);
    } catch (error) {
      console.error('Error fetching HR sync status:', error);
    }
  };

  const fetchUserTimeline = async () => {
    if (!tenantId || !selectedUserId) return;

    try {
      const data = await lifecycleService.getUserTimeline(tenantId, selectedUserId);
      setUserTimeline(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching user timeline:', error);
    }
  };

  const fetchLifecycleEvents = async () => {
    if (!tenantId) return;

    try {
      const data = await lifecycleService.getLifecycleEvents(tenantId);
      setLifecycleEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching lifecycle events:', error);
    }
  };

  const handleCreateAccessPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      const response = await fetch(`http://localhost:7000/api/tenant/lifecycle/access-packages?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          name: packageName,
          description: packageDescription,
          roles: packageRoles.split(',').map(r => r.trim()).filter(r => r),
          durationDays: packageDuration,
          requiresApproval: packageApprovalRequired
        })
      });

      if (response.ok) {
        setShowPackageModal(false);
        setPackageName('');
        setPackageDescription('');
        setPackageRoles('');
        setPackageDuration(30);
        setPackageApprovalRequired(true);
        setSuccess(t('tenant.lifecycle.packageCreated') || 'Access package created successfully');
        fetchAccessPackages();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (error) {
      setError(t('common.error'));
      console.error('Error creating access package:', error);
    }
  };

  const handleCreateLifecyclePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      const response = await fetch(`http://localhost:7000/api/tenant/lifecycle/policies?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          name: policyName,
          trigger: policyTrigger,
          actions: policyActions.split(',').map(a => a.trim()).filter(a => a),
          enabled: policyEnabled
        })
      });

      if (response.ok) {
        setShowPolicyModal(false);
        setPolicyName('');
        setPolicyActions('');
        setPolicyEnabled(true);
        setSuccess(t('tenant.lifecycle.policyCreated') || 'Lifecycle policy created successfully');
        fetchLifecyclePolicies();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (error) {
      setError(t('common.error'));
      console.error('Error creating lifecycle policy:', error);
    }
  };

  const handleTriggerHRSync = async () => {
    if (!tenantId) return;
    setError('');
    setSuccess('');
    setIsSyncing(true);

    try {
      const response = await fetch(`http://localhost:7000/api/tenant/lifecycle/hr/sync?tenantId=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(t('tenant.lifecycle.hrSyncTriggered') || `HR Sync triggered successfully. ${data} records processed.`);
        fetchHRSyncStatus();
      } else {
        const data = await response.json();
        setError(data.errorMessage || t('common.error'));
      }
    } catch (error) {
      setError(t('common.error'));
      console.error('Error triggering HR sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{t('tenant.lifecycle.title') || 'Lifecycle Management'}</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('packages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'packages'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tenant.lifecycle.accessPackages') || 'Access Packages'}
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'policies'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tenant.lifecycle.lifecyclePolicies') || 'Lifecycle Policies'}
          </button>
          <button
            onClick={() => setActiveTab('hr-sync')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hr-sync'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tenant.lifecycle.hrSync') || 'HR Sync'}
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tenant.lifecycle.userTimeline') || 'User Timeline'}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('tenant.lifecycle.events') || 'Lifecycle Events'}
          </button>
        </nav>
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

      {/* Access Packages Tab */}
      {activeTab === 'packages' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('tenant.lifecycle.accessPackages') || 'Access Packages'}</h2>
            <button
              onClick={() => setShowPackageModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {t('tenant.lifecycle.createPackage') || 'Create Package'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.lifecycle.name') || 'Name'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.lifecycle.duration') || 'Duration (days)'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.lifecycle.approval') || 'Approval'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accessPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{pkg.name}</div>
                      {pkg.description && <div className="text-gray-500 text-xs">{pkg.description}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pkg.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${pkg.approvalRequired ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {pkg.approvalRequired ? t('tenant.lifecycle.required') || 'Required' : t('tenant.lifecycle.notRequired') || 'Not Required'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">{t('common.edit')}</button>
                      <button className="text-red-600 hover:text-red-900">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {accessPackages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('tenant.lifecycle.noPackages') || 'No access packages found'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lifecycle Policies Tab */}
      {activeTab === 'policies' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('tenant.lifecycle.lifecyclePolicies') || 'Lifecycle Policies'}</h2>
            <button
              onClick={() => setShowPolicyModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {t('tenant.lifecycle.createPolicy') || 'Create Policy'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.lifecycle.name') || 'Name'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.lifecycle.trigger') || 'Trigger'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.lifecycle.status') || 'Status'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lifecyclePolicies.map((policy) => (
                  <tr key={policy.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{policy.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.trigger}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${policy.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {policy.enabled ? t('tenant.lifecycle.enabled') || 'Enabled' : t('tenant.lifecycle.disabled') || 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">{t('common.edit')}</button>
                      <button className="text-red-600 hover:text-red-900">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lifecyclePolicies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('tenant.lifecycle.noPolicies') || 'No lifecycle policies found'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HR Sync Tab */}
      {activeTab === 'hr-sync' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('tenant.lifecycle.hrSync') || 'HR Sync'}</h2>

          {hrSyncStatus && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('tenant.lifecycle.lastSync') || 'Last Sync'}</h3>
                  <p className="text-lg font-semibold">
                    {hrSyncStatus.lastSyncAt ? new Date(hrSyncStatus.lastSyncAt).toLocaleString(locale) : t('common.never') || 'Never'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('tenant.lifecycle.nextSync') || 'Next Sync'}</h3>
                  <p className="text-lg font-semibold">
                    {hrSyncStatus.nextSyncAt ? new Date(hrSyncStatus.nextSyncAt).toLocaleString(locale) : t('common.notScheduled') || 'Not Scheduled'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('tenant.lifecycle.status') || 'Status'}</h3>
                  <p className="text-lg font-semibold">{hrSyncStatus.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('tenant.lifecycle.recordsSynced') || 'Records Synced'}</h3>
                  <p className="text-lg font-semibold">{hrSyncStatus.recordsSynced}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleTriggerHRSync}
            disabled={isSyncing}
            className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSyncing ? t('tenant.lifecycle.syncing') || 'Syncing...' : t('tenant.lifecycle.triggerSync') || 'Trigger HR Sync'}
          </button>
        </div>
      )}

      {/* User Timeline Tab */}
      {activeTab === 'timeline' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('tenant.lifecycle.userTimeline') || 'User Timeline'}</h2>

          <div className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder={t('tenant.lifecycle.enterUserId') || 'Enter User ID'}
              className="flex-1 px-3 py-2 border rounded"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            />
            <button
              onClick={fetchUserTimeline}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              {t('tenant.lifecycle.loadTimeline') || 'Load Timeline'}
            </button>
          </div>

          {userTimeline.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {userTimeline.map((event) => (
                  <div key={event.id} className="border-l-4 border-indigo-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.eventType}</h3>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('tenant.lifecycle.by') || 'By'}: {event.actor}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString(locale)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userTimeline.length === 0 && selectedUserId && (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              {t('tenant.lifecycle.noEvents') || 'No timeline events found'}
            </div>
          )}
        </div>
      )}

      {/* Lifecycle Events Tab */}
      {activeTab === 'events' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('tenant.lifecycle.events') || 'Lifecycle Events'}</h2>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.lifecycle.eventType') || 'Event Type'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.lifecycle.userId') || 'User ID'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.lifecycle.timestamp') || 'Timestamp'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.lifecycle.details') || 'Details'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lifecycleEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.eventType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString(locale)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {typeof event.details === 'object' ? JSON.stringify(event.details) : event.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lifecycleEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('tenant.lifecycle.noEvents') || 'No lifecycle events found'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Access Package Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">{t('tenant.lifecycle.createPackage') || 'Create Access Package'}</h2>
            <form onSubmit={handleCreateAccessPackage}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.lifecycle.name') || 'Name'}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.lifecycle.description') || 'Description'}</label>
                <textarea
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.lifecycle.roles') || 'Roles (comma-separated)'}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={packageRoles}
                  onChange={(e) => setPackageRoles(e.target.value)}
                  placeholder="Role1, Role2, Role3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.lifecycle.duration') || 'Duration (days)'}</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border rounded"
                  value={packageDuration}
                  onChange={(e) => setPackageDuration(parseInt(e.target.value))}
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={packageApprovalRequired}
                    onChange={(e) => setPackageApprovalRequired(e.target.checked)}
                  />
                  {t('tenant.lifecycle.requiresApproval') || 'Requires Approval'}
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Lifecycle Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">{t('tenant.lifecycle.createPolicy') || 'Create Lifecycle Policy'}</h2>
            <form onSubmit={handleCreateLifecyclePolicy}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.lifecycle.name') || 'Name'}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.lifecycle.trigger') || 'Trigger'}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={policyTrigger}
                  onChange={(e) => setPolicyTrigger(e.target.value)}
                >
                  <option value="OnHire">On Hire</option>
                  <option value="OnTermination">On Termination</option>
                  <option value="OnTransfer">On Transfer</option>
                  <option value="OnLeave">On Leave</option>
                  <option value="OnReturn">On Return</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.lifecycle.actions') || 'Actions (comma-separated)'}</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={policyActions}
                  onChange={(e) => setPolicyActions(e.target.value)}
                  placeholder="GrantAccess, SendNotification, CreateTicket"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={policyEnabled}
                    onChange={(e) => setPolicyEnabled(e.target.checked)}
                  />
                  {t('tenant.lifecycle.enabled') || 'Enabled'}
                </label>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
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
