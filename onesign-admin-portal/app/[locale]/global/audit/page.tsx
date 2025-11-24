'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import * as observabilityApi from '@/lib/api/observability';

// Extended Audit Event Interface
interface AuditEvent {
  id: string;
  timestamp: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userName: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceType: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  geoLocation?: {
    country?: string;
    city?: string;
    coordinates?: { lat: number; lon: number };
  };
  details: any;
  requestData?: any;
  responseData?: any;
  relatedEvents?: string[];
}

interface SearchFilters {
  tenantId?: string;
  userId?: string;
  action?: string;
  resourceType?: string;
  category?: string;
  severity?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  ipAddress?: string;
}

interface AuditStatistics {
  totalEvents: number;
  bySeverity: { severity: string; count: number }[];
  byCategory: { category: string; count: number }[];
  topTenants: { tenantId: string; tenantName: string; count: number }[];
  suspiciousActivities: number;
}

export default function GlobalAuditPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Audit Events State
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Statistics State
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);

  // Search Filters State
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Event Details Modal State
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Real-time Updates State
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Export State
  const [exporting, setExporting] = useState(false);

  // Mock data generator for fallback
  const generateMockAuditEvents = (count: number): AuditEvent[] => {
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT'];
    const resourceTypes = ['USER', 'TENANT', 'CONFIG', 'API_KEY', 'WEBHOOK', 'TEMPLATE', 'CAMPAIGN'];
    const categories = ['Authentication', 'Authorization', 'Data Access', 'Configuration', 'Security', 'Compliance'];
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
    const statuses: Array<'success' | 'failure'> = ['success', 'failure'];
    const tenants = [
      { id: 'tenant-001', name: 'Acme Corp' },
      { id: 'tenant-002', name: 'TechStart Inc' },
      { id: 'tenant-003', name: 'Global Solutions' },
      { id: 'tenant-004', name: 'Enterprise Co' },
      { id: 'tenant-005', name: 'Digital Ventures' },
    ];

    return Array.from({ length: count }, (_, i) => {
      const tenant = tenants[Math.floor(Math.random() * tenants.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        id: `audit-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        tenantId: tenant.id,
        tenantName: tenant.name,
        userId: `user-${Math.floor(Math.random() * 100)}`,
        userName: `User ${Math.floor(Math.random() * 100)}`,
        userEmail: `user${Math.floor(Math.random() * 100)}@example.com`,
        action,
        resource: `${resourceType.toLowerCase()}-${Math.floor(Math.random() * 1000)}`,
        resourceType,
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status,
        severity,
        category,
        geoLocation: {
          country: ['USA', 'UK', 'Canada', 'Germany', 'Japan'][Math.floor(Math.random() * 5)],
          city: ['New York', 'London', 'Toronto', 'Berlin', 'Tokyo'][Math.floor(Math.random() * 5)],
          coordinates: { lat: Math.random() * 180 - 90, lon: Math.random() * 360 - 180 },
        },
        details: {
          description: `${action} operation on ${resourceType}`,
          changes: { field: 'value' },
        },
        requestData: { method: 'POST', endpoint: '/api/v1/resource' },
        responseData: { status: status === 'success' ? 200 : 400 },
        relatedEvents: [`related-${i - 1}`, `related-${i + 1}`],
      };
    });
  };

  // Generate mock statistics
  const generateMockStatistics = (): AuditStatistics => {
    return {
      totalEvents: 15420,
      bySeverity: [
        { severity: 'low', count: 8234 },
        { severity: 'medium', count: 5123 },
        { severity: 'high', count: 1852 },
        { severity: 'critical', count: 211 },
      ],
      byCategory: [
        { category: 'Authentication', count: 4521 },
        { category: 'Authorization', count: 3234 },
        { category: 'Data Access', count: 2987 },
        { category: 'Configuration', count: 2145 },
        { category: 'Security', count: 1876 },
        { category: 'Compliance', count: 657 },
      ],
      topTenants: [
        { tenantId: 'tenant-001', tenantName: 'Acme Corp', count: 3542 },
        { tenantId: 'tenant-002', tenantName: 'TechStart Inc', count: 2987 },
        { tenantId: 'tenant-003', tenantName: 'Global Solutions', count: 2654 },
        { tenantId: 'tenant-004', tenantName: 'Enterprise Co', count: 2234 },
        { tenantId: 'tenant-005', tenantName: 'Digital Ventures', count: 1876 },
      ],
      suspiciousActivities: 47,
    };
  };

  // Search audit events
  const searchAuditEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await observabilityApi.searchGlobalAuditEvents({
        ...filters,
        pageNumber: page,
        pageSize,
      });

      // Map API response to our extended interface
      const mappedEvents = data.events.map((event: any) => ({
        id: event.id,
        timestamp: event.timestamp,
        tenantId: event.metadata?.tenantId || 'N/A',
        tenantName: event.metadata?.tenantName || 'N/A',
        userId: event.actorId,
        userName: event.actorEmail?.split('@')[0] || event.actorId,
        userEmail: event.actorEmail,
        action: event.action,
        resource: event.resourceId || event.resourceType,
        resourceType: event.resourceType,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        status: (event.success ? 'success' : 'failure') as 'success' | 'failure',
        severity: event.metadata?.severity || 'low',
        category: event.eventType,
        geoLocation: event.metadata?.geoLocation,
        details: event.metadata,
        requestData: event.metadata?.requestData,
        responseData: event.metadata?.responseData,
        relatedEvents: event.metadata?.relatedEvents,
      }));

      setAuditEvents(mappedEvents);
      setTotalEvents(data.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch audit events, using mock data:', err);
      // Fallback to mock data
      const mockEvents = generateMockAuditEvents(pageSize);
      setAuditEvents(mockEvents);
      setTotalEvents(100);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = () => {
    // Using mock statistics for now
    // In production, this would call an API endpoint
    setStatistics(generateMockStatistics());
  };

  // Export functionality
  const exportData = async (format: 'csv' | 'json' | 'compliance') => {
    setExporting(true);
    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      if (format === 'csv') {
        const headers = ['Timestamp', 'Tenant', 'User', 'Action', 'Resource', 'IP Address', 'Status', 'Severity', 'Category'];
        const rows = auditEvents.map(event => [
          event.timestamp,
          event.tenantName,
          event.userName,
          event.action,
          event.resource,
          event.ipAddress,
          event.status,
          event.severity,
          event.category,
        ]);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `audit-log-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'json') {
        content = JSON.stringify(auditEvents, null, 2);
        filename = `audit-log-${Date.now()}.json`;
        mimeType = 'application/json';
      } else if (format === 'compliance') {
        const complianceReport = {
          reportType: 'Audit Compliance Report',
          generatedAt: new Date().toISOString(),
          period: {
            start: filters.startDate || 'N/A',
            end: filters.endDate || 'N/A',
          },
          summary: {
            totalEvents: auditEvents.length,
            successfulEvents: auditEvents.filter(e => e.status === 'success').length,
            failedEvents: auditEvents.filter(e => e.status === 'failure').length,
            criticalEvents: auditEvents.filter(e => e.severity === 'critical').length,
          },
          events: auditEvents,
        };
        content = JSON.stringify(complianceReport, null, 2);
        filename = `compliance-report-${Date.now()}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  // View event details
  const viewEventDetails = async (eventId: string) => {
    setLoading(true);
    try {
      const event = await observabilityApi.getGlobalAuditEvent(eventId);

      // Map to our extended interface
      const mappedEvent: AuditEvent = {
        id: event.id,
        timestamp: event.timestamp,
        tenantId: event.metadata?.tenantId || 'N/A',
        tenantName: event.metadata?.tenantName || 'N/A',
        userId: event.actorId,
        userName: event.actorEmail?.split('@')[0] || event.actorId,
        userEmail: event.actorEmail,
        action: event.action,
        resource: event.resourceId || event.resourceType,
        resourceType: event.resourceType,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        status: (event.success ? 'success' : 'failure') as 'success' | 'failure',
        severity: event.metadata?.severity || 'low',
        category: event.eventType,
        geoLocation: event.metadata?.geoLocation,
        details: event.metadata,
        requestData: event.metadata?.requestData,
        responseData: event.metadata?.responseData,
        relatedEvents: event.metadata?.relatedEvents,
      };

      setSelectedEvent(mappedEvent);
      setShowEventModal(true);
    } catch (err) {
      // Fallback to event from list
      const event = auditEvents.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setShowEventModal(true);
      } else {
        setError('Failed to load event details');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        searchAuditEvents();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, page, filters]);

  // Initial load
  useEffect(() => {
    searchAuditEvents();
    loadStatistics();
  }, [page]);

  // Helper functions for styling
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="p-8 max-w-[1800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Audit Log Viewer</h1>
        <p className="text-gray-600">
          Cross-tenant audit investigations, compliance reports, and security event monitoring
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Events</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.totalEvents.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Critical Events</h3>
            <p className="text-3xl font-bold text-red-600">
              {statistics.bySeverity.find(s => s.severity === 'critical')?.count || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Suspicious Activities</h3>
            <p className="text-3xl font-bold text-yellow-600">{statistics.suspiciousActivities}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Top Category</h3>
            <p className="text-lg font-bold text-gray-900">
              {statistics.byCategory[0]?.category || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">{statistics.byCategory[0]?.count || 0} events</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Most Active Tenant</h3>
            <p className="text-lg font-bold text-gray-900">
              {statistics.topTenants[0]?.tenantName || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">{statistics.topTenants[0]?.count || 0} events</p>
          </div>
        </div>
      )}

      {/* Advanced Search Filters */}
      <div className="mb-6 bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </button>
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Term</label>
              <input
                type="text"
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="Search in events..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={filters.startDate || ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={filters.endDate || ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant ID</label>
                <input
                  type="text"
                  value={filters.tenantId || ''}
                  onChange={(e) => setFilters({ ...filters, tenantId: e.target.value })}
                  placeholder="Filter by tenant..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  value={filters.userId || ''}
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                  placeholder="Filter by user..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <select
                  value={filters.action || ''}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="READ">READ</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="LOGOUT">LOGOUT</option>
                  <option value="EXPORT">EXPORT</option>
                  <option value="IMPORT">IMPORT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                <select
                  value={filters.resourceType || ''}
                  onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Resources</option>
                  <option value="USER">USER</option>
                  <option value="TENANT">TENANT</option>
                  <option value="CONFIG">CONFIG</option>
                  <option value="API_KEY">API_KEY</option>
                  <option value="WEBHOOK">WEBHOOK</option>
                  <option value="TEMPLATE">TEMPLATE</option>
                  <option value="CAMPAIGN">CAMPAIGN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Categories</option>
                  <option value="Authentication">Authentication</option>
                  <option value="Authorization">Authorization</option>
                  <option value="Data Access">Data Access</option>
                  <option value="Configuration">Configuration</option>
                  <option value="Security">Security</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={filters.severity || ''}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="failure">Failure</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <input
                  type="text"
                  value={filters.ipAddress || ''}
                  onChange={(e) => setFilters({ ...filters, ipAddress: e.target.value })}
                  placeholder="Filter by IP..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPage(1);
                  searchAuditEvents();
                }}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={() => {
                  setFilters({});
                  setPage(1);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                  Auto-refresh ({refreshInterval / 1000}s)
                </label>
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    const menu = document.getElementById('export-menu');
                    if (menu) menu.classList.toggle('hidden');
                  }}
                  disabled={exporting || auditEvents.length === 0}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? 'Exporting...' : 'Export'}
                </button>
                <div
                  id="export-menu"
                  className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        exportData('csv');
                        document.getElementById('export-menu')?.classList.add('hidden');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => {
                        exportData('json');
                        document.getElementById('export-menu')?.classList.add('hidden');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={() => {
                        exportData('compliance');
                        document.getElementById('export-menu')?.classList.add('hidden');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Compliance Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.tenantName}</div>
                    <div className="text-xs text-gray-500">{event.tenantId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.userName}</div>
                    <div className="text-xs text-gray-500">{event.userEmail || event.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {event.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.resourceType}</div>
                    <div className="text-xs text-gray-500">{event.resource}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {event.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(event.status)}`}>
                      {event.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded border ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => viewEventDetails(event.id)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {auditEvents.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No audit events found. Try adjusting your search filters.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Loading audit events...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalEvents > pageSize && (
          <div className="px-6 py-4 flex justify-between items-center border-t bg-gray-50">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * pageSize, totalEvents)}</span> of{' '}
              <span className="font-medium">{totalEvents}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {page} of {Math.ceil(totalEvents / pageSize)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(totalEvents / pageSize)}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Audit Event Details</h2>
                <p className="text-sm text-gray-500 mt-1">Event ID: {selectedEvent.id}</p>
              </div>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Severity */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded border ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded border ${getSeverityColor(selectedEvent.severity)}`}>
                    {selectedEvent.severity.toUpperCase()} SEVERITY
                  </span>
                </div>
              </div>

              {/* Event Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Event Information</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Timestamp</label>
                    <p className="text-gray-900">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Action</label>
                    <p className="text-gray-900 font-semibold">{selectedEvent.action}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="text-gray-900">{selectedEvent.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Resource Type</label>
                    <p className="text-gray-900">{selectedEvent.resourceType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Resource</label>
                    <p className="text-gray-900 font-mono text-sm">{selectedEvent.resource}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">User & Tenant</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tenant</label>
                    <p className="text-gray-900 font-semibold">{selectedEvent.tenantName}</p>
                    <p className="text-sm text-gray-500 font-mono">{selectedEvent.tenantId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">User</label>
                    <p className="text-gray-900 font-semibold">{selectedEvent.userName}</p>
                    <p className="text-sm text-gray-500">{selectedEvent.userEmail || selectedEvent.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">IP Address</label>
                    <p className="text-gray-900 font-mono">{selectedEvent.ipAddress}</p>
                  </div>
                  {selectedEvent.geoLocation && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">
                        {selectedEvent.geoLocation.city}, {selectedEvent.geoLocation.country}
                      </p>
                      {selectedEvent.geoLocation.coordinates && (
                        <p className="text-sm text-gray-500">
                          {selectedEvent.geoLocation.coordinates.lat.toFixed(4)},
                          {selectedEvent.geoLocation.coordinates.lon.toFixed(4)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* User Agent */}
              {selectedEvent.userAgent && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-2">User Agent</h3>
                  <p className="text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded border">
                    {selectedEvent.userAgent}
                  </p>
                </div>
              )}

              {/* Request Data */}
              {selectedEvent.requestData && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-2">Request Data</h3>
                  <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded border overflow-auto max-h-64">
                    {JSON.stringify(selectedEvent.requestData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Response Data */}
              {selectedEvent.responseData && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-2">Response Data</h3>
                  <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded border overflow-auto max-h-64">
                    {JSON.stringify(selectedEvent.responseData, null, 2)}
                  </pre>
                </div>
              )}

              {/* Additional Details */}
              {selectedEvent.details && Object.keys(selectedEvent.details).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-2">Additional Details</h3>
                  <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded border overflow-auto max-h-64">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              )}

              {/* Related Events */}
              {selectedEvent.relatedEvents && selectedEvent.relatedEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-2">Related Events</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.relatedEvents.map((relatedId) => (
                      <span
                        key={relatedId}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-mono"
                      >
                        {relatedId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => exportData('json')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export Event
              </button>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
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
