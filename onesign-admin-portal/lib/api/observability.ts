const API_BASE = 'http://localhost:7000';

// DTOs
export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: string;
  action: string;
  actorId: string;
  actorEmail: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  metadata: any;
}

export interface AuditSearchFilter {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  eventType?: string;
  action?: string;
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  success?: boolean;
  ipAddress?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AuditSearchResult {
  events: AuditEvent[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// Tenant API functions

export async function searchAuditEvents(
  tenantId: string,
  filter: AuditSearchFilter
): Promise<AuditSearchResult> {
  const response = await fetch(
    `${API_BASE}/api/tenant/observability/audit/search?tenantId=${tenantId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filter),
    }
  );
  if (!response.ok) throw new Error('Failed to search audit events');
  return response.json();
}

export async function exportAuditLogs(
  tenantId: string,
  filter: Omit<AuditSearchFilter, 'pageNumber' | 'pageSize'>
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE}/api/tenant/observability/audit/export?tenantId=${tenantId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filter),
    }
  );
  if (!response.ok) throw new Error('Failed to export audit logs');
  return response.blob();
}
