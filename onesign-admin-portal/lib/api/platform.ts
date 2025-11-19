const API_BASE = 'http://localhost:7000';

// DTOs
export interface PlatformVersionDto {
  version: string;
  buildNumber: string;
  buildDate: string;
  environment: string;
  gitCommit?: string;
  gitBranch?: string;
  features: FeatureFlag[];
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
}

export interface PlatformHealthDto {
  status: string;
  timestamp: string;
  uptime: string;
  checks: HealthCheckDto[];
}

export interface HealthCheckDto {
  name: string;
  status: string;
  description?: string;
  responseTimeMs?: number;
  lastChecked: string;
  errorMessage?: string;
}

export interface MigrationDto {
  id: string;
  name: string;
  version: string;
  status: string;
  appliedAt?: string;
  appliedByUserId?: string;
  durationMs?: number;
  errorMessage?: string;
  rollbackAvailable: boolean;
}

export interface MigrationResultDto {
  migrationId: string;
  success: boolean;
  status: string;
  message: string;
  durationMs: number;
  appliedAt: string;
  warnings?: string[];
  errors?: string[];
}

export interface PlatformDiagnosticsDto {
  systemInfo: SystemInfoDto;
  databaseInfo: DatabaseInfoDto;
  cacheInfo: CacheInfoDto;
  queueInfo: QueueInfoDto;
  memoryUsage: MemoryUsageDto;
  activeConnections: number;
  requestsPerSecond: number;
}

export interface SystemInfoDto {
  osDescription: string;
  frameworkDescription: string;
  processArchitecture: string;
  processorCount: number;
  machineName: string;
  startTime: string;
}

export interface DatabaseInfoDto {
  provider: string;
  serverVersion: string;
  connectionState: string;
  pendingMigrations: number;
  appliedMigrations: number;
}

export interface CacheInfoDto {
  provider: string;
  status: string;
  hitRate: number;
  missRate: number;
  evictionRate: number;
  size: string;
}

export interface QueueInfoDto {
  provider: string;
  status: string;
  pendingMessages: number;
  processedMessages: number;
  failedMessages: number;
}

export interface MemoryUsageDto {
  totalMemoryMb: number;
  usedMemoryMb: number;
  gcCollectionCount: number[];
  workingSetMb: number;
}

export interface TestRunDto {
  id: string;
  testSuiteId?: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  executedBy: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  durationMs?: number;
  categories: string[];
  results: TestResultDto[];
}

export interface TestResultDto {
  id: string;
  testRunId: string;
  testName: string;
  category: string;
  status: string;
  durationMs: number;
  errorMessage?: string;
  stackTrace?: string;
  output?: string;
}

export interface OpenApiSpecDto {
  title: string;
  version: string;
  description: string;
  specUrl: string;
  swaggerUiUrl: string;
  lastGenerated: string;
  endpointCount: number;
  schemaCount: number;
}

export interface DocumentationResultDto {
  success: boolean;
  message: string;
  generatedAt: string;
  filesGenerated: number;
  outputPath: string;
  warnings?: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API functions

export async function getPlatformVersion(): Promise<PlatformVersionDto> {
  const response = await fetch(`${API_BASE}/api/global/platform/version`);
  if (!response.ok) throw new Error('Failed to fetch platform version');
  return response.json();
}

export async function getPlatformHealth(): Promise<PlatformHealthDto> {
  const response = await fetch(`${API_BASE}/api/global/platform/health`);
  if (!response.ok) throw new Error('Failed to fetch platform health');
  return response.json();
}

export async function getMigrations(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<PagedResult<MigrationDto>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
  if (params?.status) searchParams.append('status', params.status);

  const response = await fetch(`${API_BASE}/api/global/platform/migrations?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch migrations');
  return response.json();
}

export async function applyMigration(data: {
  migrationId?: string;
  dryRun?: boolean;
}): Promise<MigrationResultDto> {
  const response = await fetch(`${API_BASE}/api/global/platform/migrations/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to apply migration');
  return response.json();
}

export async function getPlatformDiagnostics(): Promise<PlatformDiagnosticsDto> {
  const response = await fetch(`${API_BASE}/api/global/platform/diagnostics`);
  if (!response.ok) throw new Error('Failed to fetch platform diagnostics');
  return response.json();
}

export async function runIntegrationTests(data?: {
  testSuiteId?: string;
  testCategories?: string[];
}): Promise<TestRunDto> {
  const response = await fetch(`${API_BASE}/api/global/platform/tests/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });
  if (!response.ok) throw new Error('Failed to run integration tests');
  return response.json();
}

export async function getTestResult(testId: string): Promise<TestRunDto> {
  const response = await fetch(`${API_BASE}/api/global/platform/tests/${testId}`);
  if (!response.ok) throw new Error('Failed to fetch test result');
  return response.json();
}

export async function getTestResults(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PagedResult<TestRunDto>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/global/platform/tests/results?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch test results');
  return response.json();
}

export async function getOpenApiSpec(): Promise<OpenApiSpecDto> {
  const response = await fetch(`${API_BASE}/api/global/platform/docs/openapi`);
  if (!response.ok) throw new Error('Failed to fetch OpenAPI spec');
  return response.json();
}

export async function generateDocumentation(): Promise<DocumentationResultDto> {
  const response = await fetch(`${API_BASE}/api/global/platform/docs/generate`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to generate documentation');
  return response.json();
}

// Constants
export const MIGRATION_STATUSES = [
  'Pending',
  'Applied',
  'Failed',
  'RolledBack',
];

export const TEST_STATUSES = [
  'Pending',
  'Running',
  'Passed',
  'Failed',
  'Skipped',
  'Cancelled',
];

export const TEST_CATEGORIES = [
  'Unit',
  'Integration',
  'EndToEnd',
  'Performance',
  'Security',
  'Smoke',
];

export const HEALTH_STATUSES = [
  'Healthy',
  'Degraded',
  'Unhealthy',
];

// Helper functions

export function getHealthStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'healthy':
      return 'green';
    case 'degraded':
      return 'yellow';
    case 'unhealthy':
      return 'red';
    default:
      return 'gray';
  }
}

export function getTestStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'passed':
      return 'green';
    case 'failed':
      return 'red';
    case 'skipped':
      return 'gray';
    case 'running':
      return 'blue';
    case 'pending':
      return 'yellow';
    default:
      return 'gray';
  }
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function calculateTestPassRate(testRun: TestRunDto): number {
  if (testRun.totalTests === 0) return 0;
  return (testRun.passedTests / testRun.totalTests) * 100;
}
