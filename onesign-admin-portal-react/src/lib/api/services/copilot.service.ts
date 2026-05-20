import apiClient from '@/services/apiClient';

export type CopilotScope = 'tenant' | 'global';

export interface CopilotQueryRequest {
  message: string;
  contextType: string;
  contextId?: string;
  conversationId?: string;
  locale?: string;
}

export interface CopilotSuggestedAction {
  type: string;
  label: string;
  parameters?: Record<string, string>;
}

export interface CopilotQueryResult {
  conversationId: string;
  messageId: string;
  answerText: string;
  suggestedActions: CopilotSuggestedAction[];
}

const scopePrefix = (scope: CopilotScope) =>
  scope === 'global' ? '/api/global/copilot' : '/api/tenant/copilot';

export const copilotService = {
  sendQuery: async (scope: CopilotScope, request: CopilotQueryRequest): Promise<CopilotQueryResult> => {
    const response = await apiClient.post(`${scopePrefix(scope)}/query`, {
      message: request.message,
      contextType: request.contextType,
      contextId: request.contextId || undefined,
      conversationId: request.conversationId || undefined,
      locale: request.locale || 'en',
    });
    const data = response.data;
    return {
      conversationId: data.conversationId,
      messageId: data.messageId,
      answerText: data.answerText ?? data.response ?? '',
      suggestedActions: (data.suggestedActions ?? []).map((a: any) => ({
        type: a.type ?? a.actionType ?? '',
        label: a.label ?? String(a.type ?? ''),
        parameters: a.parameters ?? {},
      })),
    };
  },

  getConversations: async (scope: CopilotScope, limit = 10) => {
    try {
      const response = await apiClient.get(`${scopePrefix(scope)}/conversations`, {
        params: { limit },
      });
      return response.data ?? [];
    } catch (error) {
      console.error('Failed to fetch copilot conversations:', error);
      return [];
    }
  },

  getConversation: async (scope: CopilotScope, conversationId: string) => {
    try {
      const response = await apiClient.get(`${scopePrefix(scope)}/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch copilot conversation:', error);
      return null;
    }
  },

  executeAction: async (
    scope: CopilotScope,
    actionType: string,
    parameters: Record<string, string> = {}
  ) => {
    const response = await apiClient.post(`${scopePrefix(scope)}/actions/execute`, {
      actionType,
      parameters,
    });
    return response.data;
  },

  // Legacy aliases (tenant)
  query: async (message: string, options?: Partial<CopilotQueryRequest>) =>
    copilotService.sendQuery('tenant', {
      message,
      contextType: options?.contextType ?? 'Generic',
      contextId: options?.contextId,
      conversationId: options?.conversationId,
      locale: options?.locale,
    }),

  getConversationHistory: async () => copilotService.getConversations('tenant'),

  // ==================== GLOBAL COPILOT METHODS ====================
  getGlobalSettings: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to get global copilot settings:', error);
      return null;
    }
  },

  updateGlobalSettings: async (settings: any) => {
    const response = await apiClient.put('/api/global/copilot/settings', settings);
    return response.data;
  },

  getGlobalAnalytics: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to get global copilot analytics:', error);
      return null;
    }
  },

  getGlobalConversations: async (params?: any) => {
    try {
      const response = await apiClient.get('/api/global/copilot/conversations', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get global conversations:', error);
      return [];
    }
  },

  getGlobalConversation: async (conversationId: string) => {
    try {
      const response = await apiClient.get(`/api/global/copilot/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get global conversation:', error);
      return null;
    }
  },

  getGlobalPlatformInsights: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/insights');
      return response.data;
    } catch (error) {
      console.error('Failed to get platform insights:', error);
      return [];
    }
  },

  getGlobalRecommendations: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/recommendations');
      return response.data;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      return [];
    }
  },

  getGlobalAlerts: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/alerts');
      return response.data;
    } catch (error) {
      console.error('Failed to get copilot alerts:', error);
      return [];
    }
  },

  acknowledgeGlobalAlert: async (alertId: string) => {
    const response = await apiClient.post(`/api/global/copilot/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  getKnowledgeBaseStatus: async () => {
    try {
      const response = await apiClient.get('/api/global/copilot/knowledge-base/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get knowledge base status:', error);
      return null;
    }
  },

  analyzeTenants: async (query: string, options?: any) => {
    try {
      const response = await apiClient.post('/api/global/copilot/analyze-tenants', { query, ...options });
      return response.data;
    } catch (error) {
      console.error('Failed to analyze tenants:', error);
      return null;
    }
  },

  executeGlobalQuery: async (query: string) => {
    try {
      const response = await apiClient.post('/api/global/copilot/query', { query });
      return response.data;
    } catch (error) {
      console.error('Failed to execute global query:', error);
      throw error;
    }
  },

  executeGlobalAction: async (action: string, params?: any) => {
    try {
      const response = await apiClient.post('/api/global/copilot/actions', { action, params });
      return response.data;
    } catch (error) {
      console.error('Failed to execute global action:', error);
      throw error;
    }
  },
};

export default copilotService;
