'use client';

import { useState, useEffect } from 'react';
import { getTenantId } from '@/lib/tenant-context';
import { securityService } from '@/lib/api/services';
import DataTable, { Column } from '@/app/components/DataTable';
import StatusBadge from '@/app/components/StatusBadge';
import ActionButton from '@/app/components/ActionButton';
import LoadingOverlay from '@/app/components/LoadingOverlay';

interface MFAMethod {
  id: string;
  userId: string;
  userEmail: string;
  methodType: 'TOTP' | 'Email' | 'SMS';
  isEnabled: boolean;
  enrolledAt: string;
}

interface TrustedDevice {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: string;
  trustedAt: string;
  lastUsedAt: string;
  ipAddress: string;
}

export default function MFAManagementPage() {
  const [activeTab, setActiveTab] = useState<'methods' | 'devices' | 'rules'>('methods');
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [orgUnitRules, setOrgUnitRules] = useState<any[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
  }, []);

  useEffect(() => {
    if (tenantId) {
      if (activeTab === 'methods') fetchMFAMethods();
      else if (activeTab === 'devices') fetchTrustedDevices();
      else if (activeTab === 'rules') fetchOrgUnitRules();
    }
  }, [tenantId, activeTab]);

  const fetchMFAMethods = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await securityService.getUserMFAMethods(tenantId);
      setMfaMethods(data || []);
    } catch (err) {
      console.error('Error fetching MFA methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrustedDevices = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await securityService.getTrustedDevices(tenantId);
      setTrustedDevices(data || []);
    } catch (err) {
      console.error('Error fetching trusted devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgUnitRules = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await securityService.getOrgUnitMFARules(tenantId);
      setOrgUnitRules(data || []);
    } catch (err) {
      console.error('Error fetching org unit rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async (userId: string) => {
    if (!tenantId || !confirm('Are you sure you want to disable MFA for this user?')) return;
    setLoading(true);
    try {
      await securityService.disableMFAForUser(tenantId, userId);
      setSuccess('MFA disabled successfully');
      fetchMFAMethods();
    } catch (err) {
      setError('Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!tenantId || !confirm('Are you sure you want to delete this MFA method?')) return;
    setLoading(true);
    try {
      await securityService.deleteMFAMethod(tenantId, methodId);
      setSuccess('MFA method deleted successfully');
      fetchMFAMethods();
    } catch (err) {
      setError('Failed to delete MFA method');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeTrust = async (deviceId: string) => {
    if (!tenantId || !confirm('Are you sure you want to revoke trust for this device?')) return;
    setLoading(true);
    try {
      await securityService.revokeDeviceTrust(tenantId, deviceId);
      setSuccess('Trust revoked successfully');
      fetchTrustedDevices();
    } catch (err) {
      setError('Failed to revoke trust');
    } finally {
      setLoading(false);
    }
  };

  const mfaColumns: Column<MFAMethod>[] = [
    { key: 'userEmail', label: 'User' },
    { key: 'methodType', label: 'Method' },
    {
      key: 'isEnabled',
      label: 'Status',
      render: (m) => <StatusBadge status={m.isEnabled ? 'Enabled' : 'Disabled'} />
    },
    { key: 'enrolledAt', label: 'Enrolled', render: (m) => new Date(m.enrolledAt).toLocaleDateString() }
  ];

  const deviceColumns: Column<TrustedDevice>[] = [
    { key: 'deviceName', label: 'Device Name' },
    { key: 'deviceType', label: 'Type' },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'trustedAt', label: 'Trusted Since', render: (d) => new Date(d.trustedAt).toLocaleDateString() },
    { key: 'lastUsedAt', label: 'Last Used', render: (d) => new Date(d.lastUsedAt).toLocaleDateString() }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <LoadingOverlay isLoading={loading} message="Processing..." />

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          MFA & Device Management
        </h1>
        <p className="text-gray-600">Manage multi-factor authentication and trusted devices</p>
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">{success}</div>}

      <div className="mb-6 flex space-x-2 border-b border-gray-300">
        {['methods', 'devices', 'rules'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'methods' && (
        <DataTable
          data={mfaMethods}
          columns={mfaColumns}
          actions={(method) => (
            <div className="flex gap-2">
              <button
                onClick={() => handleDisableMFA(method.userId)}
                className="text-orange-600 hover:text-orange-800 font-medium"
              >
                Disable All
              </button>
              <button
                onClick={() => handleDeleteMethod(method.id)}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        />
      )}

      {activeTab === 'devices' && (
        <DataTable
          data={trustedDevices}
          columns={deviceColumns}
          actions={(device) => (
            <button
              onClick={() => handleRevokeTrust(device.id)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Revoke
            </button>
          )}
        />
      )}

      {activeTab === 'rules' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Organization Unit MFA Rules</h3>
          <p className="text-gray-600">Configure MFA requirements per organizational unit</p>
        </div>
      )}
    </div>
  );
}
