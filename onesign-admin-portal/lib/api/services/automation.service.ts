import { ApiClient, apiClient } from '../api-client';
import { PaginatedResponse } from '../types/common';
import {
  AutomationWorkflow,
  AutomationExecution,
  WorkflowTestResult,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  GetExecutionsParams,
  CloneTemplateRequest,
  CreateGlobalTemplateRequest,
} from '../types/automation';

/**
 * Automation Service
 * Handles all automation and workflow operations
 */
export class AutomationService {
  constructor(private client: ApiClient = apiClient) {}

  // Tenant Workflows

  /**
   * Get workflows
   */
  async getWorkflows(tenantId: string): Promise<AutomationWorkflow[]> {
    const response = await this.client.get<AutomationWorkflow[]>(
      '/api/tenant/automation/workflows',
      { tenantId }
    );
    return response.data;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: string, tenantId: string): Promise<AutomationWorkflow> {
    const response = await this.client.get<AutomationWorkflow>(
      `/api/tenant/automation/workflows/${id}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Create workflow
   */
  async createWorkflow(data: CreateWorkflowRequest): Promise<AutomationWorkflow> {
    const response = await this.client.post<AutomationWorkflow>(
      '/api/tenant/automation/workflows',
      data
    );
    return response.data;
  }

  /**
   * Update workflow
   */
  async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<AutomationWorkflow> {
    const response = await this.client.put<AutomationWorkflow>(
      `/api/tenant/automation/workflows/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: string, tenantId: string): Promise<void> {
    await this.client.delete(`/api/tenant/automation/workflows/${id}`, {
      params: { tenantId },
    });
  }

  /**
   * Enable workflow
   */
  async enableWorkflow(id: string, tenantId: string, userId: string): Promise<void> {
    await this.client.post(`/api/tenant/automation/workflows/${id}/enable`, {
      tenantId,
      userId,
    });
  }

  /**
   * Disable workflow
   */
  async disableWorkflow(id: string, tenantId: string, userId: string): Promise<void> {
    await this.client.post(`/api/tenant/automation/workflows/${id}/disable`, {
      tenantId,
      userId,
    });
  }

  /**
   * Test workflow
   */
  async testWorkflow(
    id: string,
    tenantId: string,
    testPayloadJson: string
  ): Promise<WorkflowTestResult> {
    const response = await this.client.post<WorkflowTestResult>(
      `/api/tenant/automation/workflows/${id}/test`,
      { tenantId, testPayloadJson }
    );
    return response.data;
  }

  // Workflow Executions

  /**
   * Get workflow executions
   */
  async getExecutions(params: GetExecutionsParams): Promise<PaginatedResponse<AutomationExecution>> {
    const response = await this.client.get<PaginatedResponse<AutomationExecution>>(
      '/api/tenant/automation/executions',
      params
    );
    return response.data;
  }

  /**
   * Get execution by ID
   */
  async getExecutionById(tenantId: string, executionId: string): Promise<AutomationExecution> {
    const response = await this.client.get<AutomationExecution>(
      `/api/tenant/automation/executions/${executionId}`,
      { tenantId }
    );
    return response.data;
  }

  // Templates

  /**
   * Get available templates
   */
  async getAvailableTemplates(): Promise<AutomationWorkflow[]> {
    const response = await this.client.get<AutomationWorkflow[]>(
      '/api/tenant/automation/templates'
    );
    return response.data;
  }

  /**
   * Clone template
   */
  async cloneTemplate(
    templateId: string,
    data: CloneTemplateRequest
  ): Promise<AutomationWorkflow> {
    const response = await this.client.post<AutomationWorkflow>(
      `/api/tenant/automation/templates/${templateId}/clone`,
      data
    );
    return response.data;
  }

  // Global Templates (Admin Only)

  /**
   * Get global templates
   */
  async getGlobalTemplates(): Promise<AutomationWorkflow[]> {
    const response = await this.client.get<AutomationWorkflow[]>(
      '/api/global/automation/templates'
    );
    return response.data;
  }

  /**
   * Create global template
   */
  async createGlobalTemplate(data: CreateGlobalTemplateRequest): Promise<AutomationWorkflow> {
    const response = await this.client.post<AutomationWorkflow>(
      '/api/global/automation/templates',
      data
    );
    return response.data;
  }

  /**
   * Publish template
   */
  async publishTemplate(id: string, userId: string): Promise<void> {
    await this.client.post(`/api/global/automation/templates/${id}/publish`, { userId });
  }

  /**
   * Enforce template
   */
  async enforceTemplate(id: string, userId: string): Promise<void> {
    await this.client.post(`/api/global/automation/templates/${id}/enforce`, { userId });
  }

  /**
   * Unenforce template
   */
  async unenforceTemplate(id: string, userId: string): Promise<void> {
    await this.client.post(`/api/global/automation/templates/${id}/unenforce`, { userId });
  }

  // Utility Methods

  /**
   * Get available event types
   */
  getEventTypes(): string[] {
    return [
      'Auth.SignInSucceeded',
      'Auth.SignInFailed',
      'Auth.HighRiskSignInDetected',
      'AccessRequest.Created',
      'AccessRequest.Approved',
      'Lifecycle.LeaverDetected',
      'PrivilegedAccess.BreakGlassUsed',
      'Insights.TenantRiskScoreHigh',
    ];
  }

  /**
   * Get available action types
   */
  getActionTypes(): string[] {
    return [
      'RevokeSessions',
      'RequireMfaNextSignIn',
      'LockUserAccount',
      'DisableAppAccess',
      'TriggerAccessReview',
      'SendEmail',
      'SendToChannel',
      'InvokeWebhook',
      'PushEventToQueue',
    ];
  }
}

// Export singleton instance
export const automationService = new AutomationService();
