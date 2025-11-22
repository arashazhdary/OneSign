const API_BASE = 'http://localhost:7000';

export interface AutomationWorkflowDto {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  scopeType: string;
  isTemplate: boolean;
  isEnabled: boolean;
  severity: string;
  isEnforced: boolean;
  tenantCanDisable: boolean;
  tenantCanOverrideConditions: boolean;
  createdAt: string;
  createdByUserId: string;
  updatedAt?: string;
  updatedByUserId?: string;
  triggers: AutomationTriggerDto[];
  conditions: AutomationConditionDto[];
  actions: AutomationActionDto[];
}

export interface AutomationTriggerDto {
  id: string;
  eventType: string;
  sourceModule: string;
}

export interface AutomationConditionDto {
  id: string;
  expressionType: string;
  expression: string;
  order: number;
}

export interface AutomationActionDto {
  id: string;
  actionType: string;
  order: number;
  configJson: string;
  isCritical: boolean;
}

export interface AutomationExecutionDto {
  id: string;
  workflowId: string;
  workflowName?: string;
  tenantId: string;
  eventType: string;
  eventId?: string;
  startedAt: string;
  completedAt?: string;
  status: string;
  errorMessage?: string;
  actionsExecutedCount: number;
  actionsFailedCount: number;
  payloadSnapshot: string;
}

export interface WorkflowTestResultDto {
  matched: boolean;
  matchedTriggers: string[];
  conditionsPassed: boolean;
  actionsToExecute: ActionTestResultDto[];
}

export interface ActionTestResultDto {
  actionType: string;
  order: number;
  isCritical: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export async function getWorkflows(tenantId: string): Promise<AutomationWorkflowDto[]> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/workflows?tenantId=${tenantId}`);
  if (!response.ok) throw new Error('Failed to fetch workflows');
  return response.json();
}

export async function getWorkflow(id: string, tenantId: string): Promise<AutomationWorkflowDto> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/workflows/${id}?tenantId=${tenantId}`);
  if (!response.ok) throw new Error('Failed to fetch workflow');
  return response.json();
}

export async function createWorkflow(data: {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  severity: string;
  isEnabled: boolean;
  triggers: { eventType: string; sourceModule: string }[];
  conditions: { expressionType: string; expression: string; order: number }[];
  actions: { actionType: string; order: number; configJson: string; isCritical: boolean }[];
}): Promise<AutomationWorkflowDto> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create workflow');
  return response.json();
}

export async function updateWorkflow(id: string, data: {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  severity: string;
  isEnabled: boolean;
  triggers: { eventType: string; sourceModule: string }[];
  conditions: { expressionType: string; expression: string; order: number }[];
  actions: { actionType: string; order: number; configJson: string; isCritical: boolean }[];
}): Promise<AutomationWorkflowDto> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update workflow');
  return response.json();
}

export async function deleteWorkflow(id: string, tenantId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/workflows/${id}?tenantId=${tenantId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete workflow');
}

export async function enableWorkflow(id: string, tenantId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/workflows/${id}/enable?tenantId=${tenantId}&userId=${userId}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to enable workflow');
}

export async function disableWorkflow(id: string, tenantId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/workflows/${id}/disable?tenantId=${tenantId}&userId=${userId}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to disable workflow');
}

export async function testWorkflow(id: string, tenantId: string, testPayloadJson: string): Promise<WorkflowTestResultDto> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/workflows/${id}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, testPayloadJson }),
  });
  if (!response.ok) throw new Error('Failed to test workflow');
  return response.json();
}

export async function getExecutions(
  tenantId: string,
  params?: {
    workflowId?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PaginatedResult<AutomationExecutionDto>> {
  const searchParams = new URLSearchParams({ tenantId });
  if (params?.workflowId) searchParams.append('workflowId', params.workflowId);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.from) searchParams.append('from', params.from);
  if (params?.to) searchParams.append('to', params.to);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`${API_BASE}/api/tenant/automation/executions?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch executions');
  return response.json();
}

export async function getAvailableTemplates(): Promise<AutomationWorkflowDto[]> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/templates`);
  if (!response.ok) throw new Error('Failed to fetch templates');
  return response.json();
}

export async function cloneTemplate(templateId: string, tenantId: string, userId: string, customName?: string): Promise<AutomationWorkflowDto> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/templates/${templateId}/clone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, userId, customName }),
  });
  if (!response.ok) throw new Error('Failed to clone template');
  return response.json();
}

// Global API functions
export async function getGlobalTemplates(): Promise<AutomationWorkflowDto[]> {
  const response = await fetch(`${API_BASE}/api/global/automation/templates`);
  if (!response.ok) throw new Error('Failed to fetch global templates');
  return response.json();
}

export async function createGlobalTemplate(data: {
  userId: string;
  name: string;
  description?: string;
  severity: string;
  tenantCanDisable: boolean;
  tenantCanOverrideConditions: boolean;
  triggers: { eventType: string; sourceModule: string }[];
  conditions: { expressionType: string; expression: string; order: number }[];
  actions: { actionType: string; order: number; configJson: string; isCritical: boolean }[];
}): Promise<AutomationWorkflowDto> {
  const response = await fetch(`${API_BASE}/api/global/automation/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create global template');
  return response.json();
}

export async function publishTemplate(id: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/automation/templates/${id}/publish?userId=${userId}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to publish template');
}

export async function enforceTemplate(id: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/automation/templates/${id}/enforce?userId=${userId}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to enforce template');
}

export async function unenforceTemplate(id: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/automation/templates/${id}/unenforce?userId=${userId}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to unenforce template');
}

export async function getGlobalTemplate(id: string): Promise<AutomationWorkflowDto> {
  const response = await fetch(`${API_BASE}/api/global/automation/templates/${id}`);
  if (!response.ok) throw new Error('Failed to fetch global template');
  return response.json();
}

export async function updateGlobalTemplate(id: string, data: {
  userId: string;
  name: string;
  description?: string;
  severity: string;
  tenantCanDisable: boolean;
  tenantCanOverrideConditions: boolean;
  triggers: { eventType: string; sourceModule: string }[];
  conditions: { expressionType: string; expression: string; order: number }[];
  actions: { actionType: string; order: number; configJson: string; isCritical: boolean }[];
}): Promise<AutomationWorkflowDto> {
  const response = await fetch(`${API_BASE}/api/global/automation/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update global template');
  return response.json();
}

export async function deleteGlobalTemplate(id: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/automation/templates/${id}?userId=${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete global template');
}

export const EVENT_TYPES = [
  'Auth.SignInSucceeded',
  'Auth.SignInFailed',
  'Auth.HighRiskSignInDetected',
  'AccessRequest.Created',
  'AccessRequest.Approved',
  'Lifecycle.LeaverDetected',
  'PrivilegedAccess.BreakGlassUsed',
  'Insights.TenantRiskScoreHigh',
];

export const ACTION_TYPES = [
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

// Additional DTOs
export interface AvailableTrigger {
  eventType: string;
  sourceModule: string;
  description: string;
  samplePayload: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  eventType: string;
  actionsExecutedCount: number;
  actionsFailedCount: number;
  errorMessage?: string;
}

export interface WorkflowExecutionsResult {
  items: WorkflowExecution[];
  totalCount?: number;
}

export interface ExecutionDetail {
  id: string;
  workflowId: string;
  workflowName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  eventType: string;
  eventPayload: string;
  actionsExecuted: {
    actionType: string;
    status: string;
    executedAt: string;
    errorMessage?: string;
  }[];
}

export interface Workflow {
  id?: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
}

export interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  config: Record<string, any>;
  connections: string[];
}

// Additional API functions

export async function getAvailableTriggers(tenantId: string): Promise<AvailableTrigger[]> {
  const response = await fetch(
    `${API_BASE}/api/tenant/automation/triggers/available?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch available triggers');
  return response.json();
}

export async function getWorkflowExecutions(
  tenantId: string,
  workflowId: string
): Promise<WorkflowExecutionsResult> {
  const response = await fetch(
    `${API_BASE}/api/tenant/automation/workflows/${workflowId}/executions?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch workflow executions');
  return response.json();
}

export async function getExecutionDetail(
  tenantId: string,
  workflowId: string,
  executionId: string
): Promise<ExecutionDetail> {
  const response = await fetch(
    `${API_BASE}/api/tenant/automation/workflows/${workflowId}/executions/${executionId}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch execution detail');
  return response.json();
}

export async function testWorkflowWithPayload(
  workflowId: string,
  tenantId: string,
  userId: string
): Promise<{ result: string }> {
  const response = await fetch(
    `${API_BASE}/api/tenant/automation/workflows/${workflowId}/test?tenantId=${tenantId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errorMessage || 'Failed to test workflow');
  }
  return response.json();
}

export async function createTemplate(
  tenantId: string,
  data: {
    name: string;
    description?: string;
    severity: string;
    triggers: { eventType: string; sourceModule: string }[];
    conditions: { expressionType: string; expression: string; order: number }[];
    actions: { actionType: string; order: number; configJson: string; isCritical: boolean }[];
    userId: string;
  }
): Promise<AutomationWorkflowDto> {
  const response = await fetch(`${API_BASE}/api/tenant/automation/templates?tenantId=${tenantId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create template');
  return response.json();
}

// Workflow Designer API functions

export async function getWorkflowsForDesigner(
  tenantId: string
): Promise<{ items: Workflow[] }> {
  const response = await fetch(`${API_BASE}/api/tenant/workflows?tenantId=${tenantId}`);
  if (!response.ok) throw new Error('Failed to fetch workflows');
  return response.json();
}

export async function saveWorkflow(
  workflow: Workflow,
  tenantId: string
): Promise<Workflow> {
  const method = workflow.id ? 'PUT' : 'POST';
  const url = workflow.id
    ? `${API_BASE}/api/tenant/workflows/${workflow.id}?tenantId=${tenantId}`
    : `${API_BASE}/api/tenant/workflows?tenantId=${tenantId}`;

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.errorMessage || 'Failed to save workflow');
  }
  return response.json();
}

export async function testWorkflowDesigner(
  workflow: Workflow,
  tenantId: string
): Promise<any> {
  const response = await fetch(`${API_BASE}/api/tenant/workflows/test?tenantId=${tenantId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.errorMessage || 'Test failed');
  }
  return response.json();
}

export async function deployWorkflow(
  workflowId: string,
  tenantId: string
): Promise<Workflow> {
  const response = await fetch(
    `${API_BASE}/api/tenant/workflows/${workflowId}/deploy?tenantId=${tenantId}`,
    { method: 'POST' }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.errorMessage || 'Failed to deploy workflow');
  }
  return response.json();
}
