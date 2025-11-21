import { ApiClient, apiClient } from '../api-client';
import { PaginatedResponse } from '../types/common';
import {
  Incident,
  GetIncidentsParams,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  IncidentComment,
  IncidentWorkflow,
  IncidentStatistics,
  IncidentAttachment,
} from '../types/incidents';

/**
 * Incidents Service
 * Handles all incident management operations
 */
export class IncidentsService {
  constructor(private client: ApiClient = apiClient) {}

  /**
   * Get paginated list of incidents
   */
  async getIncidents(params: GetIncidentsParams): Promise<PaginatedResponse<Incident>> {
    const response = await this.client.get<PaginatedResponse<Incident>>(
      '/api/tenant/incidents',
      params
    );
    return response.data;
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(tenantId: string, incidentId: string): Promise<Incident> {
    const response = await this.client.get<Incident>(`/api/tenant/incidents/${incidentId}`, {
      tenantId,
    });
    return response.data;
  }

  /**
   * Create new incident
   */
  async createIncident(data: CreateIncidentRequest): Promise<Incident> {
    const response = await this.client.post<Incident>('/api/tenant/incidents', data);
    return response.data;
  }

  /**
   * Update incident
   */
  async updateIncident(
    tenantId: string,
    incidentId: string,
    data: UpdateIncidentRequest
  ): Promise<Incident> {
    const response = await this.client.put<Incident>(`/api/tenant/incidents/${incidentId}`, {
      ...data,
      tenantId,
    });
    return response.data;
  }

  /**
   * Delete incident
   */
  async deleteIncident(tenantId: string, incidentId: string): Promise<void> {
    await this.client.delete(`/api/tenant/incidents/${incidentId}`, {
      params: { tenantId },
    });
  }

  // Incident Status Management

  /**
   * Acknowledge incident
   */
  async acknowledgeIncident(tenantId: string, incidentId: string): Promise<Incident> {
    const response = await this.client.post<Incident>(
      `/api/tenant/incidents/${incidentId}/acknowledge`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Start investigation
   */
  async startInvestigation(tenantId: string, incidentId: string): Promise<Incident> {
    const response = await this.client.post<Incident>(
      `/api/tenant/incidents/${incidentId}/investigate`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Contain incident
   */
  async containIncident(tenantId: string, incidentId: string): Promise<Incident> {
    const response = await this.client.post<Incident>(
      `/api/tenant/incidents/${incidentId}/contain`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Resolve incident
   */
  async resolveIncident(
    tenantId: string,
    incidentId: string,
    resolution: string
  ): Promise<Incident> {
    const response = await this.client.post<Incident>(
      `/api/tenant/incidents/${incidentId}/resolve`,
      { tenantId, resolution }
    );
    return response.data;
  }

  /**
   * Close incident
   */
  async closeIncident(tenantId: string, incidentId: string, notes?: string): Promise<Incident> {
    const response = await this.client.post<Incident>(
      `/api/tenant/incidents/${incidentId}/close`,
      { tenantId, notes }
    );
    return response.data;
  }

  /**
   * Reopen incident
   */
  async reopenIncident(tenantId: string, incidentId: string, reason: string): Promise<Incident> {
    const response = await this.client.post<Incident>(
      `/api/tenant/incidents/${incidentId}/reopen`,
      { tenantId, reason }
    );
    return response.data;
  }

  /**
   * Assign incident to user
   */
  async assignIncident(
    tenantId: string,
    incidentId: string,
    userId: string
  ): Promise<Incident> {
    const response = await this.client.post<Incident>(
      `/api/tenant/incidents/${incidentId}/assign`,
      { tenantId, userId }
    );
    return response.data;
  }

  // Incident Comments

  /**
   * Get incident comments
   */
  async getComments(tenantId: string, incidentId: string): Promise<IncidentComment[]> {
    const response = await this.client.get<IncidentComment[]>(
      `/api/tenant/incidents/${incidentId}/comments`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Add comment to incident
   */
  async addComment(
    tenantId: string,
    incidentId: string,
    comment: string,
    isInternal?: boolean
  ): Promise<IncidentComment> {
    const response = await this.client.post<IncidentComment>(
      `/api/tenant/incidents/${incidentId}/comments`,
      { tenantId, comment, isInternal }
    );
    return response.data;
  }

  /**
   * Update comment
   */
  async updateComment(
    tenantId: string,
    incidentId: string,
    commentId: string,
    comment: string
  ): Promise<IncidentComment> {
    const response = await this.client.put<IncidentComment>(
      `/api/tenant/incidents/${incidentId}/comments/${commentId}`,
      { tenantId, comment }
    );
    return response.data;
  }

  /**
   * Delete comment
   */
  async deleteComment(tenantId: string, incidentId: string, commentId: string): Promise<void> {
    await this.client.delete(`/api/tenant/incidents/${incidentId}/comments/${commentId}`, {
      params: { tenantId },
    });
  }

  // Incident Attachments

  /**
   * Get incident attachments
   */
  async getAttachments(tenantId: string, incidentId: string): Promise<IncidentAttachment[]> {
    const response = await this.client.get<IncidentAttachment[]>(
      `/api/tenant/incidents/${incidentId}/attachments`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Upload attachment to incident
   */
  async uploadAttachment(
    tenantId: string,
    incidentId: string,
    file: File
  ): Promise<IncidentAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenantId', tenantId);

    const response = await this.client.post<IncidentAttachment>(
      `/api/tenant/incidents/${incidentId}/attachments`,
      formData
    );
    return response.data;
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(
    tenantId: string,
    incidentId: string,
    attachmentId: string
  ): Promise<void> {
    await this.client.delete(`/api/tenant/incidents/${incidentId}/attachments/${attachmentId}`, {
      params: { tenantId },
    });
  }

  // Incident Workflows

  /**
   * Get incident workflows
   */
  async getWorkflows(tenantId: string): Promise<IncidentWorkflow[]> {
    const response = await this.client.get<IncidentWorkflow[]>(
      '/api/tenant/incidents/workflows',
      { tenantId }
    );
    return response.data;
  }

  /**
   * Create incident workflow
   */
  async createWorkflow(data: Partial<IncidentWorkflow>): Promise<IncidentWorkflow> {
    const response = await this.client.post<IncidentWorkflow>(
      '/api/tenant/incidents/workflows',
      data
    );
    return response.data;
  }

  /**
   * Update incident workflow
   */
  async updateWorkflow(
    tenantId: string,
    workflowId: string,
    data: Partial<IncidentWorkflow>
  ): Promise<IncidentWorkflow> {
    const response = await this.client.put<IncidentWorkflow>(
      `/api/tenant/incidents/workflows/${workflowId}`,
      { ...data, tenantId }
    );
    return response.data;
  }

  /**
   * Delete incident workflow
   */
  async deleteWorkflow(tenantId: string, workflowId: string): Promise<void> {
    await this.client.delete(`/api/tenant/incidents/workflows/${workflowId}`, {
      params: { tenantId },
    });
  }

  // Incident Analytics

  /**
   * Get incident statistics
   */
  async getStatistics(tenantId: string, from?: string, to?: string): Promise<IncidentStatistics> {
    const response = await this.client.get<IncidentStatistics>(
      '/api/tenant/incidents/statistics',
      { tenantId, from, to }
    );
    return response.data;
  }

  /**
   * Export incidents
   */
  async exportIncidents(
    tenantId: string,
    format: 'csv' | 'xlsx' | 'json',
    filters?: any
  ): Promise<Blob> {
    const response = await this.client.get<Blob>('/api/tenant/incidents/export', {
      tenantId,
      format,
      ...filters,
    });
    return response.data;
  }

  // Bulk Operations

  /**
   * Bulk assign incidents
   */
  async bulkAssign(
    tenantId: string,
    incidentIds: string[],
    userId: string
  ): Promise<{ successCount: number; failureCount: number }> {
    const response = await this.client.post<{ successCount: number; failureCount: number }>(
      '/api/tenant/incidents/bulk-assign',
      { tenantId, incidentIds, userId }
    );
    return response.data;
  }

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(
    tenantId: string,
    incidentIds: string[],
    status: string
  ): Promise<{ successCount: number; failureCount: number }> {
    const response = await this.client.post<{ successCount: number; failureCount: number }>(
      '/api/tenant/incidents/bulk-status',
      { tenantId, incidentIds, status }
    );
    return response.data;
  }
}

// Export singleton instance
export const incidentsService = new IncidentsService();
