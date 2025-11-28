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
        setMigrations((data as any).items || []);
        setTotalMigrations((data as any).totalCount || 0);
      } else if (activeTab === 'tests') {
        // Test endpoints not available in service - use fallback
        setTestResults([]);
        setTotalTests(0);
      } else if (activeTab === 'health') {
        const data = await globalService.getHealth();
        if (data && data.services) {
          setSystemHealth(data.services.map((service: any) => ({
            service: service.name,
            status: service.status as 'Healthy' | 'Degraded' | 'Unhealthy',
            latency: service.latency || 0,
            lastChecked: new Date().toISOString()
          })));
        }
      } else if (activeTab === 'diagnostics') {
        const data = await globalService.getDiagnostics();
        if (data) {
          // Convert diagnostics to expected format
          const diags: DiagnosticInfo[] = [];
          for (const [key, value] of Object.entries(data)) {
            diags.push({
              category: 'System',
              key: key,
              value: String(value)
            });
          }
          setDiagnostics(diags);
        }
      } else if (activeTab === 'docs') {
        // API docs endpoint not available - use fallback
        setOpenApiSpec(null);
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
    try {
      // Test execution not available in service
      setError('Platform tests are not available');
    } catch (err: any) {
      setError(err.response?.data?.errorMessage || t('common.error'));
    }
  };

  const applyMigration = async (migrationId: string) => {
    setError('');
    setApplyingMigration(true);
    try {
      await globalService.applyPlatformMigration(migrationId);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.errorMessage || t('common.error'));
    } finally {
      setApplyingMigration(false);
    }
  };

  const getTestResult = async (testId: string) => {
    setError('');
    try {
      // Test result retrieval not available in service
      setError('Test result retrieval not available');
    } catch (err: any) {
      setError(err.response?.data?.errorMessage || t('common.error'));
    }
  };

  const getTestResults = async () => {
    setError('');
    try {
      // Test results not available in service
      setError('Platform tests are not available');
    } catch (err: any) {
      setError(err.response?.data?.errorMessage || t('common.error'));
    }
  };

  const generateDocs = async () => {
    setError('');
    setGeneratingDocs(true);
    try {
      // API docs generation not available in service
      setError('Documentation generation is not available');
    } catch (err: any) {
      setError(err.response?.data?.errorMessage || t('common.error'));
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
      <h1 className="text-3xl font-bold mb-6">Platform Management</h1>

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
              {tab === 'version' ? 'Version Info' :
               tab === 'health' ? 'Health Status' :
               tab === 'migrations' ? 'Migrations' :
               tab === 'diagnostics' ? 'Diagnostics' :
               tab === 'tests' ? 'Tests' :
               'Documentation'}
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
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Version</h3>
                  <p className="text-lg font-semibold">{platformVersion.version}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Build Number</h3>
                  <p className="text-lg font-semibold">{platformVersion.buildNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Release Date</h3>
                  <p className="text-lg font-semibold">{new Date(platformVersion.releaseDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Environment</h3>
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
            <p className="text-gray-500">Unable to load version information</p>
          )}
        </div>
      )}

      {activeTab === 'migrations' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Migration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Execution Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                    {migration.status === 'Pending' && (
                      <button
                        onClick={() => applyMigration(migration.id)}
                        disabled={applyingMigration}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                      >
                        Apply
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {migrations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No migrations found
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
            <h2 className="text-xl font-semibold mb-4">System Diagnostics</h2>
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
                  No diagnostic information available
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
                placeholder="Enter test ID to view details"
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => selectedTestId && getTestResult(selectedTestId)}
                disabled={!selectedTestId}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Get Test Result
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={getTestResults}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Get All Results
              </button>
              <button
                onClick={runTests}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Run All Tests
              </button>
            </div>
          </div>

          {singleTestResult && (
            <div className="mb-4 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Test Result Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Test Name:</span>
                  <p className="font-medium">{singleTestResult.testName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Category:</span>
                  <p className="font-medium">{singleTestResult.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getTestStatusColor(singleTestResult.status)}`}>
                    {singleTestResult.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Duration:</span>
                  <p className="font-medium">{singleTestResult.duration}ms</p>
                </div>
                {singleTestResult.message && (
                  <div className="col-span-2">
                    <span className="text-sm text-gray-500">Message:</span>
                    <p className="font-medium">{singleTestResult.message}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSingleTestResult(null)}
                className="mt-4 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Passed</div>
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter(t => t.status === 'Passed').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Failed</div>
              <div className="text-2xl font-bold text-red-600">
                {testResults.filter(t => t.status === 'Failed').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                {testResults.filter(t => t.status === 'Pending').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Skipped</div>
              <div className="text-2xl font-bold text-gray-600">
                {testResults.filter(t => t.status === 'Skipped').length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Run</th>
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
                      No test results found
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
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded text-xs ${getHealthStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Latency</span>
                    <span className="text-sm font-medium">{service.latency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Checked</span>
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
                No health data available
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">API Documentation</h2>
            <button
              onClick={generateDocs}
              disabled={generatingDocs}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {generatingDocs ? 'Generating...' : 'Regenerate Docs'}
            </button>
          </div>

          {openApiSpec ? (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold">{openApiSpec.info.title}</h3>
                <p className="text-gray-600 mt-1">Version: {openApiSpec.info.version}</p>
                <p className="text-gray-500 mt-2">{openApiSpec.info.description}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Available Endpoints</h4>
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
                <h4 className="text-lg font-semibold mb-3">OpenAPI Specification</h4>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                  {JSON.stringify(openApiSpec, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No API documentation available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
