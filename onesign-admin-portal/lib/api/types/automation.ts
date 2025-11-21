import { PaginatedResponse, PaginationParams, AuditFields } from './common';

/**
 * Automation and workflows related types
 */

export interface AutomationWorkflow extends AuditFields {
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
  triggers: AutomationTrigger[];
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

export interface AutomationTrigger {
  id: string;
  eventType: string;
  sourceModule: string;
}

export interface AutomationCondition {
  id: string;
  expressionType: string;
  expression: string;
  order: number;
}

export interface AutomationAction {
  id: string;
  actionType: string;
  order: number;
  configJson: string;
  isCritical: boolean;
}

export interface AutomationExecution {
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

export interface WorkflowTestResult {
  matched: boolean;
  matchedTriggers: string[];
  conditionsPassed: boolean;
  actionsToExecute: ActionTestResult[];
}

export interface ActionTestResult {
  actionType: string;
  order: number;
  isCritical: boolean;
}

export interface CreateWorkflowRequest {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  severity: string;
  isEnabled: boolean;
  triggers: Array<{ eventType: string; sourceModule: string }>;
  conditions: Array<{ expressionType: string; expression: string; order: number }>;
  actions: Array<{ actionType: string; order: number; configJson: string; isCritical: boolean }>;
}

export interface UpdateWorkflowRequest {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  severity: string;
  isEnabled: boolean;
  triggers: Array<{ eventType: string; sourceModule: string }>;
  conditions: Array<{ expressionType: string; expression: string; order: number }>;
  actions: Array<{ actionType: string; order: number; configJson: string; isCritical: boolean }>;
}

export interface GetExecutionsParams extends PaginationParams {
  tenantId: string;
  workflowId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface CloneTemplateRequest {
  tenantId: string;
  userId: string;
  customName?: string;
}

export interface CreateGlobalTemplateRequest {
  userId: string;
  name: string;
  description?: string;
  severity: string;
  tenantCanDisable: boolean;
  tenantCanOverrideConditions: boolean;
  triggers: Array<{ eventType: string; sourceModule: string }>;
  conditions: Array<{ expressionType: string; expression: string; order: number }>;
  actions: Array<{ actionType: string; order: number; configJson: string; isCritical: boolean }>;
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
] as const;

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
] as const;
