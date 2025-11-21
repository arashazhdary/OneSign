'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface ComplianceScore {
  framework: string;
  score: number;
  lastAudit: string;
  status: 'compliant' | 'warning' | 'non-compliant';
}

interface PredefinedReport {
  id: string;
  name: string;
  framework: string;
  description: string;
  lastGenerated: string | null;
  status: 'available' | 'generating' | 'scheduled';
}

interface ReportHistory {
  id: string;
  name: string;
  framework: string;
  generatedDate: string;
  generatedBy: string;
  format: 'PDF' | 'Excel' | 'JSON';
  size: string;
}

interface CustomReportBuilder {
  name: string;
  framework: string;
  dateRange: { start: string; end: string };
  sections: string[];
  format: 'PDF' | 'Excel' | 'JSON';
}

interface ScheduledReport {
  id: string;
  name: string;
  framework: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  nextRun: string;
  recipients: string[];
}

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function ComplianceReportsPage() {
  const t = useTranslations();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predefined' | 'custom' | 'scheduled' | 'history'>('dashboard');

  const [complianceScores, setComplianceScores] = useState<ComplianceScore[]>([]);
  const [predefinedReports, setPredefinedReports] = useState<PredefinedReport[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  const [customReport, setCustomReport] = useState<CustomReportBuilder>({
    name: '',
    framework: 'GDPR',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    sections: [],
    format: 'PDF'
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    reportId: '',
    frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly',
    recipients: ''
  });

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchComplianceData();
    }
  }, [tenantId]);

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      // Initialize compliance scores
      initializeComplianceScores();

      // Initialize predefined reports
      initializePredefinedReports();

      // Initialize report history
      initializeReportHistory();

      // Initialize scheduled reports
      initializeScheduledReports();

    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeComplianceScores = () => {
    const scores: ComplianceScore[] = [
      {
        framework: 'GDPR',
        score: 92,
        lastAudit: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'compliant'
      },
      {
        framework: 'SOC2',
        score: 88,
        lastAudit: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'compliant'
      },
      {
        framework: 'ISO27001',
        score: 85,
        lastAudit: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'compliant'
      },
      {
        framework: 'HIPAA',
        score: 78,
        lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'warning'
      },
      {
        framework: 'PCI DSS',
        score: 95,
        lastAudit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'compliant'
      }
    ];

    setComplianceScores(scores);
  };

  const initializePredefinedReports = () => {
    const reports: PredefinedReport[] = [
      {
        id: '1',
        name: 'GDPR Compliance Report',
        framework: 'GDPR',
        description: 'Comprehensive report on GDPR compliance including data processing, consent management, and user rights',
        lastGenerated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'available'
      },
      {
        id: '2',
        name: 'SOC2 Type II Report',
        framework: 'SOC2',
        description: 'Security, availability, processing integrity, confidentiality, and privacy controls audit',
        lastGenerated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'available'
      },
      {
        id: '3',
        name: 'ISO27001 Certification Report',
        framework: 'ISO27001',
        description: 'Information security management system compliance and certification status',
        lastGenerated: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'available'
      },
      {
        id: '4',
        name: 'HIPAA Security Rule Compliance',
        framework: 'HIPAA',
        description: 'Protected Health Information (PHI) security and privacy compliance assessment',
        lastGenerated: null,
        status: 'available'
      }
    ];

    setPredefinedReports(reports);
  };

  const initializeReportHistory = () => {
    const history: ReportHistory[] = [
      {
        id: '1',
        name: 'GDPR Compliance Report',
        framework: 'GDPR',
        generatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        generatedBy: 'admin@example.com',
        format: 'PDF',
        size: '2.4 MB'
      },
      {
        id: '2',
        name: 'SOC2 Type II Report',
        framework: 'SOC2',
        generatedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        generatedBy: 'compliance@example.com',
        format: 'Excel',
        size: '1.8 MB'
      },
      {
        id: '3',
        name: 'Custom Security Audit',
        framework: 'Custom',
        generatedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        generatedBy: 'security@example.com',
        format: 'PDF',
        size: '3.1 MB'
      },
      {
        id: '4',
        name: 'ISO27001 Certification Report',
        framework: 'ISO27001',
        generatedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        generatedBy: 'admin@example.com',
        format: 'PDF',
        size: '4.2 MB'
      }
    ];

    setReportHistory(history);
  };

  const initializeScheduledReports = () => {
    const scheduled: ScheduledReport[] = [
      {
        id: '1',
        name: 'Weekly Security Report',
        framework: 'Custom',
        frequency: 'weekly',
        nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        recipients: ['security@example.com', 'admin@example.com']
      },
      {
        id: '2',
        name: 'Monthly GDPR Report',
        framework: 'GDPR',
        frequency: 'monthly',
        nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        recipients: ['compliance@example.com']
      },
      {
        id: '3',
        name: 'Quarterly SOC2 Report',
        framework: 'SOC2',
        frequency: 'quarterly',
        nextRun: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        recipients: ['audit@example.com', 'compliance@example.com']
      }
    ];

    setScheduledReports(scheduled);
  };

  const generateReport = async (reportId: string, format: 'PDF' | 'Excel' | 'JSON') => {
    const report = predefinedReports.find(r => r.id === reportId);
    if (!report) return;

    alert(`Generating ${report.name} in ${format} format...`);

    // Simulate report generation
    const data = {
      report: report.name,
      framework: report.framework,
      generatedDate: new Date().toISOString(),
      tenantId,
      format
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCustomReport = () => {
    if (!customReport.name) {
      alert('Please enter a report name');
      return;
    }

    const data = {
      ...customReport,
      generatedDate: new Date().toISOString(),
      tenantId
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customReport.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${customReport.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Custom report "${customReport.name}" generated successfully!`);
  };

  const scheduleReport = () => {
    if (!newSchedule.reportId || !newSchedule.recipients) {
      alert('Please fill in all fields');
      return;
    }

    const report = predefinedReports.find(r => r.id === newSchedule.reportId);
    if (!report) return;

    const nextRun = new Date();
    if (newSchedule.frequency === 'weekly') {
      nextRun.setDate(nextRun.getDate() + 7);
    } else if (newSchedule.frequency === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1);
    } else {
      nextRun.setMonth(nextRun.getMonth() + 3);
    }

    const scheduled: ScheduledReport = {
      id: String(scheduledReports.length + 1),
      name: report.name,
      framework: report.framework,
      frequency: newSchedule.frequency,
      nextRun: nextRun.toISOString(),
      recipients: newSchedule.recipients.split(',').map(e => e.trim())
    };

    setScheduledReports([...scheduledReports, scheduled]);
    setShowScheduleModal(false);
    setNewSchedule({ reportId: '', frequency: 'monthly', recipients: '' });
    alert('Report scheduled successfully!');
  };

  const downloadHistoryReport = (report: ReportHistory) => {
    alert(`Downloading ${report.name}...`);
  };

  if (loading) {
    return <div className="p-8">Loading compliance reports...</div>;
  }

  const availableSections = [
    'Access Controls',
    'Data Processing Activities',
    'User Consent Records',
    'Data Breach Incidents',
    'Audit Logs',
    'Policy Compliance',
    'Risk Assessments',
    'Third-Party Integrations'
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Compliance Reports</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'predefined', label: 'Pre-defined Reports' },
            { key: 'custom', label: 'Custom Report Builder' },
            { key: 'scheduled', label: 'Scheduled Reports' },
            { key: 'history', label: 'Report History' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Compliance Scores */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Compliance Score Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {complianceScores.map(score => (
                <div key={score.framework} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{score.framework}</h4>
                    <span className={`w-3 h-3 rounded-full ${
                      score.status === 'compliant' ? 'bg-green-500' :
                      score.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></span>
                  </div>
                  <p className="text-3xl font-bold text-indigo-600 mb-1">{score.score}%</p>
                  <p className="text-xs text-gray-500">
                    Last audit: {new Date(score.lastAudit).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Compliance Scores by Framework</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complianceScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="framework" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" name="Compliance Score (%)">
                    {complianceScores.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 90 ? '#22c55e' : entry.score >= 75 ? '#eab308' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Compliance Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={complianceScores}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="framework" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Pre-defined Reports Tab */}
      {activeTab === 'predefined' && (
        <div className="space-y-4">
          {predefinedReports.map(report => (
            <div key={report.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{report.name}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                      {report.framework}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{report.description}</p>
                  {report.lastGenerated && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last generated: {new Date(report.lastGenerated).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateReport(report.id, 'PDF')}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={() => generateReport(report.id, 'Excel')}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Export Excel
                  </button>
                  <button
                    onClick={() => {
                      setNewSchedule({ ...newSchedule, reportId: report.id });
                      setShowScheduleModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Report Builder Tab */}
      {activeTab === 'custom' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-6">Build Custom Compliance Report</h3>

          <div className="space-y-6">
            {/* Report Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
              <input
                type="text"
                value={customReport.name}
                onChange={(e) => setCustomReport({ ...customReport, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter report name"
              />
            </div>

            {/* Framework Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Framework</label>
              <select
                value={customReport.framework}
                onChange={(e) => setCustomReport({ ...customReport, framework: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="GDPR">GDPR</option>
                <option value="SOC2">SOC2</option>
                <option value="ISO27001">ISO27001</option>
                <option value="HIPAA">HIPAA</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={customReport.dateRange.start}
                  onChange={(e) => setCustomReport({
                    ...customReport,
                    dateRange: { ...customReport.dateRange, start: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={customReport.dateRange.end}
                  onChange={(e) => setCustomReport({
                    ...customReport,
                    dateRange: { ...customReport.dateRange, end: e.target.value }
                  })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Sections */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Sections</label>
              <div className="grid grid-cols-2 gap-3">
                {availableSections.map(section => (
                  <label key={section} className="flex items-center space-x-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={customReport.sections.includes(section)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCustomReport({
                            ...customReport,
                            sections: [...customReport.sections, section]
                          });
                        } else {
                          setCustomReport({
                            ...customReport,
                            sections: customReport.sections.filter(s => s !== section)
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{section}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="flex gap-4">
                {['PDF', 'Excel', 'JSON'].map(format => (
                  <label key={format} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="format"
                      value={format}
                      checked={customReport.format === format}
                      onChange={(e) => setCustomReport({ ...customReport, format: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{format}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCustomReport}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Generate Custom Report
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + Schedule New Report
          </button>

          {scheduledReports.map(report => (
            <div key={report.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{report.name}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                      {report.framework}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {report.frequency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Next run: {new Date(report.nextRun).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Recipients: {report.recipients.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this scheduled report?')) {
                      setScheduledReports(scheduledReports.filter(r => r.id !== report.id));
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Framework</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportHistory.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                      {report.framework}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.generatedDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.generatedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.format === 'PDF' ? 'bg-red-100 text-red-800' :
                      report.format === 'Excel' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.format}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => downloadHistoryReport(report)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Schedule Report</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Report</label>
                <select
                  value={newSchedule.reportId}
                  onChange={(e) => setNewSchedule({ ...newSchedule, reportId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Choose a report...</option>
                  {predefinedReports.map(report => (
                    <option key={report.id} value={report.id}>{report.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={newSchedule.frequency}
                  onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as any })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients (comma-separated emails)</label>
                <input
                  type="text"
                  value={newSchedule.recipients}
                  onChange={(e) => setNewSchedule({ ...newSchedule, recipients: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={scheduleReport}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Schedule
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
