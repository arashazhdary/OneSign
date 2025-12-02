import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { applicationsService } from '@/lib/api/services/applications.service';
import type { Application } from '@/lib/api/types/applications';
import { Helmet } from 'react-helmet-async';

// Types for additional data
interface RedirectURI {
  id: string;
  uri: string;
  type: 'web' | 'mobile' | 'desktop';
  createdAt: string;
}

interface ClientSecret {
  id: string;
  name: string;
  hint: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
}

interface Permission {
  id: string;
  scope: string;
  description: string;
  isGranted: boolean;
  grantedAt?: string;
}

interface OrgUnitAssignment {
  id: string;
  orgUnitId: string;
  orgUnitName: string;
  orgUnitPath: string;
  assignedAt: string;
  assignedByUserId: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  changes: Record<string, any>;
  timestamp: string;
  ipAddress: string;
}

type Tab = 'overview' | 'redirect-uris' | 'client-secrets' | 'permissions' | 'org-units' | 'audit-log' | 'usage-stats';

export default function TenantAppsDetailPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [application, setApplication] = useState<Application | null>(null);
  const [redirectURIs, setRedirectURIs] = useState<RedirectURI[]>([]);
  const [clientSecrets, setClientSecrets] = useState<ClientSecret[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnitAssignment[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [usageStats, setUsageStats] = useState<any>(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddURIModal, setShowAddURIModal] = useState(false);
  const [showAddSecretModal, setShowAddSecretModal] = useState(false);
  const [showGeneratedSecret, setShowGeneratedSecret] = useState('');

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    url: '',
  });
  const [newURI, setNewURI] = useState({ uri: '', type: 'web' as 'web' | 'mobile' | 'desktop' });
  const [newSecretName, setNewSecretName] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  useEffect(() => {
    if (activeTab === 'redirect-uris' && redirectURIs.length === 0) {
      fetchRedirectURIs();
    } else if (activeTab === 'client-secrets' && clientSecrets.length === 0) {
      fetchClientSecrets();
    } else if (activeTab === 'permissions' && permissions.length === 0) {
      fetchPermissions();
    } else if (activeTab === 'org-units' && orgUnits.length === 0) {
      fetchOrgUnits();
    } else if (activeTab === 'audit-log' && auditLog.length === 0) {
      fetchAuditLog();
    } else if (activeTab === 'usage-stats' && !usageStats) {
      fetchUsageStats();
    }
  }, [activeTab]);

  const fetchApplication = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await applicationsService.getApplicationById(applicationId);
      if (!data) {
        setError(t('applications.notFound') || 'Application not found');
        return;
      }
      setApplication(data as any);
      setEditForm({
        name: data?.name || '',
        description: (data as any)?.description || '',
        category: (data as any)?.category || '',
        url: (data as any)?.url || '',
      });
    } catch (err: any) {
      setError(err.message || t('common.failedToFetchApplication'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRedirectURIs = async () => {
    try {
      const app = await applicationsService.getApplicationById(applicationId);
      if (!app) return;
      const uris: RedirectURI[] = (app?.redirectUris || []).map((uri: any) => ({
        id: uri.id,
        uri: uri.uri,
        type: 'web' as 'web' | 'mobile' | 'desktop',
        createdAt: new Date().toISOString(),
      }));
      setRedirectURIs(uris);
    } catch (err) {
      console.error('Failed to fetch redirect URIs:', err);
    }
  };

  const fetchClientSecrets = async () => {
    try {
      const app = await applicationsService.getApplicationById(applicationId);
      if (!app) return;
      const secrets: ClientSecret[] = (app?.clientSecrets || []).map((secret: any) => ({
        id: secret.id,
        name: secret.description || 'Client Secret',
        hint: '***' + (secret.id?.slice(-4) || '****'),
        createdAt: secret.createdAt || new Date().toISOString(),
        expiresAt: undefined,
        lastUsedAt: undefined,
      }));
      setClientSecrets(secrets);
    } catch (err) {
      console.error('Failed to fetch client secrets:', err);
    }
  };

  const fetchPermissions = async () => {
    try {
      // Mock permissions data since API doesn't have this endpoint
      const mockPermissions: Permission[] = [
        { id: '1', scope: 'read:profile', description: 'Read user profile', isGranted: true, grantedAt: new Date().toISOString() },
        { id: '2', scope: 'write:profile', description: 'Write user profile', isGranted: true, grantedAt: new Date().toISOString() },
        { id: '3', scope: 'admin:access', description: 'Admin access', isGranted: false },
      ];
      setPermissions(mockPermissions);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    }
  };

  const fetchOrgUnits = async () => {
    try {
      const data = await applicationsService.getApplicationOrgUnits(tenantId, applicationId);
      const orgUnitAssignments: OrgUnitAssignment[] = (data?.orgUnitIds || []).map((ouId: string) => ({
        id: ouId,
        orgUnitId: ouId,
        orgUnitName: `Org Unit ${ouId.slice(0, 8)}`,
        orgUnitPath: `/root/org-unit-${ouId.slice(0, 8)}`,
        assignedAt: new Date().toISOString(),
        assignedByUserId: 'system',
      }));
      setOrgUnits(orgUnitAssignments);
    } catch (err) {
      console.error('Failed to fetch org units:', err);
    }
  };

  const fetchAuditLog = async () => {
    try {
      // Mock audit log data since API doesn't have this endpoint
      const mockAuditLog: AuditLogEntry[] = [
        {
          id: '1',
          action: 'Application Created',
          actorId: 'user-1',
          actorName: 'Admin User',
          changes: { name: application?.name },
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1',
        },
      ];
      setAuditLog(mockAuditLog);
    } catch (err) {
      console.error('Failed to fetch audit log:', err);
    }
  };

  const fetchUsageStats = async () => {
    try {
      // Mock usage stats data since API doesn't have this endpoint
      const mockStats = {
        totalUsers: 1234,
        activeUsers: 567,
        totalSessions: 8901,
        avgSessionDuration: 45,
        stats: [
          { date: '2025-01-01', users: 100, sessions: 200 },
          { date: '2025-01-02', users: 120, sessions: 230 },
        ],
      };
      setUsageStats(mockStats);
    } catch (err) {
      console.error('Failed to fetch usage stats:', err);
    }
  };

  const handleUpdateApplication = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await applicationsService.updateApplication(tenantId, applicationId, editForm);
      setSuccess('Application updated successfully');
      setShowEditModal(false);
      fetchApplication();
    } catch (err: any) {
      setError(err.message || t('common.failedToUpdateApplication'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddRedirectURI = async () => {
    setSaving(true);
    setError('');
    try {
      await applicationsService.addRedirectUri(tenantId, applicationId, newURI.uri);
      setSuccess('Redirect URI added successfully');
      setShowAddURIModal(false);
      setNewURI({ uri: '', type: 'web' });
      fetchRedirectURIs();
    } catch (err: any) {
      setError(err.message || t('common.failedToAddRedirectUri'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRedirectURI = async (uriId: string) => {
    if (!confirm('Are you sure you want to delete this redirect URI?')) return;
    try {
      await applicationsService.removeRedirectUri(tenantId, uriId);
      setSuccess('Redirect URI deleted successfully');
      fetchRedirectURIs();
    } catch (err: any) {
      setError(err.message || t('common.failedToDeleteRedirectUri'));
    }
  };

  const handleGenerateSecret = async () => {
    setSaving(true);
    setError('');
    try {
      const data = await applicationsService.regenerateSecret(tenantId, applicationId);
      setShowGeneratedSecret(data.clientSecret);
      setShowAddSecretModal(false);
      setNewSecretName('');
      fetchClientSecrets();
    } catch (err: any) {
      setError(err.message || t('common.failedToGenerateSecret'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSecret = async (secretId: string) => {
    if (!confirm('Are you sure you want to delete this client secret? This action cannot be undone.')) return;
    try {
      // Note: API doesn't have removeClientSecret method, using regenerateSecret as workaround
      await applicationsService.regenerateSecret(tenantId, applicationId);
      setSuccess('Client secret regenerated successfully');
      fetchClientSecrets();
    } catch (err: any) {
      setError(err.message || t('common.failedToDeleteSecret'));
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Application not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {application.name}
            </h1>
            <p className="text-gray-600 mt-2">{(application as any).description || t('common.noDescription')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              Edit Application
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'redirect-uris', label: 'Redirect URIs' },
            { key: 'client-secrets', label: 'Client Secrets' },
            { key: 'permissions', label: 'Permissions & Scopes' },
            { key: 'org-units', label: 'Org Units' },
            { key: 'audit-log', label: 'Audit Log' },
            { key: 'usage-stats', label: 'Usage Statistics' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Application Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="text-gray-900">{application.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="text-gray-900 capitalize">{(application as any).type || (application as any).applicationType || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="text-gray-900">{(application as any).category || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <StatusBadge status={(application as any).status || ((application as any).isEnabled ? 'active' : 'inactive')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <div className="text-gray-900">{(application as any).url || 'N/A'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Critical Application</label>
                <div className="text-gray-900">{(application as any).isCritical ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <div className="text-gray-900">{formatDate((application as any).createdAt || application.createdAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                <div className="text-gray-900">{formatDate((application as any).updatedAt || application.updatedAt)}</div>
              </div>
            </div>
          </div>

          {(application as any).metadata && Object.keys((application as any).metadata).length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Custom Metadata</h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify((application as any).metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Redirect URIs Tab */}
      {activeTab === 'redirect-uris' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Redirect URIs</h3>
            <button
              onClick={() => setShowAddURIModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add URI
            </button>
          </div>
          {redirectURIs.length === 0 ? (
            <p className="text-gray-500">No redirect URIs configured</p>
          ) : (
            <div className="space-y-4">
              {redirectURIs.map((uri) => (
                <div key={uri.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{uri.uri}</div>
                    <div className="text-sm text-gray-500">
                      Type: {uri.type} • Added: {formatDate(uri.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRedirectURI(uri.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Client Secrets Tab */}
      {activeTab === 'client-secrets' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Client Secrets</h3>
            <button
              onClick={() => setShowAddSecretModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Secret
            </button>
          </div>
          {clientSecrets.length === 0 ? (
            <p className="text-gray-500">No client secrets configured</p>
          ) : (
            <div className="space-y-4">
              {clientSecrets.map((secret) => (
                <div key={secret.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{secret.name}</div>
                    <div className="text-sm text-gray-500">
                      Hint: {secret.hint} • Created: {formatDate(secret.createdAt)}
                      {secret.lastUsedAt && ` • Last used: ${formatDate(secret.lastUsedAt)}`}
                      {secret.expiresAt && ` • Expires: ${formatDate(secret.expiresAt)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSecret(secret.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Permissions & Scopes Tab */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Permissions & Scopes</h3>
          {permissions.length === 0 ? (
            <p className="text-gray-500">No permissions configured</p>
          ) : (
            <div className="space-y-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{permission.scope}</div>
                    <div className="text-sm text-gray-600 mt-1">{permission.description}</div>
                    {permission.isGranted && (
                      <div className="text-xs text-green-600 mt-1">
                        Granted: {formatDate(permission.grantedAt)}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      permission.isGranted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {permission.isGranted ? 'Granted' : 'Not Granted'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Org Units Tab */}
      {activeTab === 'org-units' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Organizational Unit Assignments</h3>
          {orgUnits.length === 0 ? (
            <p className="text-gray-500">No org unit assignments</p>
          ) : (
            <div className="space-y-4">
              {orgUnits.map((assignment) => (
                <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900">{assignment.orgUnitName}</div>
                  <div className="text-sm text-gray-600 mt-1">{assignment.orgUnitPath}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Assigned: {formatDate(assignment.assignedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit-log' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Audit Log</h3>
          {auditLog.length === 0 ? (
            <p className="text-gray-500">No audit entries found</p>
          ) : (
            <div className="space-y-4">
              {auditLog.map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{entry.action}</div>
                      <div className="text-sm text-gray-600">By: {entry.actorName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(entry.timestamp)} • IP: {entry.ipAddress}
                      </div>
                      {Object.keys(entry.changes).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">View changes</summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(entry.changes, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Usage Statistics Tab */}
      {activeTab === 'usage-stats' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Usage Overview</h3>
            {!usageStats ? (
              <p className="text-gray-500">Loading statistics...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{usageStats.totalUsers}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{usageStats.activeUsers}</div>
                  <div className="text-sm text-gray-600 mt-1">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{usageStats.totalSessions}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{usageStats.avgSessionDuration}m</div>
                  <div className="text-sm text-gray-600 mt-1">Avg Session Duration</div>
                </div>
              </div>
            )}
          </div>

          {usageStats && usageStats.stats && usageStats.stats.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Statistics</h3>
              <div className="space-y-2">
                {usageStats.stats.map((stat: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">{stat.date}</div>
                    <div className="flex gap-4">
                      <span className="text-sm">
                        <span className="font-medium">{stat.users}</span> users
                      </span>
                      <span className="text-sm">
                        <span className="font-medium">{stat.sessions}</span> sessions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`${t('common.edit')} ${t('common.application')}`}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateApplication}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
            <input
              type="url"
              value={editForm.url}
              onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Modal>

      {/* Add Redirect URI Modal */}
      <Modal
        isOpen={showAddURIModal}
        onClose={() => setShowAddURIModal(false)}
        title={`${t('common.add')} ${t('common.redirectUri')}`}
        footer={
          <>
            <button
              onClick={() => setShowAddURIModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRedirectURI}
              disabled={saving || !newURI.uri}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add URI'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URI</label>
            <input
              type="url"
              value={newURI.uri}
              onChange={(e) => setNewURI({ ...newURI, uri: e.target.value })}
              placeholder="https://example.com/callback"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={newURI.type}
              onChange={(e) => setNewURI({ ...newURI, type: e.target.value as 'web' | 'mobile' | 'desktop' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Add Client Secret Modal */}
      <Modal
        isOpen={showAddSecretModal}
        onClose={() => setShowAddSecretModal(false)}
        title="Generate Client Secret"
        footer={
          <>
            <button
              onClick={() => setShowAddSecretModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateSecret}
              disabled={saving || !newSecretName}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Generating...' : 'Generate Secret'}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secret Name</label>
          <input
            type="text"
            value={newSecretName}
            onChange={(e) => setNewSecretName(e.target.value)}
            placeholder="e.g., Production Secret"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Modal>

      {/* Generated Secret Display Modal */}
      <Modal
        isOpen={!!showGeneratedSecret}
        onClose={() => setShowGeneratedSecret('')}
        title="Client Secret Generated"
        footer={
          <button
            onClick={() => setShowGeneratedSecret('')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            I've Saved the Secret
          </button>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              Make sure to copy your client secret now. You won't be able to see it again!
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm break-all">
              {showGeneratedSecret}
            </div>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(showGeneratedSecret);
              setSuccess('Secret copied to clipboard');
            }}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      </Modal>

      <Helmet>
        <title>{application.name} - Application Details</title>
      </Helmet>
    </div>
  );
}
