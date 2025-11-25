import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

interface CustomDomain {
  id: string;
  domain: string;
  status: 'pending' | 'verifying' | 'active' | 'failed' | 'expired';
  verificationMethod: 'dns' | 'file';
  dnsRecords: {
    type: string;
    name: string;
    value: string;
    verified: boolean;
  }[];
  sslStatus: 'pending' | 'active' | 'renewing' | 'expired';
  sslExpiry: string;
  createdAt: string;
  verifiedAt?: string;
  lastChecked: string;
  isPrimary: boolean;
}

export default function TenantDomainsPage() {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'dns' | 'file'>('dns');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const data = await platformService.getCustomDomains?.();
      const mockData: CustomDomain[] = [
        {
          id: '1',
          domain: 'app.acmecorp.com',
          status: 'active',
          verificationMethod: 'dns',
          dnsRecords: [
            {
              type: 'CNAME',
              name: 'app.acmecorp.com',
              value: 'proxy.onesign.io',
              verified: true,
            },
            {
              type: 'TXT',
              name: '_onesign-verification.acmecorp.com',
              value: 'onesign-verification=abc123def456',
              verified: true,
            },
          ],
          sslStatus: 'active',
          sslExpiry: '2025-05-15T00:00:00Z',
          createdAt: '2024-01-15T10:00:00Z',
          verifiedAt: '2024-01-15T12:30:00Z',
          lastChecked: '2024-11-23T10:00:00Z',
          isPrimary: true,
        },
        {
          id: '2',
          domain: 'portal.acmecorp.com',
          status: 'active',
          verificationMethod: 'dns',
          dnsRecords: [
            {
              type: 'CNAME',
              name: 'portal.acmecorp.com',
              value: 'proxy.onesign.io',
              verified: true,
            },
            {
              type: 'TXT',
              name: '_onesign-verification.acmecorp.com',
              value: 'onesign-verification=xyz789ghi012',
              verified: true,
            },
          ],
          sslStatus: 'active',
          sslExpiry: '2025-03-20T00:00:00Z',
          createdAt: '2024-02-20T09:00:00Z',
          verifiedAt: '2024-02-20T10:15:00Z',
          lastChecked: '2024-11-23T10:00:00Z',
          isPrimary: false,
        },
        {
          id: '3',
          domain: 'new.acmecorp.com',
          status: 'verifying',
          verificationMethod: 'dns',
          dnsRecords: [
            {
              type: 'CNAME',
              name: 'new.acmecorp.com',
              value: 'proxy.onesign.io',
              verified: false,
            },
            {
              type: 'TXT',
              name: '_onesign-verification.acmecorp.com',
              value: 'onesign-verification=mno345pqr678',
              verified: false,
            },
          ],
          sslStatus: 'pending',
          sslExpiry: '',
          createdAt: '2024-11-22T14:00:00Z',
          lastChecked: '2024-11-23T10:00:00Z',
          isPrimary: false,
        },
      ];
      setDomains(data || mockData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await platformService.addCustomDomain?.('tenant-id', { domain: newDomain, verificationMethod });
      setShowAdd(false);
      setNewDomain('');
      fetchDomains();
    } catch (error) {
      console.error('Failed to add custom domain:', error);
    }
  };

  const handleVerify = async (domainId: string) => {
    try {
      await platformService.verifyCustomDomain?.('tenant-id', domainId);
      fetchDomains();
    } catch (error) {
      console.error('Failed to verify custom domain:', error);
    }
  };

  const handleDelete = async (domainId: string) => {
    if (!confirm('Remove this custom domain?')) return;
    try {
      await platformService.deleteCustomDomain?.('tenant-id', domainId);
      fetchDomains();
    } catch (error) {
      console.error('Failed to delete custom domain:', error);
    }
  };

  const handleSetPrimary = async (domainId: string) => {
    try {
      await platformService.setPrimaryDomain?.('tenant-id', domainId);
      fetchDomains();
    } catch (error) {
      console.error('Failed to set primary domain:', error);
    }
  };

  const handleRenewSSL = async (domainId: string) => {
    try {
      await platformService.renewDomainSSL?.('tenant-id', domainId);
      fetchDomains();
    } catch (error) {
      console.error('Failed to renew SSL certificate:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      verifying: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  const getSSLBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      renewing: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Custom Domains</h1>
          <p className="text-gray-600 mt-1">Configure custom domains for your tenant</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Domain
        </button>
      </div>

      {/* Domains List */}
      <div className="space-y-4">
        {domains.map((domain) => (
          <div key={domain.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold font-mono">{domain.domain}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(domain.status)}`}>
                    {domain.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getSSLBadge(domain.sslStatus)}`}>
                    SSL: {domain.sslStatus}
                  </span>
                  {domain.isPrimary && (
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Created: {new Date(domain.createdAt).toLocaleString()}
                  {domain.verifiedAt && ` | Verified: ${new Date(domain.verifiedAt).toLocaleString()}`}
                </div>
              </div>

              <div className="flex space-x-2">
                {domain.status === 'verifying' && (
                  <button
                    onClick={() => handleVerify(domain.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Verify Now
                  </button>
                )}
                {domain.status === 'active' && !domain.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(domain.id)}
                    className="px-3 py-1 text-sm border border-purple-300 text-purple-600 rounded hover:bg-purple-50"
                  >
                    Set as Primary
                  </button>
                )}
                {domain.sslStatus === 'active' && (
                  <button
                    onClick={() => handleRenewSSL(domain.id)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Renew SSL
                  </button>
                )}
                <button
                  onClick={() => handleDelete(domain.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* DNS Records */}
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-3">DNS Configuration</h4>
              <div className="space-y-2">
                {domain.dnsRecords.map((record, idx) => (
                  <div key={idx} className="bg-gray-50 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-mono">
                          {record.type}
                        </span>
                        <span className={`text-xs ${record.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                          {record.verified ? '✓ Verified' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="grid grid-cols-4 gap-2">
                        <span className="text-gray-500 font-medium">Name:</span>
                        <span className="col-span-3 font-mono text-xs">{record.name}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <span className="text-gray-500 font-medium">Value:</span>
                        <span className="col-span-3 font-mono text-xs break-all">{record.value}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SSL Info */}
            {domain.sslStatus === 'active' && domain.sslExpiry && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">SSL Certificate Expires:</span>
                  <span className="font-semibold">
                    {new Date(domain.sslExpiry).toLocaleDateString()}
                    <span className="ml-2 text-gray-500">
                      ({Math.ceil((new Date(domain.sslExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days)
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Instructions for pending domains */}
            {domain.status === 'verifying' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">⚠️ Action Required</h4>
                <p className="text-sm text-blue-700">
                  Add the DNS records shown above to your domain's DNS settings.
                  Verification can take up to 48 hours, but usually completes within a few minutes.
                </p>
                <button
                  onClick={() => handleVerify(domain.id)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Click here to check verification status
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Domain Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Custom Domain</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Domain Name</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="app.yourdomain.com"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the fully qualified domain name (e.g., app.yourdomain.com)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Verification Method</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="dns"
                      checked={verificationMethod === 'dns'}
                      onChange={(e) => setVerificationMethod('dns')}
                      className="mr-2"
                    />
                    <div>
                      <div className="font-medium">DNS Verification (Recommended)</div>
                      <div className="text-xs text-gray-500">Add DNS records to verify domain ownership</div>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={verificationMethod === 'file'}
                      onChange={(e) => setVerificationMethod('file')}
                      className="mr-2"
                    />
                    <div>
                      <div className="font-medium">File Upload</div>
                      <div className="text-xs text-gray-500">Upload a verification file to your domain</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>Note:</strong> After adding the domain, you'll need to configure DNS records
                and wait for verification. SSL certificates will be automatically provisioned after verification.
              </div>

              <div className="flex justify-end space-x-2">
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
                  Add Domain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
