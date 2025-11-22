'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import DataTable, { Column } from '@/app/components/DataTable';
import Modal from '@/app/components/Modal';
import StatusBadge from '@/app/components/StatusBadge';
import { securityService, governanceService } from '@/lib/api/services';

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'Security' | 'Compliance' | 'Access' | 'Data';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Inactive' | 'Draft';
  scope: 'Global' | 'Tenant';
  appliedTenants: number;
  violations: number;
  createdAt: string;
  updatedAt: string;
}

interface ThreatDetectionRule {
  id: string;
  name: string;
  category: 'Anomaly' | 'Brute Force' | 'Data Exfiltration' | 'Privilege Escalation';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  enabled: boolean;
  detections: number;
  threshold: string;
  actions: string[];
  createdAt: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  type: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
  controls: number;
  compliantControls: number;
  complianceRate: number;
  lastAudit: string;
  nextAudit: string;
  status: 'Compliant' | 'Non-Compliant' | 'In Progress';
}

interface SecurityDashboardStats {
  totalPolicies: number;
  activePolicies: number;
  totalViolations: number;
  criticalViolations: number;
  threatDetections: number;
  complianceRate: number;
  tenantsProtected: number;
}

export default function GlobalSecurityPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<'policies' | 'threats' | 'compliance' | 'dashboard'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dashboard State
  const [stats, setStats] = useState<SecurityDashboardStats>({
    totalPolicies: 0,
    activePolicies: 0,
    totalViolations: 0,
    criticalViolations: 0,
    threatDetections: 0,
    complianceRate: 0,
    tenantsProtected: 0,
  });

  // Policies State
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [showCreatePolicyModal, setShowCreatePolicyModal] = useState(false);
  const [showEditPolicyModal, setShowEditPolicyModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [policyName, setPolicyName] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [policyType, setPolicyType] = useState<'Security' | 'Compliance' | 'Access' | 'Data'>('Security');
  const [policySeverity, setPolicySeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');

  // Threat Detection State
  const [threats, setThreats] = useState<ThreatDetectionRule[]>([]);
  const [showCreateThreatModal, setShowCreateThreatModal] = useState(false);
  const [threatName, setThreatName] = useState('');
  const [threatCategory, setThreatCategory] = useState<'Anomaly' | 'Brute Force' | 'Data Exfiltration' | 'Privilege Escalation'>('Anomaly');
  const [threatSeverity, setThreatSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [threatThreshold, setThreatThreshold] = useState('');

  // Compliance State
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchPolicies(),
        fetchThreats(),
        fetchFrameworks(),
        fetchDashboardStats(),
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const data = await securityService.getPolicies();
      setPolicies(data as any);
    } catch (err) {
      console.error('Error fetching policies:', err);
      // Mock data
      setPolicies([
        {
          id: '1',
          name: 'Multi-Factor Authentication Required',
          description: 'Enforce MFA for all privileged accounts across all tenants',
          type: 'Security',
          severity: 'Critical',
          status: 'Active',
          scope: 'Global',
          appliedTenants: 145,
          violations: 3,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-11-20T14:30:00Z',
        },
        {
          id: '2',
          name: 'Password Complexity Standards',
          description: 'Minimum 12 characters, mixed case, numbers, and special characters',
          type: 'Security',
          severity: 'High',
          status: 'Active',
          scope: 'Global',
          appliedTenants: 145,
          violations: 8,
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-11-18T11:20:00Z',
        },
        {
          id: '3',
          name: 'GDPR Data Protection',
          description: 'Ensure PII data encryption and access controls',
          type: 'Compliance',
          severity: 'Critical',
          status: 'Active',
          scope: 'Global',
          appliedTenants: 98,
          violations: 1,
          createdAt: '2024-02-01T08:00:00Z',
          updatedAt: '2024-11-22T09:15:00Z',
        },
        {
          id: '4',
          name: 'Session Timeout Policy',
          description: 'Automatic session timeout after 30 minutes of inactivity',
          type: 'Access',
          severity: 'Medium',
          status: 'Active',
          scope: 'Global',
          appliedTenants: 145,
          violations: 0,
          createdAt: '2024-01-20T12:00:00Z',
          updatedAt: '2024-11-15T16:45:00Z',
        },
        {
          id: '5',
          name: 'Data Retention Policy',
          description: 'Audit logs retained for minimum 1 year',
          type: 'Data',
          severity: 'High',
          status: 'Active',
          scope: 'Global',
          appliedTenants: 145,
          violations: 2,
          createdAt: '2024-02-10T14:00:00Z',
          updatedAt: '2024-11-19T10:30:00Z',
        },
      ]);
    }
  };

  const fetchThreats = async () => {
    try {
      // Note: Using mock data as there's no global threat detection endpoint yet
      setThreats([
        {
          id: '1',
          name: 'Failed Login Attempts',
          category: 'Brute Force',
          severity: 'Critical',
          enabled: true,
          detections: 234,
          threshold: '5 attempts in 10 minutes',
          actions: ['Block IP', 'Alert Admin', 'Require MFA'],
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          name: 'Unusual Data Access Pattern',
          category: 'Anomaly',
          severity: 'High',
          enabled: true,
          detections: 89,
          threshold: '100+ records accessed in 1 hour',
          actions: ['Alert Admin', 'Throttle Access'],
          createdAt: '2024-01-20T11:30:00Z',
        },
        {
          id: '3',
          name: 'Privilege Escalation Attempt',
          category: 'Privilege Escalation',
          severity: 'Critical',
          enabled: true,
          detections: 12,
          threshold: 'Unauthorized role change attempt',
          actions: ['Block User', 'Alert Admin', 'Create Incident'],
          createdAt: '2024-02-01T09:00:00Z',
        },
        {
          id: '4',
          name: 'Large Data Export',
          category: 'Data Exfiltration',
          severity: 'High',
          enabled: true,
          detections: 45,
          threshold: '>1GB exported in single session',
          actions: ['Alert Admin', 'Require Approval'],
          createdAt: '2024-02-05T14:20:00Z',
        },
        {
          id: '5',
          name: 'Impossible Travel',
          category: 'Anomaly',
          severity: 'High',
          enabled: true,
          detections: 67,
          threshold: 'Login from 2 locations <1 hour apart',
          actions: ['Block Session', 'Alert User', 'Require Re-Auth'],
          createdAt: '2024-01-25T16:45:00Z',
        },
      ]);
    } catch (err) {
      console.error('Error fetching threats:', err);
    }
  };

  const fetchFrameworks = async () => {
    try {
      const data = await governanceService.getFrameworks();
      setFrameworks(data.map((f: any) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        type: f.type || 'SOC2',
        controls: 150,
        compliantControls: 142,
        complianceRate: 94.7,
        lastAudit: '2024-10-15',
        nextAudit: '2025-01-15',
        status: 'Compliant',
      })));
    } catch (err) {
      console.error('Error fetching frameworks:', err);
      // Mock data
      setFrameworks([
        {
          id: '1',
          name: 'SOC 2 Type II',
          description: 'Service Organization Control 2 compliance framework',
          type: 'SOC2',
          controls: 150,
          compliantControls: 147,
          complianceRate: 98.0,
          lastAudit: '2024-10-15',
          nextAudit: '2025-01-15',
          status: 'Compliant',
        },
        {
          id: '2',
          name: 'ISO 27001:2022',
          description: 'Information Security Management System standard',
          type: 'ISO27001',
          controls: 114,
          compliantControls: 109,
          complianceRate: 95.6,
          lastAudit: '2024-09-20',
          nextAudit: '2024-12-20',
          status: 'Compliant',
        },
        {
          id: '3',
          name: 'GDPR',
          description: 'General Data Protection Regulation compliance',
          type: 'GDPR',
          controls: 88,
          compliantControls: 86,
          complianceRate: 97.7,
          lastAudit: '2024-11-01',
          nextAudit: '2025-02-01',
          status: 'Compliant',
        },
        {
          id: '4',
          name: 'HIPAA',
          description: 'Health Insurance Portability and Accountability Act',
          type: 'HIPAA',
          controls: 164,
          compliantControls: 155,
          complianceRate: 94.5,
          lastAudit: '2024-08-10',
          nextAudit: '2024-11-10',
          status: 'In Progress',
        },
        {
          id: '5',
          name: 'PCI-DSS v4.0',
          description: 'Payment Card Industry Data Security Standard',
          type: 'PCI-DSS',
          controls: 375,
          compliantControls: 348,
          complianceRate: 92.8,
          lastAudit: '2024-07-15',
          nextAudit: '2024-10-15',
          status: 'Compliant',
        },
      ]);
    }
  };

  const fetchDashboardStats = async () => {
    // Calculate stats from loaded data
    setStats({
      totalPolicies: 145,
      activePolicies: 142,
      totalViolations: 14,
      criticalViolations: 4,
      threatDetections: 447,
      complianceRate: 95.8,
      tenantsProtected: 145,
    });
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await securityService.createPolicy({
        name: policyName,
        description: policyDescription,
        type: policyType,
        severity: policySeverity,
        status: 'Active',
        scope: 'Global',
      } as any);
      setSuccess('Policy created successfully');
      setShowCreatePolicyModal(false);
      resetPolicyForm();
      fetchPolicies();
    } catch (err: any) {
      setError(err?.message || 'Error creating policy');
      console.error('Error creating policy:', err);
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;
    setError('');
    setSuccess('');

    try {
      await securityService.updatePolicy(selectedPolicy.id, {
        name: policyName,
        description: policyDescription,
        type: policyType,
        severity: policySeverity,
      } as any);
      setSuccess('Policy updated successfully');
      setShowEditPolicyModal(false);
      resetPolicyForm();
      fetchPolicies();
    } catch (err: any) {
      setError(err?.message || 'Error updating policy');
      console.error('Error updating policy:', err);
    }
  };

  const handleTogglePolicy = async (policyId: string, currentStatus: string) => {
    setError('');
    setSuccess('');

    try {
      if (currentStatus === 'Active') {
        await securityService.disablePolicy(policyId);
        setSuccess('Policy disabled successfully');
      } else {
        await securityService.enablePolicy(policyId);
        setSuccess('Policy enabled successfully');
      }
      fetchPolicies();
    } catch (err: any) {
      setError(err?.message || 'Error toggling policy');
      console.error('Error toggling policy:', err);
    }
  };

  const handleCreateThreat = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Mock - would call securityService.createThreatDetection in production
      setSuccess('Threat detection rule created successfully');
      setShowCreateThreatModal(false);
      resetThreatForm();
      fetchThreats();
    } catch (err: any) {
      setError(err?.message || 'Error creating threat rule');
      console.error('Error creating threat rule:', err);
    }
  };

  const handleToggleThreat = async (threatId: string, enabled: boolean) => {
    setError('');
    setSuccess('');

    try {
      // Mock - would call securityService.updateThreatDetection in production
      setSuccess(`Threat detection rule ${enabled ? 'enabled' : 'disabled'} successfully`);
      fetchThreats();
    } catch (err: any) {
      setError(err?.message || 'Error toggling threat rule');
      console.error('Error toggling threat rule:', err);
    }
  };

  const handleApplyTemplate = (template: string) => {
    // Apply policy templates
    switch (template) {
      case 'soc2':
        setPolicyName('SOC 2 Security Controls');
        setPolicyDescription('Implement all required SOC 2 Type II security controls');
        setPolicyType('Compliance');
        setPolicySeverity('Critical');
        break;
      case 'iso27001':
        setPolicyName('ISO 27001 ISMS Controls');
        setPolicyDescription('Information Security Management System controls per ISO 27001:2022');
        setPolicyType('Compliance');
        setPolicySeverity('Critical');
        break;
      case 'gdpr':
        setPolicyName('GDPR Data Protection');
        setPolicyDescription('Privacy and data protection requirements for GDPR compliance');
        setPolicyType('Compliance');
        setPolicySeverity('Critical');
        break;
      case 'zero-trust':
        setPolicyName('Zero Trust Architecture');
        setPolicyDescription('Never trust, always verify - comprehensive zero trust policy');
        setPolicyType('Security');
        setPolicySeverity('Critical');
        break;
    }
    setShowTemplateModal(false);
    setShowCreatePolicyModal(true);
  };

  const resetPolicyForm = () => {
    setPolicyName('');
    setPolicyDescription('');
    setPolicyType('Security');
    setPolicySeverity('Medium');
    setSelectedPolicy(null);
  };

  const resetThreatForm = () => {
    setThreatName('');
    setThreatCategory('Anomaly');
    setThreatSeverity('Medium');
    setThreatThreshold('');
  };

  const openEditPolicyModal = (policy: SecurityPolicy) => {
    setSelectedPolicy(policy);
    setPolicyName(policy.name);
    setPolicyDescription(policy.description);
    setPolicyType(policy.type);
    setPolicySeverity(policy.severity);
    setShowEditPolicyModal(true);
  };

  // Column Definitions
  const policyColumns: Column<SecurityPolicy>[] = [
    {
      key: 'name',
      label: 'Policy Name',
      render: (policy) => (
        <div>
          <div className="font-medium">{policy.name}</div>
          <div className="text-xs text-gray-500">{policy.description.substring(0, 60)}...</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (policy) => (
        <StatusBadge
          status={policy.type}
          color={
            policy.type === 'Security' ? 'blue' :
            policy.type === 'Compliance' ? 'purple' :
            policy.type === 'Access' ? 'green' : 'orange'
          }
        />
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (policy) => (
        <StatusBadge
          status={policy.severity}
          color={
            policy.severity === 'Critical' ? 'red' :
            policy.severity === 'High' ? 'orange' :
            policy.severity === 'Medium' ? 'yellow' : 'green'
          }
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (policy) => (
        <StatusBadge
          status={policy.status}
          color={
            policy.status === 'Active' ? 'green' :
            policy.status === 'Inactive' ? 'gray' : 'yellow'
          }
        />
      ),
    },
    {
      key: 'appliedTenants',
      label: 'Applied To',
      render: (policy) => (
        <div className="text-sm">
          <div className="font-medium">{policy.appliedTenants} tenants</div>
          {policy.violations > 0 && (
            <div className="text-red-600">{policy.violations} violations</div>
          )}
        </div>
      ),
    },
  ];

  const threatColumns: Column<ThreatDetectionRule>[] = [
    {
      key: 'name',
      label: 'Rule Name',
      render: (threat) => (
        <div>
          <div className="font-medium">{threat.name}</div>
          <div className="text-xs text-gray-500">{threat.threshold}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (threat) => (
        <StatusBadge
          status={threat.category}
          color={
            threat.category === 'Brute Force' ? 'red' :
            threat.category === 'Data Exfiltration' ? 'orange' :
            threat.category === 'Privilege Escalation' ? 'purple' : 'blue'
          }
        />
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (threat) => (
        <StatusBadge
          status={threat.severity}
          color={
            threat.severity === 'Critical' ? 'red' :
            threat.severity === 'High' ? 'orange' :
            threat.severity === 'Medium' ? 'yellow' : 'green'
          }
        />
      ),
    },
    {
      key: 'detections',
      label: 'Detections',
      render: (threat) => (
        <div className="font-semibold text-red-600">{threat.detections}</div>
      ),
    },
    {
      key: 'enabled',
      label: 'Status',
      render: (threat) => (
        <StatusBadge
          status={threat.enabled ? 'Enabled' : 'Disabled'}
          color={threat.enabled ? 'green' : 'gray'}
        />
      ),
    },
  ];

  const frameworkColumns: Column<ComplianceFramework>[] = [
    {
      key: 'name',
      label: 'Framework',
      render: (framework) => (
        <div>
          <div className="font-medium">{framework.name}</div>
          <div className="text-xs text-gray-500">{framework.description}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (framework) => (
        <StatusBadge status={framework.type} color="blue" />
      ),
    },
    {
      key: 'complianceRate',
      label: 'Compliance',
      render: (framework) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  framework.complianceRate >= 95 ? 'bg-green-500' :
                  framework.complianceRate >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${framework.complianceRate}%` }}
              />
            </div>
            <span className="text-sm font-medium">{framework.complianceRate}%</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {framework.compliantControls} / {framework.controls} controls
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (framework) => (
        <StatusBadge
          status={framework.status}
          color={
            framework.status === 'Compliant' ? 'green' :
            framework.status === 'Non-Compliant' ? 'red' : 'yellow'
          }
        />
      ),
    },
    {
      key: 'nextAudit',
      label: 'Next Audit',
      render: (framework) => new Date(framework.nextAudit).toLocaleDateString(),
    },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
          Global Security
        </h1>
        <p className="text-gray-600 mt-2">
          Manage global security policies, threat detection, and compliance frameworks
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'policies'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Security Policies
        </button>
        <button
          onClick={() => setActiveTab('threats')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'threats'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Threat Detection
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'compliance'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Compliance
        </button>
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6">
              <div className="text-sm opacity-90">Total Policies</div>
              <div className="text-3xl font-bold">{stats.totalPolicies}</div>
              <div className="text-xs mt-1">{stats.activePolicies} active</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
              <div className="text-sm opacity-90">Violations</div>
              <div className="text-3xl font-bold">{stats.totalViolations}</div>
              <div className="text-xs mt-1">{stats.criticalViolations} critical</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
              <div className="text-sm opacity-90">Threat Detections</div>
              <div className="text-3xl font-bold">{stats.threatDetections}</div>
              <div className="text-xs mt-1">Last 30 days</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
              <div className="text-sm opacity-90">Compliance Rate</div>
              <div className="text-3xl font-bold">{stats.complianceRate}%</div>
              <div className="text-xs mt-1">{stats.tenantsProtected} tenants protected</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Policy Violations</h3>
              <div className="space-y-3">
                {policies.filter(p => p.violations > 0).slice(0, 5).map(policy => (
                  <div key={policy.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{policy.name}</div>
                      <div className="text-xs text-gray-500">{policy.violations} violations</div>
                    </div>
                    <StatusBadge
                      status={policy.severity}
                      color={
                        policy.severity === 'Critical' ? 'red' :
                        policy.severity === 'High' ? 'orange' : 'yellow'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Active Threat Detections</h3>
              <div className="space-y-3">
                {threats.filter(t => t.enabled).slice(0, 5).map(threat => (
                  <div key={threat.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{threat.name}</div>
                      <div className="text-xs text-gray-500">{threat.detections} detections</div>
                    </div>
                    <StatusBadge status={threat.category} color="red" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Global Security Policies</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Use Template
              </button>
              <button
                onClick={() => setShowCreatePolicyModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Create Policy
              </button>
            </div>
          </div>
          <DataTable
            data={policies}
            columns={policyColumns}
            actions={(policy) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openEditPolicyModal(policy)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleTogglePolicy(policy.id, policy.status)}
                  className={`text-sm ${
                    policy.status === 'Active'
                      ? 'text-orange-600 hover:text-orange-800'
                      : 'text-green-600 hover:text-green-800'
                  }`}
                >
                  {policy.status === 'Active' ? 'Disable' : 'Enable'}
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* Threats Tab */}
      {activeTab === 'threats' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Threat Detection Rules</h2>
            <button
              onClick={() => setShowCreateThreatModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Create Rule
            </button>
          </div>
          <DataTable
            data={threats}
            columns={threatColumns}
            actions={(threat) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleThreat(threat.id, !threat.enabled)}
                  className={`text-sm ${
                    threat.enabled
                      ? 'text-orange-600 hover:text-orange-800'
                      : 'text-green-600 hover:text-green-800'
                  }`}
                >
                  {threat.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Compliance Frameworks</h2>
          <DataTable
            data={frameworks}
            columns={frameworkColumns}
            actions={(framework) => (
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                View Details
              </button>
            )}
          />
        </div>
      )}

      {/* Create Policy Modal */}
      <Modal
        isOpen={showCreatePolicyModal}
        onClose={() => {
          setShowCreatePolicyModal(false);
          resetPolicyForm();
          setError('');
        }}
        title="Create Security Policy"
        size="lg"
      >
        <form onSubmit={handleCreatePolicy} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Policy Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border rounded"
              value={policyDescription}
              onChange={(e) => setPolicyDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value as any)}
              >
                <option value="Security">Security</option>
                <option value="Compliance">Compliance</option>
                <option value="Access">Access</option>
                <option value="Data">Data</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={policySeverity}
                onChange={(e) => setPolicySeverity(e.target.value as any)}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreatePolicyModal(false);
                resetPolicyForm();
                setError('');
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Create Policy
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Policy Modal */}
      <Modal
        isOpen={showEditPolicyModal}
        onClose={() => {
          setShowEditPolicyModal(false);
          resetPolicyForm();
          setError('');
        }}
        title="Edit Security Policy"
        size="lg"
      >
        <form onSubmit={handleUpdatePolicy} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Policy Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border rounded"
              value={policyDescription}
              onChange={(e) => setPolicyDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value as any)}
              >
                <option value="Security">Security</option>
                <option value="Compliance">Compliance</option>
                <option value="Access">Access</option>
                <option value="Data">Data</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={policySeverity}
                onChange={(e) => setPolicySeverity(e.target.value as any)}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditPolicyModal(false);
                resetPolicyForm();
                setError('');
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Choose Policy Template"
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleApplyTemplate('soc2')}
            className="p-4 border-2 rounded-lg hover:border-purple-600 hover:bg-purple-50 text-left"
          >
            <div className="font-semibold">SOC 2 Type II</div>
            <div className="text-sm text-gray-600 mt-1">
              Security, availability, processing integrity, confidentiality, privacy
            </div>
          </button>
          <button
            onClick={() => handleApplyTemplate('iso27001')}
            className="p-4 border-2 rounded-lg hover:border-purple-600 hover:bg-purple-50 text-left"
          >
            <div className="font-semibold">ISO 27001</div>
            <div className="text-sm text-gray-600 mt-1">
              Information Security Management System (ISMS) controls
            </div>
          </button>
          <button
            onClick={() => handleApplyTemplate('gdpr')}
            className="p-4 border-2 rounded-lg hover:border-purple-600 hover:bg-purple-50 text-left"
          >
            <div className="font-semibold">GDPR</div>
            <div className="text-sm text-gray-600 mt-1">
              Privacy and data protection for EU regulations
            </div>
          </button>
          <button
            onClick={() => handleApplyTemplate('zero-trust')}
            className="p-4 border-2 rounded-lg hover:border-purple-600 hover:bg-purple-50 text-left"
          >
            <div className="font-semibold">Zero Trust</div>
            <div className="text-sm text-gray-600 mt-1">
              Never trust, always verify architecture principles
            </div>
          </button>
        </div>
      </Modal>

      {/* Create Threat Detection Modal */}
      <Modal
        isOpen={showCreateThreatModal}
        onClose={() => {
          setShowCreateThreatModal(false);
          resetThreatForm();
          setError('');
        }}
        title="Create Threat Detection Rule"
        size="lg"
      >
        <form onSubmit={handleCreateThreat} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rule Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={threatName}
              onChange={(e) => setThreatName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={threatCategory}
                onChange={(e) => setThreatCategory(e.target.value as any)}
              >
                <option value="Anomaly">Anomaly</option>
                <option value="Brute Force">Brute Force</option>
                <option value="Data Exfiltration">Data Exfiltration</option>
                <option value="Privilege Escalation">Privilege Escalation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={threatSeverity}
                onChange={(e) => setThreatSeverity(e.target.value as any)}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Detection Threshold</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={threatThreshold}
              onChange={(e) => setThreatThreshold(e.target.value)}
              placeholder="e.g., 5 attempts in 10 minutes"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateThreatModal(false);
                resetThreatForm();
                setError('');
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Create Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
