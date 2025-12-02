import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { getTenantId } from '@/lib/tenant-context';
import { getCurrentUserScope, CurrentUserScopeDto } from '@/lib/api/users';
import { applicationsService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

interface Application {
  id: string;
  name: string;
  clientId: string;
  applicationType: string;
  redirectUris: Array<{ id: string; uri: string }>;
  clientSecrets?: Array<{ id: string; description: string; createdAt: string }>;
}

interface OrgUnitTreeNode {
  id: string;
  parentId: string | null;
  name: string;
  code?: string;
  level: number;
  status: number;
  children: OrgUnitTreeNode[];
}

export default function TenantAppsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [orgTree, setOrgTree] = useState<OrgUnitTreeNode[]>([]);
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignOrgUnitsModal, setShowAssignOrgUnitsModal] = useState(false);
  const [selectedAppForOrgUnits, setSelectedAppForOrgUnits] = useState<Application | null>(null);
  const [selectedOrgUnitIds, setSelectedOrgUnitIds] = useState<string[]>([]);
  const [newAppName, setNewAppName] = useState('');
  const [newAppType, setNewAppType] = useState('Web');
  const [newRedirectUris, setNewRedirectUris] = useState<string[]>(['']);
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAppName, setEditAppName] = useState('');
  const [editAppType, setEditAppType] = useState('Web');
  const [showRedirectUrisModal, setShowRedirectUrisModal] = useState(false);
  const [selectedAppForRedirectUris, setSelectedAppForRedirectUris] = useState<Application | null>(null);
  const [newRedirectUri, setNewRedirectUri] = useState('');
  const [showSecretsModal, setShowSecretsModal] = useState(false);
  const [selectedAppForSecrets, setSelectedAppForSecrets] = useState<Application | null>(null);
  const [newSecretDescription, setNewSecretDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userScope, setUserScope] = useState<CurrentUserScopeDto | null>(null);
  const [scopeLoading, setScopeLoading] = useState(true);

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
      fetchUserScope(tenantId);
    }
  }, [tenantId]);

  const fetchUserScope = async (tid: string) => {
    try {
      setScopeLoading(true);
      const scope = await getCurrentUserScope();
      setUserScope(scope);

      // Auto-select first rootOrgUnitId for delegated admins
      if (scope && !(scope as any).isGlobalAdmin && (scope as any).rootOrgUnitIds && (scope as any).rootOrgUnitIds.length > 0) {
        setSelectedOrgUnitId((scope as any).rootOrgUnitIds[0]);
      }
    } catch (err) {
      console.error('Error fetching user scope:', err);
    } finally {
      setScopeLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchApplications();
      fetchOrgTree();
    }
  }, [tenantId, selectedOrgUnitId]);

  const fetchApplications = async () => {
    if (!tenantId) return;

    try {
      const params: any = { tenantId, pageNumber: 1, pageSize: 100 };
      if (selectedOrgUnitId) params.orgUnitId = selectedOrgUnitId;

      const data = await applicationsService.getApplications(params);
      const apps = data.items || [];

      // Fetch details for each app to get redirect URIs
      const appsWithDetails = await Promise.all(
        apps.map(async (app: Application) => {
          try {
            const detailData = await applicationsService.getApplicationById(app.id);
            return {
              ...app,
              redirectUris: detailData.redirectUris || [],
              clientSecrets: detailData.clientSecrets || []
            };
          } catch (error) {
            console.error(`Error fetching details for app ${app.id}:`, error);
            return { ...app, redirectUris: [], clientSecrets: [] };
          }
        })
      );
      setApplications(appsWithDetails);

      // Update selected app if modal is open
      if (selectedAppForRedirectUris) {
        const updatedApp = appsWithDetails.find(a => a.id === selectedAppForRedirectUris.id);
        if (updatedApp) {
          setSelectedAppForRedirectUris(updatedApp);
        }
      }
      if (selectedAppForSecrets) {
        const updatedApp = appsWithDetails.find(a => a.id === selectedAppForSecrets.id);
        if (updatedApp) {
          setSelectedAppForSecrets(updatedApp);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgTree = async () => {
    if (!tenantId) return;
    try {
      const data = await applicationsService.getOrgUnitsTree();
      setOrgTree(data || []);
    } catch (error) {
      console.error('Error fetching org tree:', error);
    }
  };

  const getAllNodes = (nodes: OrgUnitTreeNode[]): OrgUnitTreeNode[] => {
    const result: OrgUnitTreeNode[] = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.children) {
        result.push(...getAllNodes(node.children));
      }
    });
    return result;
  };

  const getFilteredOrgTree = (): OrgUnitTreeNode[] => {
    if (!userScope || (userScope as any).isGlobalAdmin) {
      return orgTree;
    }
    // Filter to show only allowed org units
    const allNodes = getAllNodes(orgTree);
    return allNodes.filter(node => (userScope as any).allowedOrgUnitIds && (userScope as any).allowedOrgUnitIds.includes(node.id));
  };

  const handleAssignOrgUnits = async (app: Application) => {
    setSelectedAppForOrgUnits(app);
    try {
      const data = await applicationsService.getApplicationOrgUnits(tenantId, app.id);
      setSelectedOrgUnitIds(data.orgUnitIds || []);
    } catch (error) {
      console.error('Error fetching application org units:', error);
    }
    setShowAssignOrgUnitsModal(true);
  };

  const handleSaveOrgUnits = async () => {
    if (!selectedAppForOrgUnits) return;
    setError('');
    setSuccess('');

    try {
      await applicationsService.assignOrgUnits(tenantId, selectedAppForOrgUnits.id, selectedOrgUnitIds);
      setSuccess(t('tenant.applicationOrgUnits.orgUnitsAssigned'));
      setShowAssignOrgUnitsModal(false);
      setSelectedAppForOrgUnits(null);
      fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error assigning org units:', error);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await applicationsService.createApplication({
        tenantId,
        name: newAppName,
        applicationType: newAppType,
        redirectUris: newRedirectUris.filter(uri => uri.trim() !== '')
      });
      setShowCreateModal(false);
      setNewAppName('');
      setNewAppType('Web');
      setNewRedirectUris(['']);
      setSuccess(t('tenant.applications.applicationCreated'));
      fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error creating application:', error);
    }
  };

  const handleEditApplication = (app: Application) => {
    setEditingApp(app);
    setEditAppName(app.name);
    // Map applicationType enum to string
    const appTypeMap: Record<string, string> = {
      'Web': 'Web',
      'Mobile': 'Mobile',
      'SPA': 'SPA',
      '1': 'Web',
      '2': 'Mobile',
      '3': 'SPA'
    };
    setEditAppType(appTypeMap[app.applicationType] || 'Web');
    setShowEditModal(true);
  };

  const handleUpdateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId || !editingApp) return;

    try {
      await applicationsService.updateApplication(editingApp.id, {
        name: editAppName,
        applicationType: editAppType
      });
      setShowEditModal(false);
      setEditingApp(null);
      setEditAppName('');
      setEditAppType('Web');
      setSuccess(t('tenant.applications.applicationUpdated'));
      fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error updating application:', error);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm(t('tenant.applications.confirmDelete'))) return;
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await applicationsService.deleteApplication(appId);
      setSuccess(t('tenant.applications.applicationDeleted'));
      fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error deleting application:', error);
    }
  };

  const handleManageRedirectUris = (app: Application) => {
    setSelectedAppForRedirectUris(app);
    setShowRedirectUrisModal(true);
    setNewRedirectUri('');
  };

  const handleAddRedirectUri = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId || !selectedAppForRedirectUris) return;

    try {
      await applicationsService.addRedirectUri(tenantId, selectedAppForRedirectUris.id, newRedirectUri);
      setNewRedirectUri('');
      setSuccess(t('tenant.applications.redirectUriAdded'));
      await fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error adding redirect URI:', error);
    }
  };

  const handleRemoveRedirectUri = async (redirectUriId: string) => {
    if (!confirm(t('tenant.applications.confirmRemoveRedirectUri'))) return;
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await applicationsService.removeRedirectUri(tenantId, redirectUriId);
      setSuccess(t('tenant.applications.redirectUriRemoved'));
      await fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error removing redirect URI:', error);
    }
  };

  const handleManageSecrets = (app: Application) => {
    setSelectedAppForSecrets(app);
    setShowSecretsModal(true);
    setNewSecretDescription('');
  };

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!tenantId || !selectedAppForSecrets) return;

    try {
      await applicationsService.addClientSecret(tenantId, selectedAppForSecrets.id, newSecretDescription);
      setNewSecretDescription('');
      setSuccess('Client secret added successfully');
      await fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error adding client secret:', error);
    }
  };

  const handleRemoveSecret = async (secretId: string) => {
    if (!confirm('Are you sure you want to delete this client secret? Applications using this secret will stop working.')) return;
    setError('');
    setSuccess('');
    if (!tenantId) return;

    try {
      await applicationsService.removeClientSecret(tenantId, secretId);
      setSuccess('Client secret deleted successfully');
      await fetchApplications();
    } catch (error: any) {
      setError(error?.message || t('common.error'));
      console.error('Error removing client secret:', error);
    }
  };

  if (loading || scopeLoading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('tenant.applications.title')}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {t('tenant.applications.createApplication')}
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">{t('tenant.orgUnits.title')}</label>
        <select
          value={selectedOrgUnitId}
          onChange={(e) => {
            setSelectedOrgUnitId(e.target.value);
            setLoading(true);
          }}
          className="w-full max-w-xs px-3 py-2 border rounded"
        >
          {(!userScope || (userScope as any).isGlobalAdmin) && <option value="">{t('common.all')}</option>}
          {getFilteredOrgTree().map(node => (
            <option key={node.id} value={node.id}>{node.name}</option>
          ))}
        </select>
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('tenant.applications.createApplication')}</h2>
            <form onSubmit={handleCreateApplication}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.applications.applicationName')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.applications.applicationType')}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={newAppType}
                  onChange={(e) => setNewAppType(e.target.value)}
                >
                  <option value="Web">{t('tenant.applications.web')}</option>
                  <option value="Mobile">{t('tenant.applications.mobile')}</option>
                  <option value="SPA">{t('tenant.applications.spa')}</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.applications.redirectUris')}</label>
                {newRedirectUris.map((uri, index) => (
                  <input
                    key={index}
                    type="text"
                    className="w-full px-3 py-2 border rounded mb-2"
                    placeholder="https://example.com/callback"
                    value={uri}
                    onChange={(e) => {
                      const updated = [...newRedirectUris];
                      updated[index] = e.target.value;
                      setNewRedirectUris(updated);
                    }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setNewRedirectUris([...newRedirectUris, ''])}
                  className="text-sm text-indigo-600"
                >
                  {t('tenant.applications.addRedirectUri')}
                </button>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('common.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('tenant.applications.editApplication')}</h2>
            <form onSubmit={handleUpdateApplication}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.applications.applicationName')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={editAppName}
                  onChange={(e) => setEditAppName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('tenant.applications.applicationType')}</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={editAppType}
                  onChange={(e) => setEditAppType(e.target.value)}
                >
                  <option value="Web">{t('tenant.applications.web')}</option>
                  <option value="Mobile">{t('tenant.applications.mobile')}</option>
                  <option value="SPA">{t('tenant.applications.spa')}</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingApp(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRedirectUrisModal && selectedAppForRedirectUris && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{t('tenant.applications.manageRedirectUris')} - {selectedAppForRedirectUris.name}</h2>
            
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

            <form onSubmit={handleAddRedirectUri} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="https://example.com/callback"
                  value={newRedirectUri}
                  onChange={(e) => setNewRedirectUri(e.target.value)}
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  {t('tenant.applications.addRedirectUri')}
                </button>
              </div>
            </form>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">{t('tenant.applications.redirectUris')}</h3>
              {selectedAppForRedirectUris.redirectUris && selectedAppForRedirectUris.redirectUris.length > 0 ? (
                <ul className="space-y-2">
                  {selectedAppForRedirectUris.redirectUris.map((uri) => (
                    <li key={uri.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{uri.uri}</span>
                      <button
                        onClick={() => handleRemoveRedirectUri(uri.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        {t('common.delete')}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">{t('tenant.applications.noRedirectUris')}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowRedirectUrisModal(false);
                  setSelectedAppForRedirectUris(null);
                  setError('');
                  setSuccess('');
                }}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Secrets Modal */}
      {showSecretsModal && selectedAppForSecrets && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Manage Client Secrets - {selectedAppForSecrets.name}</h2>

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

            <form onSubmit={handleAddSecret} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="Secret description (e.g., Production, Development)"
                  value={newSecretDescription}
                  onChange={(e) => setNewSecretDescription(e.target.value)}
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
                  Add Secret
                </button>
              </div>
            </form>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Client Secrets</h3>
              {selectedAppForSecrets.clientSecrets && selectedAppForSecrets.clientSecrets.length > 0 ? (
                <ul className="space-y-2">
                  {selectedAppForSecrets.clientSecrets.map((secret) => (
                    <li key={secret.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm font-medium">{secret.description}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          (Created: {new Date(secret.createdAt).toLocaleDateString()})
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveSecret(secret.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        {t('common.delete')}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No client secrets. Add one to enable authentication.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowSecretsModal(false);
                  setSelectedAppForSecrets(null);
                  setError('');
                  setSuccess('');
                }}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign OrgUnits Modal */}
      {showAssignOrgUnitsModal && selectedAppForOrgUnits && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('tenant.applicationOrgUnits.selectOrgUnits')} - {selectedAppForOrgUnits.name}</h2>
            <div className="mb-4">
              <label className="block mb-2">{t('tenant.applicationOrgUnits.orgVisibility')}</label>
              <select
                multiple
                value={selectedOrgUnitIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedOrgUnitIds(selected);
                }}
                className="w-full border rounded px-3 py-2"
                size={8}
              >
                {getFilteredOrgTree().map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">{t('common.holdCtrl') || 'Hold Ctrl/Cmd to select multiple'}</p>
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
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAssignOrgUnitsModal(false);
                  setSelectedAppForOrgUnits(null);
                  setError('');
                  setSuccess('');
                }}
                className="px-4 py-2 border rounded"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveOrgUnits}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.applications.applicationName')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.applications.clientId')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant.applications.applicationType')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.clientId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {app.applicationType === 'Web' || app.applicationType === '1' ? t('tenant.applications.web') :
                   app.applicationType === 'Mobile' || app.applicationType === '2' ? t('tenant.applications.mobile') :
                   app.applicationType === 'SPA' || app.applicationType === '3' ? t('tenant.applications.spa') :
                   app.applicationType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditApplication(app)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleAssignOrgUnits(app)}
                      className="text-green-600 hover:text-green-900"
                    >
                      {t('tenant.applicationOrgUnits.selectOrgUnits')}
                    </button>
                    <button
                      onClick={() => handleManageRedirectUris(app)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {t('tenant.applications.manageRedirectUris')}
                    </button>
                    <button
                      onClick={() => handleManageSecrets(app)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Manage Secrets
                    </button>
                    <button
                      onClick={() => handleDeleteApplication(app.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

