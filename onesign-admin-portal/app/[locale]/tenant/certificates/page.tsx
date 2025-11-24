'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { platformService } from '@/lib/api/services';

interface Certificate {
  id: string;
  name: string;
  domain: string;
  issuer: string;
  expiresAt: string;
  createdAt: string;
  status: 'valid' | 'expiring' | 'expired';
  type: 'ssl' | 'tls' | 'client';
  serialNumber: string;
  fingerprint: string;
}

export default function CertificatesPage() {
  const t = useTranslations();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const data = await platformService.getCertificates?.();
      const mockData: Certificate[] = [
        {
          id: '1',
          name: 'Main SSL Certificate',
          domain: '*.example.com',
          issuer: "Let's Encrypt Authority X3",
          expiresAt: '2025-06-15T00:00:00Z',
          createdAt: '2024-06-15T00:00:00Z',
          status: 'valid',
          type: 'ssl',
          serialNumber: '04:A1:2F:...',
          fingerprint: 'SHA256:A1:B2:C3:...',
        },
        {
          id: '2',
          name: 'API Certificate',
          domain: 'api.example.com',
          issuer: 'DigiCert Inc',
          expiresAt: '2025-01-10T00:00:00Z',
          createdAt: '2024-01-10T00:00:00Z',
          status: 'expiring',
          type: 'tls',
          serialNumber: '05:B2:3G:...',
          fingerprint: 'SHA256:B2:C3:D4:...',
        },
      ];
      setCertificates(data || mockData);
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      setError(err.message || 'Failed to load certificates');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await platformService.uploadCertificate?.('tenant-id', file);
      setShowUpload(false);
      setFile(null);
      fetchCertificates();
    } catch (err: any) {
      setError(err.message || 'Failed to upload certificate');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await platformService.deleteCertificate?.('tenant-id', id);
      fetchCertificates();
    } catch (err: any) {
      setError(err.message || 'Failed to delete certificate');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SSL/TLS Certificates</h1>
          <p className="text-gray-600 mt-1">Manage your SSL/TLS certificates</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Upload Certificate
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Certificates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issuer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {certificates.map((cert) => {
              const daysLeft = getDaysUntilExpiry(cert.expiresAt);
              return (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{cert.name}</div>
                    <div className="text-sm text-gray-500">{cert.type.toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cert.domain}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cert.issuer}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(cert.expiresAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(cert.status)}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleDelete(cert.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload Certificate</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate File (.pem, .crt)
                </label>
                <input
                  type="file"
                  accept=".pem,.crt,.cer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setFile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Certificate Details</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedCert.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Domain</p>
                  <p className="font-medium">{selectedCert.domain}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issuer</p>
                  <p className="font-medium">{selectedCert.issuer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{selectedCert.type.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="font-mono text-sm">{selectedCert.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fingerprint</p>
                  <p className="font-mono text-sm">{selectedCert.fingerprint}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{new Date(selectedCert.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expires</p>
                  <p className="font-medium">{new Date(selectedCert.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
