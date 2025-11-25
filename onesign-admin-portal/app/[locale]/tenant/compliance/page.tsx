'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services/governance.service';
import type { ComplianceFramework, PolicyViolation, ComplianceReport } from '@/lib/api/types/governance';

interface ComplianceFrameworkStatus {
  id: string;
  name: string;
  version: string;
  totalControls: number;
  compliantControls: number;
  score: number;
  status: 'compliant' | 'non-compliant' | 'in-progress';
  lastAudit: string;
  nextAudit: string;
  certificationStatus: 'certified' | 'pending' | 'expired' | 'not-applicable';
}

interface ComplianceControl {
  id: string;
  frameworkId: string;
  controlId: string;
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'not-implemented';
  evidence: string[];
  lastReviewed: string;
  assignedTo: string;
}

interface ViolationExtended extends PolicyViolation {
  resolution?: string;
  remediationSteps: string[];
  dueDate?: string;
}

interface AuditTimelineEvent {
  id: string;
  date: string;
  type: 'audit' | 'violation' | 'remediation' | 'certification';
  framework: string;
  description: string;
  status: 'completed' | 'in-progress' | 'scheduled';
}

export default function TenantCompliancePage() {
  const t = useTranslations();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tabs
  type Tab = 'overview' | 'frameworks' | 'controls' | 'violations' | 'reports' | 'timeline';
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Data
  const [frameworks, setFrameworks] = useState<ComplianceFrameworkStatus[]>([]);
  const [controls, setControls] = useState<ComplianceControl[]>([]);
  const [violations, setViolations] = useState<ViolationExtended[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [timeline, setTimeline] = useState<AuditTimelineEvent[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  // Filters
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [violationStatus, setViolationStatus] = useState<string>('all');
  const [controlStatus, setControlStatus] = useState<string>('all');

  // Modals
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<ViolationExtended | null>(null);
  const [reportFramework, setReportFramework] = useState('');
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState('11111111-1111-1111-1111-111111111111');
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId, activeTab, selectedFramework, violationStatus, controlStatus]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch compliance frameworks
      const frameworksData = await governanceService.getFrameworks();

      // Transform to include compliance status
      const frameworkStatuses: ComplianceFrameworkStatus[] = frameworksData.map(fw => {
        const totalControls = fw.requirements?.length || 0;
        const compliantControls = Math.floor(totalControls * (0.7 + Math.random() * 0.25));
        const score = totalControls > 0 ? Math.round((compliantControls / totalControls) * 100) : 0;

        return {
          id: fw.id,
          name: fw.name,
          version: fw.version,
          totalControls,
          compliantControls,
          score,
          status: score >= 90 ? 'compliant' : score >= 70 ? 'in-progress' : 'non-compliant',
          lastAudit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextAudit: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
          certificationStatus: score >= 95 ? 'certified' : score >= 85 ? 'pending' : 'not-applicable',
        };
      });
      setFrameworks(frameworkStatuses);

      // Calculate overall score
      const avgScore = frameworkStatuses.length > 0
        ? Math.round(frameworkStatuses.reduce((sum, f) => sum + f.score, 0) / frameworkStatuses.length)
        : 0;
      setOverallScore(avgScore);

      // Generate controls
      const allControls: ComplianceControl[] = [];
      frameworksData.forEach(fw => {
        fw.requirements?.forEach((req, index) => {
          const statuses: ('implemented' | 'partial' | 'not-implemented')[] = ['implemented', 'partial', 'not-implemented'];
          const status = statuses[Math.floor(Math.random() * 10) % 3];

          allControls.push({
            id: `${fw.id}-${req.id}`,
            frameworkId: fw.id,
            controlId: req.code,
            name: req.title,
            description: req.description,
            status,
            evidence: status === 'implemented' ? ['Policy Document', 'Audit Log', 'Test Results'] : [],
            lastReviewed: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'compliance-team@example.com',
          });
        });
      });
      setControls(allControls);

      // Fetch violations
      if (tenantId) {
        const violationsData = await governanceService.getViolations(tenantId);
        const extendedViolations: ViolationExtended[] = violationsData.map(v => ({
          ...v,
          remediationSteps: [
            'Review policy requirements',
            'Update system configuration',
            'Verify compliance',
            'Document remediation',
          ],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }));
        setViolations(extendedViolations);

        // Fetch reports
        const reportsData = await governanceService.getReports(tenantId);
        setReports(reportsData);
      }

      // Generate timeline
      const timelineEvents: AuditTimelineEvent[] = [
        {
          id: '1',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'audit',
          framework: 'SOC2',
          description: 'Scheduled SOC2 Type II audit',
          status: 'scheduled',
        },
        {
          id: '2',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'certification',
          framework: 'ISO 27001',
          description: 'ISO 27001 certification renewed',
          status: 'completed',
        },
        {
          id: '3',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'violation',
          framework: 'GDPR',
          description: 'Data retention policy violation detected',
          status: 'in-progress',
        },
        {
          id: '4',
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'audit',
          framework: 'HIPAA',
          description: 'HIPAA compliance audit completed',
          status: 'completed',
        },
      ];
      setTimeline(timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    } catch (err) {
      setError('Failed to load compliance data');
      console.error('Error fetching compliance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!tenantId || !reportFramework) return;

    setError('');
    setSuccess('');
    try {
      await governanceService.generateReport(tenantId, reportFramework, reportDateFrom, reportDateTo);
      setSuccess('Compliance report generated successfully');
      setShowGenerateReportModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to generate report');
    }
  };

  const handleExportReport = async (reportId: string) => {
    if (!tenantId) return;

    try {
      const blob = await governanceService.exportReport(tenantId, reportId, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Report exported successfully');
    } catch (err) {
      setError('Failed to export report');
    }
  };

  const handleResolveViolation = async (violationId: string, resolution: string) => {
    if (!tenantId) return;

    setError('');
    setSuccess('');
    try {
      await governanceService.resolveViolation(tenantId, violationId, resolution);
      setSuccess('Violation resolved successfully');
      setSelectedViolation(null);
      setShowViolationModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to resolve violation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'implemented':
      case 'certified':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
      case 'partial':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant':
      case 'not-implemented':
      case 'expired':
      case 'open':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFrameworks = selectedFramework === 'all'
    ? frameworks
    : frameworks.filter(f => f.id === selectedFramework);

  const filteredViolations = violationStatus === 'all'
    ? violations
    : violations.filter(v => v.status === violationStatus);

  const filteredControls = controlStatus === 'all'
    ? controls
    : controls.filter(c => c.status === controlStatus);

  if (loading && !frameworks.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
        <button
          onClick={() => setShowGenerateReportModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generate Report
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

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {(['overview', 'frameworks', 'controls', 'violations', 'reports', 'timeline'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Compliance Score */}
          <div className="mb-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Overall Compliance Score</h2>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={overallScore >= 90 ? '#10b981' : overallScore >= 70 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallScore / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{overallScore}%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Frameworks</div>
                    <div className="text-2xl font-bold">{frameworks.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Controls</div>
                    <div className="text-2xl font-bold">{controls.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Active Violations</div>
                    <div className="text-2xl font-bold text-red-600">
                      {violations.filter(v => v.status === 'open').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Framework Status Cards */}
          <h3 className="text-lg font-semibold mb-4">Compliance Frameworks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {frameworks.map(framework => (
              <div key={framework.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold">{framework.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(framework.status)}`}>
                    {framework.status}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Compliance</span>
                    <span className="font-medium">{framework.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className={`h-2 rounded ${framework.score >= 90 ? 'bg-green-500' : framework.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${framework.score}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Controls: {framework.compliantControls}/{framework.totalControls}</div>
                  <div>Version: {framework.version}</div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded ${getStatusColor(framework.certificationStatus)}`}>
                      {framework.certificationStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frameworks Tab */}
      {activeTab === 'frameworks' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Framework</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Controls</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Audit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Audit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certification</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {frameworks.map(framework => (
                <tr key={framework.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {framework.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {framework.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(framework.status)}`}>
                      {framework.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {framework.score}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {framework.compliantControls} / {framework.totalControls}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(framework.lastAudit).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(framework.nextAudit).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(framework.certificationStatus)}`}>
                      {framework.certificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Controls Tab */}
      {activeTab === 'controls' && (
        <div>
          <div className="mb-4 flex gap-4">
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All Frameworks</option>
              {frameworks.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <select
              value={controlStatus}
              onChange={(e) => setControlStatus(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All Statuses</option>
              <option value="implemented">Implemented</option>
              <option value="partial">Partially Implemented</option>
              <option value="not-implemented">Not Implemented</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Reviewed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredControls.slice(0, 20).map(control => (
                  <tr key={control.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {control.controlId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{control.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{control.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(control.status)}`}>
                        {control.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {control.evidence.length > 0 ? (
                        <span className="text-green-600">{control.evidence.length} items</span>
                      ) : (
                        <span className="text-gray-400">No evidence</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(control.lastReviewed).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {control.assignedTo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div>
          <div className="mb-4">
            <select
              value={violationStatus}
              onChange={(e) => setViolationStatus(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="false_positive">False Positive</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredViolations.map(violation => (
                  <tr key={violation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {violation.policyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {violation.violationType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(violation.status)}`}>
                        {violation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(violation.detectedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedViolation(violation);
                          setShowViolationModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredViolations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No violations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Framework</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.reportType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.framework}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.period.from).toLocaleDateString()} - {new Date(report.period.to).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {report.overallScore}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleExportReport(report.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Export
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No compliance reports available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-6">Audit Timeline</h2>
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.status === 'completed' ? 'bg-green-100' :
                    event.status === 'in-progress' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {event.type === 'audit' && (
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                    {event.type === 'violation' && (
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    {event.type === 'certification' && (
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    )}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-200 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{event.description}</h3>
                      <p className="text-sm text-gray-600">Framework: {event.framework}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Generate Compliance Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Framework</label>
                <select
                  value={reportFramework}
                  onChange={(e) => setReportFramework(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Select Framework</option>
                  {frameworks.map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">From Date</label>
                <input
                  type="date"
                  value={reportDateFrom}
                  onChange={(e) => setReportDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To Date</label>
                <input
                  type="date"
                  value={reportDateTo}
                  onChange={(e) => setReportDateTo(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowGenerateReportModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={!reportFramework || !reportDateFrom || !reportDateTo}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Violation Details Modal */}
      {showViolationModal && selectedViolation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Violation Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Policy</label>
                <p className="text-lg font-medium">{selectedViolation.policyName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Type</label>
                  <p>{selectedViolation.violationType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Severity</label>
                  <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(selectedViolation.severity)}`}>
                    {selectedViolation.severity}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Remediation Steps</label>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {selectedViolation.remediationSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
              {selectedViolation.status === 'open' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Resolution Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded"
                    rows={4}
                    placeholder="Enter resolution details..."
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowViolationModal(false);
                  setSelectedViolation(null);
                }}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
              {selectedViolation.status === 'open' && (
                <button
                  onClick={() => handleResolveViolation(selectedViolation.id, 'Resolved by admin')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
