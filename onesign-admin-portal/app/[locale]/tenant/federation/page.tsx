'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import Modal from '@/app/components/Modal';
import StatusBadge from '@/app/components/StatusBadge';
import DataTable, { Column } from '@/app/components/DataTable';

interface SAMLProvider {
  id: string;
  tenantId: string;
  name: string;
  entityId: string;
  ssoUrl: string;
  certificate: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OIDCProvider {
  id: string;
  tenantId: string;
  name: string;
  issuer: string;
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  jwksUri: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SCIMToken {
  id: string;
  tenantId: string;
  name: string;
  token: string;
  expiresAt: string | null;
  enabled: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

type Tab = 'saml' | 'oidc' | 'scim';
type ProviderType = 'saml' | 'oidc';

export default function FederationPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>('saml');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [samlProviders, setSamlProviders] = useState<SAMLProvider[]>([]);
  const [oidcProviders, setOidcProviders] = useState<OIDCProvider[]>([]);
  const [scimTokens, setScimTokens] = useState<SCIMToken[]>([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // SAML Form states
  const [samlName, setSamlName] = useState('');
  const [samlEntityId, setSamlEntityId] = useState('');
  const [samlSsoUrl, setSamlSsoUrl] = useState('');
  const [samlCertificate, setSamlCertificate] = useState('');
  const [samlEnabled, setSamlEnabled] = useState(true);

  // OIDC Form states
  const [oidcName, setOidcName] = useState('');
  const [oidcIssuer, setOidcIssuer] = useState('');
  const [oidcClientId, setOidcClientId] = useState('');
  const [oidcClientSecret, setOidcClientSecret] = useState('');
  const [oidcAuthEndpoint, setOidcAuthEndpoint] = useState('');
  const [oidcTokenEndpoint, setOidcTokenEndpoint] = useState('');
  const [oidcUserInfoEndpoint, setOidcUserInfoEndpoint] = useState('');
  const [oidcJwksUri, setOidcJwksUri] = useState('');
  const [oidcEnabled, setOidcEnabled] = useState(true);

  // SCIM Form states
  const [scimName, setScimName] = useState('');
  const [scimExpiresAt, setScimExpiresAt] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'saml') {
        await fetchSAMLProviders();
      } else if (activeTab === 'oidc') {
        await fetchOIDCProviders();
      } else if (activeTab === 'scim') {
        await fetchSCIMTokens();
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSAMLProviders = async () => {
    const response = await fetch(
      `http://localhost:7000/api/tenant/federation/saml-providers?tenantId=${tenantId}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch SAML providers');
    }

    const data = await response.json();
    setSamlProviders(data);
  };

  const fetchOIDCProviders = async () => {
    const response = await fetch(
      `http://localhost:7000/api/tenant/federation/oidc-providers?tenantId=${tenantId}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch OIDC providers');
    }

    const data = await response.json();
    setOidcProviders(data);
  };

  const fetchSCIMTokens = async () => {
    const response = await fetch(
      `http://localhost:7000/api/tenant/federation/scim-tokens?tenantId=${tenantId}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch SCIM tokens');
    }

    const data = await response.json();
    setScimTokens(data);
  };

  const handleCreateSAML = async () => {
    if (!samlName || !samlEntityId || !samlSsoUrl || !samlCertificate) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/federation/saml-providers?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: samlName,
            entityId: samlEntityId,
            ssoUrl: samlSsoUrl,
            certificate: samlCertificate,
            enabled: samlEnabled,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create SAML provider');
      }

      setSuccess('SAML provider created successfully');
      setShowCreateModal(false);
      resetSAMLForm();
      fetchSAMLProviders();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOIDC = async () => {
    if (!oidcName || !oidcIssuer || !oidcClientId || !oidcClientSecret) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/federation/oidc-providers?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: oidcName,
            issuer: oidcIssuer,
            clientId: oidcClientId,
            clientSecret: oidcClientSecret,
            authorizationEndpoint: oidcAuthEndpoint,
            tokenEndpoint: oidcTokenEndpoint,
            userInfoEndpoint: oidcUserInfoEndpoint,
            jwksUri: oidcJwksUri,
            enabled: oidcEnabled,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create OIDC provider');
      }

      setSuccess('OIDC provider created successfully');
      setShowCreateModal(false);
      resetOIDCForm();
      fetchOIDCProviders();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSCIM = async () => {
    if (!scimName) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(
        `http://localhost:7000/api/tenant/federation/scim-tokens?tenantId=${tenantId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: scimName,
            expiresAt: scimExpiresAt || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create SCIM token');
      }

      const data = await response.json();
      setSuccess(`SCIM token created successfully. Token: ${data.token}`);
      setShowCreateModal(false);
      resetSCIMForm();
      fetchSCIMTokens();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProvider = async () => {
    if (!selectedItem) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const endpoint =
        activeTab === 'saml'
          ? `saml-providers/${selectedItem.id}`
          : `oidc-providers/${selectedItem.id}`;

      const body =
        activeTab === 'saml'
          ? {
              name: samlName,
              entityId: samlEntityId,
              ssoUrl: samlSsoUrl,
              certificate: samlCertificate,
              enabled: samlEnabled,
            }
          : {
              name: oidcName,
              issuer: oidcIssuer,
              clientId: oidcClientId,
              clientSecret: oidcClientSecret,
              authorizationEndpoint: oidcAuthEndpoint,
              tokenEndpoint: oidcTokenEndpoint,
              userInfoEndpoint: oidcUserInfoEndpoint,
              jwksUri: oidcJwksUri,
              enabled: oidcEnabled,
            };

      const response = await fetch(
        `http://localhost:7000/api/tenant/federation/${endpoint}?tenantId=${tenantId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update provider');
      }

      setSuccess('Provider updated successfully');
      setShowEditModal(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      let endpoint = '';
      if (activeTab === 'saml') {
        endpoint = `saml-providers/${selectedItem.id}`;
      } else if (activeTab === 'oidc') {
        endpoint = `oidc-providers/${selectedItem.id}`;
      } else if (activeTab === 'scim') {
        endpoint = `scim-tokens/${selectedItem.id}`;
      }

      const response = await fetch(
        `http://localhost:7000/api/tenant/federation/${endpoint}?tenantId=${tenantId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setSuccess('Item deleted successfully');
      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetSAMLForm = () => {
    setSamlName('');
    setSamlEntityId('');
    setSamlSsoUrl('');
    setSamlCertificate('');
    setSamlEnabled(true);
  };

  const resetOIDCForm = () => {
    setOidcName('');
    setOidcIssuer('');
    setOidcClientId('');
    setOidcClientSecret('');
    setOidcAuthEndpoint('');
    setOidcTokenEndpoint('');
    setOidcUserInfoEndpoint('');
    setOidcJwksUri('');
    setOidcEnabled(true);
  };

  const resetSCIMForm = () => {
    setScimName('');
    setScimExpiresAt('');
  };

  const loadItemForEdit = (item: any) => {
    setSelectedItem(item);
    if (activeTab === 'saml') {
      setSamlName(item.name);
      setSamlEntityId(item.entityId);
      setSamlSsoUrl(item.ssoUrl);
      setSamlCertificate(item.certificate);
      setSamlEnabled(item.enabled);
    } else if (activeTab === 'oidc') {
      setOidcName(item.name);
      setOidcIssuer(item.issuer);
      setOidcClientId(item.clientId);
      setOidcClientSecret(item.clientSecret);
      setOidcAuthEndpoint(item.authorizationEndpoint);
      setOidcTokenEndpoint(item.tokenEndpoint);
      setOidcUserInfoEndpoint(item.userInfoEndpoint);
      setOidcJwksUri(item.jwksUri);
      setOidcEnabled(item.enabled);
    }
    setShowEditModal(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const samlColumns: Column<SAMLProvider>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'entityId',
      label: 'Entity ID',
      render: (item) => <span className="font-mono text-xs">{item.entityId}</span>,
    },
    {
      key: 'ssoUrl',
      label: 'SSO URL',
      render: (item) => <span className="text-xs">{item.ssoUrl}</span>,
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (item) => <StatusBadge status={item.enabled ? 'enabled' : 'disabled'} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (item) => formatDate(item.createdAt),
      sortable: true,
    },
  ];

  const oidcColumns: Column<OIDCProvider>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'issuer',
      label: 'Issuer',
      render: (item) => <span className="text-xs">{item.issuer}</span>,
    },
    {
      key: 'clientId',
      label: 'Client ID',
      render: (item) => <span className="font-mono text-xs">{item.clientId}</span>,
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (item) => <StatusBadge status={item.enabled ? 'enabled' : 'disabled'} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (item) => formatDate(item.createdAt),
      sortable: true,
    },
  ];

  const scimColumns: Column<SCIMToken>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'token',
      label: 'Token',
      render: (item) => <span className="font-mono text-xs">{item.token.substring(0, 20)}...</span>,
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      render: (item) => formatDate(item.expiresAt),
    },
    {
      key: 'lastUsedAt',
      label: 'Last Used',
      render: (item) => formatDate(item.lastUsedAt),
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (item) => <StatusBadge status={item.enabled ? 'enabled' : 'disabled'} />,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Federation Management
            </h1>
            <p className="text-gray-600 mt-2">Manage SSO and identity federation</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add {activeTab.toUpperCase()} {activeTab === 'scim' ? 'Token' : 'Provider'}
          </button>
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
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['saml', 'oidc', 'scim'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm uppercase transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab} {tab === 'scim' ? 'Tokens' : 'Providers'}
            </button>
          ))}
        </nav>
      </div>

      {/* SAML Tab */}
      {activeTab === 'saml' && (
        <DataTable
          data={samlProviders}
          columns={samlColumns}
          loading={loading}
          emptyMessage="No SAML providers configured"
          actions={(item) => (
            <div className="flex gap-2">
              <button
                onClick={() => loadItemForEdit(item)}
                className="text-blue-600 hover:text-blue-900 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setSelectedItem(item);
                  setShowDeleteModal(true);
                }}
                className="text-red-600 hover:text-red-900 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        />
      )}

      {/* OIDC Tab */}
      {activeTab === 'oidc' && (
        <DataTable
          data={oidcProviders}
          columns={oidcColumns}
          loading={loading}
          emptyMessage="No OIDC providers configured"
          actions={(item) => (
            <div className="flex gap-2">
              <button
                onClick={() => loadItemForEdit(item)}
                className="text-blue-600 hover:text-blue-900 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setSelectedItem(item);
                  setShowDeleteModal(true);
                }}
                className="text-red-600 hover:text-red-900 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        />
      )}

      {/* SCIM Tab */}
      {activeTab === 'scim' && (
        <DataTable
          data={scimTokens}
          columns={scimColumns}
          loading={loading}
          emptyMessage="No SCIM tokens created"
          actions={(item) => (
            <button
              onClick={() => {
                setSelectedItem(item);
                setShowDeleteModal(true);
              }}
              className="text-red-600 hover:text-red-900 font-medium"
            >
              Delete
            </button>
          )}
        />
      )}

      {/* Create SAML Provider Modal */}
      {activeTab === 'saml' && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetSAMLForm();
          }}
          title="Create SAML Provider"
          size="lg"
          footer={
            <>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetSAMLForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSAML}
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Provider'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={samlName}
                onChange={(e) => setSamlName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="My SAML Provider"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={samlEntityId}
                onChange={(e) => setSamlEntityId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://idp.example.com/entity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SSO URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={samlSsoUrl}
                onChange={(e) => setSamlSsoUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://idp.example.com/sso"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate <span className="text-red-500">*</span>
              </label>
              <textarea
                value={samlCertificate}
                onChange={(e) => setSamlCertificate(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={samlEnabled}
                onChange={(e) => setSamlEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable this provider</label>
            </div>
          </div>
        </Modal>
      )}

      {/* Create OIDC Provider Modal */}
      {activeTab === 'oidc' && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetOIDCForm();
          }}
          title="Create OIDC Provider"
          size="xl"
          footer={
            <>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetOIDCForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOIDC}
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Provider'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={oidcName}
                  onChange={(e) => setOidcName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuer <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={oidcIssuer}
                  onChange={(e) => setOidcIssuer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={oidcClientId}
                  onChange={(e) => setOidcClientId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Secret <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={oidcClientSecret}
                  onChange={(e) => setOidcClientSecret(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Authorization Endpoint</label>
              <input
                type="url"
                value={oidcAuthEndpoint}
                onChange={(e) => setOidcAuthEndpoint(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Token Endpoint</label>
              <input
                type="url"
                value={oidcTokenEndpoint}
                onChange={(e) => setOidcTokenEndpoint(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">UserInfo Endpoint</label>
              <input
                type="url"
                value={oidcUserInfoEndpoint}
                onChange={(e) => setOidcUserInfoEndpoint(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">JWKS URI</label>
              <input
                type="url"
                value={oidcJwksUri}
                onChange={(e) => setOidcJwksUri(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={oidcEnabled}
                onChange={(e) => setOidcEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable this provider</label>
            </div>
          </div>
        </Modal>
      )}

      {/* Create SCIM Token Modal */}
      {activeTab === 'scim' && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetSCIMForm();
          }}
          title="Create SCIM Token"
          footer={
            <>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetSCIMForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSCIM}
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Token'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={scimName}
                onChange={(e) => setScimName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="My SCIM Integration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date (Optional)</label>
              <input
                type="datetime-local"
                value={scimExpiresAt}
                onChange={(e) => setScimExpiresAt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> The token will only be displayed once after creation. Please copy and store
                it securely.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Provider Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        title={`Edit ${activeTab.toUpperCase()} Provider`}
        size={activeTab === 'oidc' ? 'xl' : 'lg'}
        footer={
          <>
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedItem(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProvider}
              disabled={submitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Provider'}
            </button>
          </>
        }
      >
        {activeTab === 'saml' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={samlName}
                onChange={(e) => setSamlName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity ID</label>
              <input
                type="text"
                value={samlEntityId}
                onChange={(e) => setSamlEntityId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SSO URL</label>
              <input
                type="url"
                value={samlSsoUrl}
                onChange={(e) => setSamlSsoUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificate</label>
              <textarea
                value={samlCertificate}
                onChange={(e) => setSamlCertificate(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={samlEnabled}
                onChange={(e) => setSamlEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable this provider</label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={oidcName}
                  onChange={(e) => setOidcName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
                <input
                  type="url"
                  value={oidcIssuer}
                  onChange={(e) => setOidcIssuer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                <input
                  type="text"
                  value={oidcClientId}
                  onChange={(e) => setOidcClientId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                <input
                  type="password"
                  value={oidcClientSecret}
                  onChange={(e) => setOidcClientSecret(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Authorization Endpoint</label>
              <input
                type="url"
                value={oidcAuthEndpoint}
                onChange={(e) => setOidcAuthEndpoint(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Token Endpoint</label>
              <input
                type="url"
                value={oidcTokenEndpoint}
                onChange={(e) => setOidcTokenEndpoint(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">UserInfo Endpoint</label>
              <input
                type="url"
                value={oidcUserInfoEndpoint}
                onChange={(e) => setOidcUserInfoEndpoint(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">JWKS URI</label>
              <input
                type="url"
                value={oidcJwksUri}
                onChange={(e) => setOidcJwksUri(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={oidcEnabled}
                onChange={(e) => setOidcEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable this provider</label>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        title="Confirm Deletion"
        footer={
          <>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete <strong>{selectedItem?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>

      <LoadingOverlay isLoading={submitting} message="Processing..." />
    </div>
  );
}
