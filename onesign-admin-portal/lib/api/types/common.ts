/**
 * Common types used across all API services
 */

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  from?: string;
  to?: string;
}

/**
 * Search parameters
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

/**
 * Generic ID parameter
 */
export type ID = string | number;

/**
 * Timestamp fields
 */
export interface TimestampFields {
  createdAt: string;
  updatedAt?: string;
}

/**
 * User reference
 */
export interface UserReference {
  userId: string;
  userName?: string;
  userEmail?: string;
}

/**
 * Audit fields
 */
export interface AuditFields extends TimestampFields {
  createdByUserId: string;
  createdByUserName?: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
}

/**
 * Soft delete fields
 */
export interface SoftDeleteFields {
  isDeleted: boolean;
  deletedAt?: string;
  deletedByUserId?: string;
}

/**
 * Status types
 */
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';

/**
 * Severity levels
 */
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Priority levels
 */
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Entity status
 */
export interface EntityStatus {
  status: Status;
  statusChangedAt?: string;
  statusChangedByUserId?: string;
}

/**
 * Bulk operation request
 */
export interface BulkOperationRequest<T = any> {
  ids: string[];
  operation: string;
  data?: T;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  successCount: number;
  failureCount: number;
  totalCount: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * API response metadata
 */
export interface ResponseMetadata {
  requestId?: string;
  timestamp: string;
  version?: string;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponseWrapper<T> {
  data: T;
  metadata?: ResponseMetadata;
}

/**
 * File upload data
 */
export interface FileUploadData {
  file: File;
  fileName?: string;
  contentType?: string;
}

/**
 * File info
 */
export interface FileInfo {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  url: string;
  uploadedAt: string;
  uploadedByUserId: string;
}

/**
 * Export request
 */
export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  filters?: Record<string, any>;
  fields?: string[];
}

/**
 * Import request
 */
export interface ImportRequest {
  file: File;
  format: 'csv' | 'xlsx' | 'json';
  options?: Record<string, any>;
}

/**
 * Batch job status
 */
export interface BatchJobStatus {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  totalItems?: number;
  processedItems?: number;
  failedItems?: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

/**
 * Activity log entry
 */
export interface ActivityLogEntry {
  id: string;
  tenantId?: string;
  userId: string;
  userName?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

/**
 * Settings
 */
export interface Settings {
  [key: string]: any;
}

/**
 * Feature flag
 */
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  enabledFor?: string[];
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services?: Record<string, {
    status: 'up' | 'down';
    responseTime?: number;
  }>;
}
