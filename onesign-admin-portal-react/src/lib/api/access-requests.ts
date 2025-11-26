// Access Requests API - Based on spec /api/tenant/accessrequests
import { accessService, AccessRequestDto, CreateAccessRequestDto, PaginatedResult } from './services/access.service';

// Re-export types
export type { AccessRequestDto, CreateAccessRequestDto, PaginatedResult };

// Status type
export type AccessRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Expired';

// Extended DTO for backward compatibility
export interface AccessRequestExtendedDto extends AccessRequestDto {
  requesterName?: string;
  requesterEmail?: string;
  targetResourceId?: string;
  targetResourceType?: string;
  targetResourceName?: string;
  requestedScopes?: string[];
  reviewedAt?: string;
  reviewerComments?: string;
}

// API Functions using the service

/**
 * GET /api/tenant/accessrequests - Get access requests
 */
export async function getAccessRequests(
  tenantId: string | null,
  params?: {
    status?: AccessRequestStatus;
    page?: number;
    pageSize?: number;
    requestType?: string;
  }
): Promise<PaginatedResult<AccessRequestExtendedDto>> {
  const result = await accessService.getAccessRequests({
    page: params?.page,
    pageSize: params?.pageSize,
    status: params?.status,
    requestType: params?.requestType,
  });
  return result as PaginatedResult<AccessRequestExtendedDto>;
}

/**
 * POST /api/tenant/accessrequests - Create access request
 */
export async function createAccessRequest(data: {
  tenantId?: string;
  userId?: string;
  requestType?: string;
  targetResourceId?: string;
  targetResourceType?: string;
  requestedScopes?: string[];
  justification?: string;
}): Promise<AccessRequestDto> {
  return await accessService.createAccessRequest({
    resourceType: data.targetResourceType || '',
    resourceId: data.targetResourceId,
    requestType: data.requestType as any || 'Application',
    justification: data.justification,
  });
}

/**
 * GET /api/tenant/accessrequests/{id} - Get access request by ID
 */
export async function getAccessRequestById(requestId: string): Promise<AccessRequestExtendedDto | null> {
  return await accessService.getAccessRequestById(requestId) as AccessRequestExtendedDto | null;
}

/**
 * POST /api/tenant/accessrequests/{id}/approve - Approve access request
 */
export async function approveAccessRequest(
  requestId: string,
  params?: {
    tenantId?: string;
    userId?: string;
    comments?: string;
  }
): Promise<AccessRequestDto> {
  return await accessService.approveRequest(requestId, params?.comments);
}

/**
 * POST /api/tenant/accessrequests/{id}/reject - Reject access request
 */
export async function rejectAccessRequest(
  requestId: string,
  params?: {
    tenantId?: string;
    userId?: string;
    comments?: string;
  }
): Promise<AccessRequestDto> {
  return await accessService.rejectRequest(requestId, params?.comments || 'No reason provided');
}

/**
 * POST /api/tenant/accessrequests/{id}/cancel - Cancel access request
 */
export async function cancelAccessRequest(requestId: string): Promise<void> {
  return await accessService.cancelRequest(requestId);
}

// Re-export the service for direct access
export { accessService };
export default accessService;
