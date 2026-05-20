import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

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

export default function GlobalDiagnosticsPage() {
  const { t } = useTranslation();
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
      const data = await globalService.getDiagnostics();
      setHealth(data?.health ?? null);
      setTests(Array.isArray(data?.tests) ? data.tests : []);
    } catch (err) {
      console.error('Error fetching diagnostics data:', err);
      setHealth(null);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAll = async () => {
    setRunning(true);
    try {
      await globalService.runDiagnostics();
      setTimeout(() => {
        setRunning(false);
        fetchData();
      }, 3000);
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
      setRunning(false);
    }
  };

  const handleRunTest = async (testId: string) => {
    try {
      await globalService.runDiagnosticTest(testId);
      fetchData();
    } catch (error) {
      console.error('Failed to run diagnostic test:', error);
    }
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
    { id: 'all', name: t('diagnostics.allTests'), count: tests.length },
    { id: 'connectivity', name: t('diagnostics.connectivity'), count: tests.filter(t => t.category === 'connectivity').length },
    { id: 'performance', name: t('diagnostics.performance'), count: tests.filter(t => t.category === 'performance').length },
    { id: 'security', name: t('diagnostics.security'), count: tests.filter(t => t.category === 'security').length },
    { id: 'database', name: t('diagnostics.database'), count: tests.filter(t => t.category === 'database').length },
    { id: 'storage', name: t('diagnostics.storage'), count: tests.filter(t => t.category === 'storage').length },
    { id: 'services', name: t('diagnostics.services'), count: tests.filter(t => t.category === 'services').length },
  ];

  if (loading) return <div className="p-6">{t('common.loading')}...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('diagnostics.title')}</h1>
          <p className="text-gray-600 mt-1">{t('diagnostics.subtitle')}</p>
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
          {running ? t('diagnostics.running') : t('diagnostics.runAllTests')}
        </button>
      </div>

      {/* System Health Overview */}
      {health && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{t('diagnostics.overallSystemHealth')}</h2>
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
                    {t('diagnostics.response')}: {component.responseTime}ms
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
          <div className="text-sm text-green-600">{t('diagnostics.passed')}</div>
          <div className="text-2xl font-bold text-green-700">
            {tests.filter(t => t.status === 'passed').length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600">{t('diagnostics.warnings')}</div>
          <div className="text-2xl font-bold text-yellow-700">
            {tests.filter(t => t.status === 'warning').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600">{t('diagnostics.failed')}</div>
          <div className="text-2xl font-bold text-red-700">
            {tests.filter(t => t.status === 'failed').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">{t('diagnostics.avgDuration')}</div>
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
                {t('diagnostics.runTest')}
              </button>
            </div>

            {test.details && (
              <div className="mt-4 bg-gray-50 rounded p-4">
                <h4 className="text-sm font-semibold mb-2">{t('diagnostics.details')}</h4>
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
              {test.duration && <span>{t('diagnostics.duration')}: {(test.duration / 1000).toFixed(2)}s</span>}
              {test.lastRun && (
                <>
                  <span className="mx-2">•</span>
                  <span>{t('diagnostics.lastRun')}: {new Date(test.lastRun).toLocaleString()}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
