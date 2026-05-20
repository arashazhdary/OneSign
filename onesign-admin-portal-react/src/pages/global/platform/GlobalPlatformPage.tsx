import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

interface PlatformVersion {
  version: string;
  buildNumber: string;
  releaseDate: string;
  environment: string;
}

interface Migration {
  id: string;
  name: string;
  version: string;
  appliedAt: string;
  executionTime: number;
  status: 'Applied' | 'Failed' | 'Pending';
}

interface TestResult {
  id: string;
  testName: string;
  category: string;
  status: 'Passed' | 'Failed' | 'Pending' | 'Skipped';
  duration: number;
  message?: string;
  lastRunAt: string;
}

interface SystemHealth {
  service: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  latency: number;
  lastChecked: string;
  details?: string;
}

interface DiagnosticInfo {
  category: string;
  key: string;
  value: string;
  description?: string;
}

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, any>;
}

type Tab = 'version' | 'health' | 'migrations' | 'diagnostics' | 'tests' | 'docs';

function mapMigrationRow(m: {
  id: string;
  migrationName: string;
  appliedAt: string;
  durationMs: number;
  status: string;
}): Migration {
  return {
    id: m.id,
    name: m.migrationName,
    version: m.migrationName,
    appliedAt: m.appliedAt,
    executionTime: m.durationMs,
    status: (m.status === 'Applied' || m.status === 'Completed' ? 'Applied' : m.status) as Migration['status'],
  };
}

function mapTestRow(t: {
  id: string;
  testName: string;
  category?: string | null;
  status: string;
  durationMs?: number | null;
  startedAt: string;
  errorMessage?: string | null;
}): TestResult {
  return {
    id: t.id,
    testName: t.testName,
    category: t.category ?? 'General',
    status: t.status as TestResult['status'],
    duration: t.durationMs ?? 0,
    message: t.errorMessage ?? undefined,
    lastRunAt: t.startedAt,
  };
}

function mapDiagnosticsDto(dto: Record<string, any>): DiagnosticInfo[] {
  const rows: DiagnosticInfo[] = [];
  const sys = dto.systemInfo;
  if (sys) {
    rows.push(
      { category: 'System', key: 'Environment', value: sys.environment ?? '—' },
      { category: 'System', key: 'Machine', value: sys.machineName ?? '—' },
      { category: 'System', key: 'OS', value: sys.osVersion ?? '—' },
      { category: 'System', key: 'Processors', value: String(sys.processorCount ?? '—') },
      { category: 'System', key: 'Uptime', value: sys.uptime ?? '—' },
    );
  }
  if (dto.memory) {
    rows.push(
      { category: 'Memory', key: 'Used (MB)', value: String(dto.memory.usedMB ?? '—') },
      { category: 'Memory', key: 'Usage %', value: `${dto.memory.usagePercent ?? 0}%` },
    );
  }
  if (dto.cpu) {
    rows.push({ category: 'CPU', key: 'Usage %', value: `${dto.cpu.usagePercent ?? 0}%` });
  }
  rows.push(
    { category: 'Traffic', key: 'Active connections', value: String(dto.activeConnections ?? 0) },
    { category: 'Traffic', key: 'Requests/sec', value: String(dto.requestsPerSecond ?? 0) },
    { category: 'Traffic', key: 'Avg response (ms)', value: String(dto.averageResponseTimeMs ?? 0) },
    { category: 'Traffic', key: 'Errors (last hour)', value: String(dto.errorsLastHour ?? 0) },
  );
  (dto.modules ?? []).forEach((m: { name: string; status: string; entitiesCount: number }) => {
    rows.push({
      category: 'Modules',
      key: m.name,
      value: m.status,
      description: `${m.entitiesCount} entities`,
    });
  });
  (dto.connections ?? []).forEach((c: { name: string; status: string; latencyMs: number; type: string }) => {
    rows.push({
      category: 'Connections',
      key: c.name,
      value: `${c.status} (${c.latencyMs}ms)`,
      description: c.type,
    });
  });
  return rows;
}

function mapOpenApiForUi(spec: Record<string, any> | null): OpenAPISpec | null {
  if (!spec) return null;
  if (spec.info?.title) return spec as OpenAPISpec;
  let paths: Record<string, unknown> = {};
  if (spec.specificationJson) {
    try {
      const parsed = JSON.parse(spec.specificationJson);
      paths = parsed.paths ?? {};
    } catch {
      paths = {};
    }
  }
  return {
    openapi: spec.version ?? '3.0.3',
    info: {
      title: spec.title ?? 'OneSign API',
      version: spec.version ?? '1.0',
      description: spec.description ?? '',
    },
    paths: paths as Record<string, unknown>,
  };
}

export default function GlobalPlatformPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('version');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [platformVersion, setPlatformVersion] = useState<PlatformVersion | null>(null);
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [totalMigrations, setTotalMigrations] = useState(0);
  const [migrationPage, setMigrationPage] = useState(1);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [totalTests, setTotalTests] = useState(0);
  const [testPage, setTestPage] = useState(1);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo[]>([]);
  const [openApiSpec, setOpenApiSpec] = useState<OpenAPISpec | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [singleTestResult, setSingleTestResult] = useState<TestResult | null>(null);
  const [applyingMigration, setApplyingMigration] = useState(false);
  const [generatingDocs, setGeneratingDocs] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    fetchData();
  }, [activeTab, migrationPage, testPage]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'version') {
        const data = await globalService.getVersion();
        if (data) {
          setPlatformVersion({
            version: data.version,
            buildNumber: data.buildNumber,
            releaseDate: data.releaseDate,
            environment: 'Production'
          });
        }
      } else if (activeTab === 'migrations') {
        const data = await globalService.getPlatformMigrations(migrationPage, pageSize);
        const items = data?.items ?? [];
        setMigrations(items.map(mapMigrationRow));
        setTotalMigrations(data?.totalCount ?? 0);
      } else if (activeTab === 'tests') {
        const data = await globalService.getPlatformTestResults(testPage, pageSize);
        const items = data?.items ?? [];
        setTestResults(items.map(mapTestRow));
        setTotalTests(data?.totalCount ?? 0);
      } else if (activeTab === 'health') {
        const data = await globalService.getHealth();
        if (data?.components) {
          setSystemHealth(
            data.components.map((component: { name: string; status: string; responseTimeMs: number; message?: string }) => ({
              service: component.name,
              status: component.status as SystemHealth['status'],
              latency: component.responseTimeMs ?? 0,
              lastChecked: data.checkedAt ?? new Date().toISOString(),
              details: component.message,
            })),
          );
        } else {
          setSystemHealth([]);
        }
      } else if (activeTab === 'diagnostics') {
        const data = await globalService.getDiagnostics();
        setDiagnostics(data ? mapDiagnosticsDto(data) : []);
      } else if (activeTab === 'docs') {
        const spec = await globalService.getPlatformOpenApiSpec();
        setOpenApiSpec(mapOpenApiForUi(spec));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await globalService.runPlatformIntegrationTests();
      if (result?.results?.length) {
        setTestResults(result.results.map(mapTestRow));
        setTotalTests(result.results.length);
      } else {
        await fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.response?.data?.errorMessage ?? t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const applyMigration = async (migrationName: string) => {
    setError('');
    setApplyingMigration(true);
    try {
      await globalService.applyPlatformMigration(migrationName);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.response?.data?.errorMessage ?? t('common.error'));
    } finally {
      setApplyingMigration(false);
    }
  };

  const getTestResult = async (testId: string) => {
    setError('');
    try {
      const data = await globalService.getPlatformTestResult(testId);
      setSingleTestResult(mapTestRow(data));
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.response?.data?.errorMessage ?? t('common.error'));
    }
  };

  const getTestResults = async () => {
    setError('');
    await fetchData();
  };

  const generateDocs = async () => {
    setError('');
    setGeneratingDocs(true);
    try {
      const spec = await globalService.generatePlatformDocumentation();
      setOpenApiSpec(mapOpenApiForUi(spec));
    } catch (err: any) {
      setError(err.response?.data?.error ?? err.response?.data?.errorMessage ?? t('common.error'));
    } finally {
      setGeneratingDocs(false);
    }
  };

  const getMigrationStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'Passed': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-green-100 text-green-800';
      case 'Degraded': return 'bg-yellow-100 text-yellow-800';
      case 'Unhealthy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIndicatorColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-green-500';
      case 'Degraded': return 'bg-yellow-500';
      case 'Unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading && !platformVersion && !migrations.length && !testResults.length && !systemHealth.length) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{t('global.platform.title')}</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['version', 'health', 'migrations', 'diagnostics', 'tests', 'docs'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'version' ? t('global.platform.tabs.versionInfo') :
               tab === 'health' ? t('global.platform.tabs.healthStatus') :
               tab === 'migrations' ? t('global.platform.tabs.migrations') :
               tab === 'diagnostics' ? t('global.platform.tabs.diagnostics') :
               tab === 'tests' ? t('global.platform.tabs.tests') :
               t('global.platform.tabs.documentation')}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'version' && (
        <div className="bg-white rounded-lg shadow p-6">
          {platformVersion ? (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">OneSign Platform</h2>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                  v{platformVersion.version}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('global.platform.labels.version')}</h3>
                  <p className="text-lg font-semibold">{platformVersion.version}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('global.platform.labels.buildNumber')}</h3>
                  <p className="text-lg font-semibold">{platformVersion.buildNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('global.platform.labels.releaseDate')}</h3>
                  <p className="text-lg font-semibold">{new Date(platformVersion.releaseDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{t('global.platform.labels.environment')}</h3>
                  <p className="text-lg font-semibold">
                    <span className={`px-2 py-1 rounded text-xs ${
                      platformVersion.environment === 'Production' ? 'bg-green-100 text-green-800' :
                      platformVersion.environment === 'Staging' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {platformVersion.environment}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">{t('global.platform.messages.unableToLoadVersionInfo')}</p>
          )}
        </div>
      )}

      {activeTab === 'migrations' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.platform.labels.migration')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.platform.labels.version')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.platform.labels.appliedAt')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.platform.labels.executionTime')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {migrations.map((migration) => (
                <tr key={migration.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{migration.name}</div>
                    <div className="text-xs text-gray-500">{migration.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {migration.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(migration.appliedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {migration.executionTime}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${getMigrationStatusColor(migration.status)}`}>
                      {migration.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(migration.status === 'Pending' || migration.status === 'Failed') && (
                      <button
                        onClick={() => applyMigration(migration.name)}
                        disabled={applyingMigration}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                      >
                        {t('global.platform.actions.apply')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {migrations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {t('global.platform.messages.noMigrationsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {totalMigrations > pageSize && (
            <div className="px-6 py-4 flex justify-between items-center border-t">
              <button
                onClick={() => setMigrationPage(p => Math.max(1, p - 1))}
                disabled={migrationPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-gray-500">
                Page {migrationPage} / {Math.ceil(totalMigrations / pageSize)}
              </span>
              <button
                onClick={() => setMigrationPage(p => p + 1)}
                disabled={migrationPage >= Math.ceil(totalMigrations / pageSize)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('global.platform.labels.systemDiagnostics')}</h2>
            <div className="space-y-6">
              {(diagnostics.reduce((acc: any[], item) => {
                const existing = acc.find((group: any) => group.category === item.category);
                if (!existing) {
                  acc.push({
                    category: item.category,
                    items: diagnostics.filter((d: DiagnosticInfo) => d.category === item.category)
                  });
                }
                return acc;
              }, []) as any[]).map((group) => (
                <div key={group.category} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{group.category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.items.map((item: DiagnosticInfo) => (
                      <div key={item.key} className="bg-gray-50 rounded p-3">
                        <div className="text-sm font-medium text-gray-700">{item.key}</div>
                        <div className="text-lg font-semibold text-gray-900 mt-1">{item.value}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {diagnostics.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {t('global.platform.messages.noDiagnosticInfo')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div>
          <div className="mb-4 flex justify-between items-center gap-4">
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                placeholder={t('global.platform.placeholders.enterTestId')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => selectedTestId && getTestResult(selectedTestId)}
                disabled={!selectedTestId}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                {t('global.platform.actions.getTestResult')}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={getTestResults}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {t('global.platform.actions.getAllResults')}
              </button>
              <button
                onClick={runTests}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                {t('global.platform.actions.runAllTests')}
              </button>
            </div>
          </div>

          {singleTestResult && (
            <div className="mb-4 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{t('global.platform.labels.testResultDetails')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">{t('global.platform.labels.testName')}:</span>
                  <p className="font-medium">{singleTestResult.testName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">{t('global.platform.labels.category')}:</span>
                  <p className="font-medium">{singleTestResult.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">{t('common.status')}:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getTestStatusColor(singleTestResult.status)}`}>
                    {singleTestResult.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">{t('global.platform.labels.duration')}:</span>
                  <p className="font-medium">{singleTestResult.duration}ms</p>
                </div>
                {singleTestResult.message && (
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">{t('global.platform.labels.message')}:</span>
                    <p className="font-medium">{singleTestResult.message}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSingleTestResult(null)}
                className="mt-4 text-sm text-gray-600 hover:text-gray-900"
              >
                {t('global.platform.actions.clear')}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">{t('global.platform.labels.passed')}</div>
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter(t => t.status === 'Passed').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">{t('global.platform.labels.failed')}</div>
              <div className="text-2xl font-bold text-red-600">
                {testResults.filter(t => t.status === 'Failed').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">{t('global.platform.labels.pending')}</div>
              <div className="text-2xl font-bold text-yellow-600">
                {testResults.filter(t => t.status === 'Pending').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">{t('global.platform.labels.skipped')}</div>
              <div className="text-2xl font-bold text-gray-600">
                {testResults.filter(t => t.status === 'Skipped').length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.platform.labels.testName')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.platform.labels.category')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.platform.labels.duration')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('global.platform.labels.lastRun')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((test) => (
                  <tr key={test.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{test.testName}</div>
                      {test.message && (
                        <div className="text-xs text-gray-500 mt-1">{test.message}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${getTestStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.duration}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(test.lastRunAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {testResults.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {t('global.platform.messages.noTestResultsFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalTests > pageSize && (
              <div className="px-6 py-4 flex justify-between items-center border-t">
                <button
                  onClick={() => setTestPage(p => Math.max(1, p - 1))}
                  disabled={testPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-500">
                  Page {testPage} / {Math.ceil(totalTests / pageSize)}
                </span>
                <button
                  onClick={() => setTestPage(p => p + 1)}
                  disabled={testPage >= Math.ceil(totalTests / pageSize)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemHealth.map((service) => (
              <div key={service.service} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">{service.service}</h3>
                  <div className={`w-3 h-3 rounded-full ${getHealthIndicatorColor(service.status)}`} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('common.status')}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getHealthStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('global.platform.labels.latency')}</span>
                    <span className="text-sm font-medium">{service.latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('global.platform.labels.lastChecked')}</span>
                    <span className="text-sm">{new Date(service.lastChecked).toLocaleTimeString()}</span>
                  </div>
                  {service.details && (
                    <div className="pt-2 border-t mt-2">
                      <p className="text-xs text-gray-500">{service.details}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {systemHealth.length === 0 && (
              <div className="col-span-3 text-center text-gray-500 py-8">
                {t('global.platform.messages.noHealthData')}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t('global.platform.labels.apiDocumentation')}</h2>
            <button
              onClick={generateDocs}
              disabled={generatingDocs}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {generatingDocs ? t('global.platform.labels.generating') : t('global.platform.actions.regenerateDocs')}
            </button>
          </div>

          {openApiSpec ? (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold">{openApiSpec.info.title}</h3>
                <p className="text-gray-600 mt-1">{t('global.platform.labels.version')}: {openApiSpec.info.version}</p>
                <p className="text-gray-500 mt-2">{openApiSpec.info.description}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">{t('global.platform.labels.availableEndpoints')}</h4>
                <div className="space-y-2">
                  {Object.entries(openApiSpec.paths).map(([path, methods]: [string, any]) => (
                    <div key={path} className="border rounded-lg p-4">
                      <div className="font-mono text-sm font-medium text-gray-700 mb-2">{path}</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(methods).map((method) => (
                          <span
                            key={method}
                            className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                              method === 'get' ? 'bg-blue-100 text-blue-800' :
                              method === 'post' ? 'bg-green-100 text-green-800' :
                              method === 'put' ? 'bg-yellow-100 text-yellow-800' :
                              method === 'delete' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-lg font-semibold mb-3">{t('global.platform.labels.openApiSpecification')}</h4>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                  {JSON.stringify(openApiSpec, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {t('global.platform.messages.noApiDocumentation')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
