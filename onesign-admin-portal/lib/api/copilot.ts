import { API_BASE } from './config/api-config';

// Enums
export type ContextType = 'Dashboard' | 'Incident' | 'Policy' | 'ChangeSet' | 'Hunting' | 'Automation' | 'Generic';
export type SuggestedActionType = 'OpenIncident' | 'OpenUser' | 'OpenApp' | 'OpenChangeSet' | 'OpenHunt' | 'CreateAutomationDraft' | 'CreateHuntDraft' | 'NavigateTo';

// DTOs
export interface CopilotQueryResponse {
  conversationId: string;
  messageId: string;
  response: string;
  suggestedActions: SuggestedActionDto[];
  confidence: number;
  sources?: SourceReferenceDto[];
  followUpQuestions?: string[];
}

export interface SuggestedActionDto {
  type: SuggestedActionType;
  label: string;
  description?: string;
  parameters: Record<string, string>;
  priority: number;
}

export interface SourceReferenceDto {
  type: string;
  title: string;
  url?: string;
  snippet?: string;
}

export interface ConversationHistoryDto {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  contextType: ContextType;
  contextId?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages: ConversationMessageDto[];
}

export interface ConversationMessageDto {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  timestamp: string;
  suggestedActions?: SuggestedActionDto[];
  metadata?: string;
}

export interface ActionExecutionResultDto {
  success: boolean;
  resultUrl?: string;
  resultId?: string;
  message?: string;
  errorDetails?: string;
}

export interface GlobalCopilotAnalyticsDto {
  totalConversations: number;
  totalQueries: number;
  uniqueUsers: number;
  topContextTypes: ContextTypeUsageDto[];
  actionExecutionStats: ActionExecutionStatDto[];
  tenantUsage: TenantCopilotUsageDto[];
}

export interface ContextTypeUsageDto {
  contextType: string;
  count: number;
  percentage: number;
}

export interface ActionExecutionStatDto {
  actionType: string;
  totalExecutions: number;
  successCount: number;
  failureCount: number;
}

export interface TenantCopilotUsageDto {
  tenantId: string;
  tenantName: string;
  queryCount: number;
  uniqueUsers: number;
}

export interface KnowledgeBaseStatusDto {
  isHealthy: boolean;
  lastUpdated: string;
  documentCount: number;
  indexSize: string;
  embeddingsModel: string;
  lastSyncStatus: string;
}

// Tenant API functions

export async function sendQuery(
  tenantId: string,
  userId: string,
  data: {
    contextType?: string;
    contextId?: string;
    message: string;
    locale?: string;
    conversationId?: string;
  }
): Promise<CopilotQueryResponse> {
  const response = await fetch(`${API_BASE}/api/tenant/copilot/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId,
      userId,
      contextType: data.contextType || 'Generic',
      contextId: data.contextId,
      message: data.message,
      locale: data.locale || 'en',
      conversationId: data.conversationId,
    }),
  });
  if (!response.ok) throw new Error('Failed to send query to Copilot');
  return response.json();
}

export async function getConversations(
  tenantId: string,
  userId: string,
  limit: number = 10
): Promise<ConversationHistoryDto[]> {
  const searchParams = new URLSearchParams({
    tenantId,
    userId,
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE}/api/tenant/copilot/conversations?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch conversations');
  return response.json();
}

export async function getConversation(
  id: string,
  tenantId: string,
  userId: string
): Promise<ConversationHistoryDto> {
  const searchParams = new URLSearchParams({ tenantId, userId });

  const response = await fetch(`${API_BASE}/api/tenant/copilot/conversations/${id}?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch conversation');
  return response.json();
}

export async function executeAction(
  tenantId: string,
  userId: string,
  data: {
    actionType: string;
    parameters: Record<string, string>;
  }
): Promise<ActionExecutionResultDto> {
  const response = await fetch(`${API_BASE}/api/tenant/copilot/actions/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId,
      userId,
      actionType: data.actionType,
      parameters: data.parameters,
    }),
  });
  if (!response.ok) throw new Error('Failed to execute action');
  return response.json();
}

// Global API functions

export async function sendGlobalQuery(
  userId: string,
  data: {
    tenantId?: string;
    contextType?: string;
    contextId?: string;
    message: string;
    locale?: string;
    conversationId?: string;
  }
): Promise<CopilotQueryResponse> {
  const response = await fetch(`${API_BASE}/api/global/copilot/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId: data.tenantId,
      userId,
      contextType: data.contextType || 'Generic',
      contextId: data.contextId,
      message: data.message,
      locale: data.locale || 'en',
      conversationId: data.conversationId,
    }),
  });
  if (!response.ok) throw new Error('Failed to send global query to Copilot');
  return response.json();
}

export async function getGlobalConversations(
  userId: string,
  params?: {
    tenantId?: string;
    limit?: number;
  }
): Promise<ConversationHistoryDto[]> {
  const searchParams = new URLSearchParams({ userId });
  if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE}/api/global/copilot/conversations?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global conversations');
  return response.json();
}

export async function getGlobalConversation(
  id: string,
  userId: string,
  tenantId?: string
): Promise<ConversationHistoryDto> {
  const searchParams = new URLSearchParams({ userId });
  if (tenantId) searchParams.append('tenantId', tenantId);

  const response = await fetch(`${API_BASE}/api/global/copilot/conversations/${id}?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch global conversation');
  return response.json();
}

export async function executeGlobalAction(
  userId: string,
  data: {
    actionType: string;
    parameters: Record<string, string>;
    tenantId?: string;
  }
): Promise<ActionExecutionResultDto> {
  const response = await fetch(`${API_BASE}/api/global/copilot/actions/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId: data.tenantId,
      userId,
      actionType: data.actionType,
      parameters: data.parameters,
    }),
  });
  if (!response.ok) throw new Error('Failed to execute global action');
  return response.json();
}

export async function getCopilotAnalytics(params?: {
  from?: string;
  to?: string;
}): Promise<GlobalCopilotAnalyticsDto> {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.append('from', params.from);
  if (params?.to) searchParams.append('to', params.to);

  const response = await fetch(`${API_BASE}/api/global/copilot/analytics?${searchParams}`);
  if (!response.ok) throw new Error('Failed to fetch Copilot analytics');
  return response.json();
}

export async function getKnowledgeBaseStatus(): Promise<KnowledgeBaseStatusDto> {
  const response = await fetch(`${API_BASE}/api/global/copilot/knowledge-base/status`);
  if (!response.ok) throw new Error('Failed to fetch knowledge base status');
  return response.json();
}

// Constants
export const CONTEXT_TYPES: ContextType[] = [
  'Dashboard',
  'Incident',
  'Policy',
  'ChangeSet',
  'Hunting',
  'Automation',
  'Generic',
];

export const SUGGESTED_ACTION_TYPES: SuggestedActionType[] = [
  'OpenIncident',
  'OpenUser',
  'OpenApp',
  'OpenChangeSet',
  'OpenHunt',
  'CreateAutomationDraft',
  'CreateHuntDraft',
  'NavigateTo',
];

export const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'fa', label: 'Persian' },
];

// Helper functions

export function buildConversationTitle(contextType: ContextType, message: string): string {
  const maxLength = 50;
  const prefix = contextType !== 'Generic' ? `[${contextType}] ` : '';
  const truncatedMessage = message.length > maxLength - prefix.length
    ? message.substring(0, maxLength - prefix.length - 3) + '...'
    : message;
  return prefix + truncatedMessage;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export function getActionIcon(actionType: SuggestedActionType): string {
  const icons: Record<SuggestedActionType, string> = {
    OpenIncident: 'alert-circle',
    OpenUser: 'user',
    OpenApp: 'app-window',
    OpenChangeSet: 'git-branch',
    OpenHunt: 'search',
    CreateAutomationDraft: 'zap',
    CreateHuntDraft: 'crosshair',
    NavigateTo: 'external-link',
  };
  return icons[actionType] || 'link';
}
