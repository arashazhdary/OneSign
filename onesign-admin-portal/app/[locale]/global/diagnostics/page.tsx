'use client';

import { useState, useEffect } from 'react';
import { platformService } from '@/lib/api/services';

interface DiagnosticTest {
  id: string;
  name: string;
  category: 'connectivity' | 'performance' | 'security' | 'database' | 'storage' | 'services';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  duration?: number;
  lastRun?: string;
  message?: string;
  details?: Record<string, any>;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number;
  components: {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    responseTime?: number;
  }[];
}

export default function DiagnosticsPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await platformService.getDiagnostics?.();
      const mockHealth: SystemHealth = {
        overall: 'healthy',
        score: 98,
        components: [
          { name: 'API Gateway', status: 'operational', responseTime: 45 },
          { name: 'Database Primary', status: 'operational', responseTime: 12 },
          { name: 'Database Replica', status: 'operational', responseTime: 15 },
          { name: 'Cache (Redis)', status: 'operational', responseTime: 2 },
          { name: 'Storage (S3)', status: 'operational', responseTime: 120 },
          { name: 'Queue Service', status: 'operational', responseTime: 8 },
          { name: 'Email Service', status: 'degraded', responseTime: 450 },
          { name: 'Search Service', status: 'operational', responseTime: 35 },
        ],
      };

      const mockTests: DiagnosticTest[] = [
        {
          id: '1',
          name: 'Database Connection',
          category: 'database',
          status: 'passed',
          duration: 234,
          lastRun: '2024-11-23T10:00:00Z',
          message: 'Successfully connected to all database instances',
          details: {
            primary: 'Connected (12ms)',
            replica1: 'Connected (15ms)',
            replica2: 'Connected (14ms)',
          },
        },
        {
          id: '2',
          name: 'API Response Time',
          category: 'performance',
          status: 'passed',
          duration: 1560,
          lastRun: '2024-11-23T10:00:00Z',
          message: 'All endpoints responding within acceptable limits',
          details: {
            p50: '45ms',
            p95: '120ms',
            p99: '245ms',
          },
        },
        {
          id: '3',
          name: 'External API Connectivity',
          category: 'connectivity',
          status: 'passed',
          duration: 3450,
          lastRun: '2024-11-23T10:00:00Z',
          message: 'All external APIs reachable',
          details: {
            stripe: 'Connected',
            sendgrid: 'Connected',
            twilio: 'Connected',
          },
        },
        {
          id: '4',
          name: 'SSL Certificate Validity',
          category: 'security',
          status: 'passed',
          duration: 890,
          lastRun: '2024-11-23T10:00:00Z',
          message: 'All SSL certificates are valid',
          details: {
            'api.onesign.io': 'Valid until 2025-06-15',
            'admin.onesign.io': 'Valid until 2025-05-20',
          },
        },
        {
          id: '5',
          name: 'Storage Accessibility',
          category: 'storage',
          status: 'passed',
          duration: 456,
          lastRun: '2024-11-23T10:00:00Z',
          message: 'All storage buckets accessible',
          details: {
            primary: 'Accessible',
            backups: 'Accessible',
            logs: 'Accessible',
          },
        },
        {
          id: '6',
          name: 'Email Service',
          category: 'services',
          status: 'warning',
          duration: 5678,
          lastRun: '2024-11-23T10:00:00Z',
          message: 'Email service responding slowly',
          details: {
            status: 'Operational',
            avgResponseTime: '450ms',
            threshold: '200ms',
          },
        },
        {
          id: '7',
          name: 'Cache Performance',
          category: 'performance',
          status: 'passed',
          duration: 123,
          lastRun: '2024-11-23T10:00:00Z',
          message: 'Cache hit rate within target',
          details: {
            hitRate: '94.5%',
            avgLatency: '2ms',
          },
        },
        {
          id: '8',
          name: 'Database Query Performance',
          category: 'performance',
          status: 'passed',
          duration: 2340,
          lastRun: '2024-11-23T10:00:00Z',
          message: 'Query performance acceptable',
          details: {
            slowQueries: 12,
            avgQueryTime: '45ms',
          },
        },
        {
          id: '9',
          name: 'Security Scan',
          category: 'security',
          status: 'passed',
          duration: 8900,
          lastRun: '2024-11-23T09:00:00Z',
          message: 'No security vulnerabilities detected',
          details: {
            vulnerabilities: 0,
            lastScan: '2024-11-23T09:00:00Z',
          },
        },
        {
          id: '10',
          name: 'Backup Verification',
          category: 'storage',
          status: 'passed',
          duration: 12300,
          lastRun: '2024-11-23T02:00:00Z',
          message: 'Latest backup verified successfully',
          details: {
            lastBackup: '2024-11-23T02:00:00Z',
            size: '487.5 GB',
            integrity: 'Verified',
          },
        },
      ];
      setHealth(data?.health || mockHealth);
      setTests(data?.tests || mockTests);
    } catch (err) {
      console.error(err);
      setHealth(mockHealth);
      setTests(mockTests);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAll = async () => {
    setRunning(true);
    // await platformService.runDiagnostics();
    setTimeout(() => {
      setRunning(false);
      fetchData();
    }, 3000);
  };

  const handleRunTest = async (testId: string) => {
    // await platformService.runDiagnosticTest(testId);
    fetchData();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      running: 'bg-blue-100 text-blue-800',
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      connectivity: '🌐',
      performance: '⚡',
      security: '🔒',
      database: '🗄️',
      storage: '💾',
      services: '⚙️',
    };
    return icons[category as keyof typeof icons] || '📊';
  };

  const getHealthColor = (status: string) => {
    const colors = {
      healthy: 'text-green-600',
      degraded: 'text-yellow-600',
      critical: 'text-red-600',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getComponentStatus = (status: string) => {
    const colors = {
      operational: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      down: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  const filteredTests = activeCategory === 'all'
    ? tests
    : tests.filter(t => t.category === activeCategory);

  const categories = [
    { id: 'all', name: 'All Tests', count: tests.length },
    { id: 'connectivity', name: 'Connectivity', count: tests.filter(t => t.category === 'connectivity').length },
    { id: 'performance', name: 'Performance', count: tests.filter(t => t.category === 'performance').length },
    { id: 'security', name: 'Security', count: tests.filter(t => t.category === 'security').length },
    { id: 'database', name: 'Database', count: tests.filter(t => t.category === 'database').length },
    { id: 'storage', name: 'Storage', count: tests.filter(t => t.category === 'storage').length },
    { id: 'services', name: 'Services', count: tests.filter(t => t.category === 'services').length },
  ];

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Diagnostics</h1>
          <p className="text-gray-600 mt-1">Run diagnostic tests and health checks</p>
        </div>
        <button
          onClick={handleRunAll}
          disabled={running}
          className={`px-4 py-2 rounded-lg ${
            running
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {running ? 'Running...' : 'Run All Tests'}
        </button>
      </div>

      {/* System Health Overview */}
      {health && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Overall System Health</h2>
              <p className={`text-3xl font-bold ${getHealthColor(health.overall)} mt-2`}>
                {health.score}%
              </p>
              <p className="text-sm text-gray-600 mt-1 capitalize">{health.overall}</p>
            </div>
            <div className="text-6xl">
              {health.overall === 'healthy' ? '✅' : health.overall === 'degraded' ? '⚠️' : '🔴'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {health.components.map((component, idx) => (
              <div key={idx} className="border border-gray-200 rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{component.name}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getComponentStatus(component.status)}`}>
                    {component.status}
                  </span>
                </div>
                {component.responseTime && (
                  <div className="text-xs text-gray-500">
                    Response: {component.responseTime}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">Passed</div>
          <div className="text-2xl font-bold text-green-700">
            {tests.filter(t => t.status === 'passed').length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600">Warnings</div>
          <div className="text-2xl font-bold text-yellow-700">
            {tests.filter(t => t.status === 'warning').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600">Failed</div>
          <div className="text-2xl font-bold text-red-700">
            {tests.filter(t => t.status === 'failed').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">Avg Duration</div>
          <div className="text-2xl font-bold text-blue-700">
            {(tests.reduce((acc, t) => acc + (t.duration || 0), 0) / tests.length / 1000).toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeCategory === category.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Diagnostic Tests */}
      <div className="space-y-4">
        {filteredTests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-2xl">{getCategoryIcon(test.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold">{test.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{test.message}</p>
                </div>
              </div>
              <button
                onClick={() => handleRunTest(test.id)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Run Test
              </button>
            </div>

            {test.details && (
              <div className="mt-4 bg-gray-50 rounded p-4">
                <h4 className="text-sm font-semibold mb-2">Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {Object.entries(test.details).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-500">{key}:</span>
                      <span className="ml-2 font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center text-xs text-gray-500">
              {test.duration && <span>Duration: {(test.duration / 1000).toFixed(2)}s</span>}
              {test.lastRun && (
                <>
                  <span className="mx-2">•</span>
                  <span>Last run: {new Date(test.lastRun).toLocaleString()}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
