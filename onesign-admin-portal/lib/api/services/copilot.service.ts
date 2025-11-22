import { ApiClient, apiClient } from '../api-client';
import {
  CopilotConversation,
  CopilotMessage,
  CopilotQueryRequest,
  CopilotQueryResponse,
  CopilotSuggestion,
  CopilotInsight,
  CopilotAnalysisRequest,
  CopilotAnalysisResponse,
} from '../types/copilot';

/**
 * Copilot Service
 * Handles all AI-powered copilot operations
 */
export class CopilotService {
  constructor(private client: ApiClient = apiClient) {}

  // Conversations

  /**
   * Get user conversations
   */
  async getConversations(tenantId: string, userId: string): Promise<CopilotConversation[]> {
    const response = await this.client.get<CopilotConversation[]>('/api/tenant/copilot/conversations', {
      tenantId,
      userId,
    });
    return response.data;
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(
    tenantId: string,
    conversationId: string
  ): Promise<CopilotConversation> {
    const response = await this.client.get<CopilotConversation>(
      `/api/tenant/copilot/conversations/${conversationId}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Create new conversation
   */
  async createConversation(
    tenantId: string,
    userId: string,
    title?: string,
    context?: string
  ): Promise<CopilotConversation> {
    const response = await this.client.post<CopilotConversation>(
      '/api/tenant/copilot/conversations',
      { tenantId, userId, title, context }
    );
    return response.data;
  }

  /**
   * Delete conversation
   */
  async deleteConversation(tenantId: string, conversationId: string): Promise<void> {
    await this.client.delete(`/api/tenant/copilot/conversations/${conversationId}`, {
      params: { tenantId },
    });
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(
    tenantId: string,
    conversationId: string,
    title: string
  ): Promise<CopilotConversation> {
    const response = await this.client.put<CopilotConversation>(
      `/api/tenant/copilot/conversations/${conversationId}`,
      { tenantId, title }
    );
    return response.data;
  }

  // Messages & Queries

  /**
   * Send query to copilot
   */
  async sendQuery(data: CopilotQueryRequest): Promise<CopilotQueryResponse> {
    const response = await this.client.post<CopilotQueryResponse>(
      '/api/tenant/copilot/query',
      data
    );
    return response.data;
  }

  /**
   * Get conversation messages
   */
  async getMessages(tenantId: string, conversationId: string): Promise<CopilotMessage[]> {
    const response = await this.client.get<CopilotMessage[]>(
      `/api/tenant/copilot/conversations/${conversationId}/messages`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Regenerate response
   */
  async regenerateResponse(
    tenantId: string,
    conversationId: string,
    messageId: string
  ): Promise<CopilotQueryResponse> {
    const response = await this.client.post<CopilotQueryResponse>(
      `/api/tenant/copilot/conversations/${conversationId}/messages/${messageId}/regenerate`,
      { tenantId }
    );
    return response.data;
  }

  // Suggestions

  /**
   * Get suggestions
   */
  async getSuggestions(tenantId: string, context?: string): Promise<CopilotSuggestion[]> {
    const response = await this.client.get<CopilotSuggestion[]>(
      '/api/tenant/copilot/suggestions',
      { tenantId, context }
    );
    return response.data;
  }

  // Insights

  /**
   * Get insights
   */
  async getInsights(tenantId: string, type?: string): Promise<CopilotInsight[]> {
    const response = await this.client.get<CopilotInsight[]>('/api/tenant/copilot/insights', {
      tenantId,
      type,
    });
    return response.data;
  }

  /**
   * Get insight by ID
   */
  async getInsightById(tenantId: string, insightId: string): Promise<CopilotInsight> {
    const response = await this.client.get<CopilotInsight>(
      `/api/tenant/copilot/insights/${insightId}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Dismiss insight
   */
  async dismissInsight(tenantId: string, insightId: string): Promise<void> {
    await this.client.post(`/api/tenant/copilot/insights/${insightId}/dismiss`, { tenantId });
  }

  // Analysis

  /**
   * Request analysis
   */
  async requestAnalysis(data: CopilotAnalysisRequest): Promise<CopilotAnalysisResponse> {
    const response = await this.client.post<CopilotAnalysisResponse>(
      '/api/tenant/copilot/analyze',
      data
    );
    return response.data;
  }

  /**
   * Get analysis by ID
   */
  async getAnalysis(tenantId: string, analysisId: string): Promise<CopilotAnalysisResponse> {
    const response = await this.client.get<CopilotAnalysisResponse>(
      `/api/tenant/copilot/analyses/${analysisId}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Get past analyses
   */
  async getAnalyses(tenantId: string, type?: string): Promise<CopilotAnalysisResponse[]> {
    const response = await this.client.get<CopilotAnalysisResponse[]>(
      '/api/tenant/copilot/analyses',
      { tenantId, type }
    );
    return response.data;
  }

  // Feedback

  /**
   * Submit feedback on response
   */
  async submitFeedback(
    tenantId: string,
    messageId: string,
    rating: 'positive' | 'negative',
    comment?: string
  ): Promise<void> {
    await this.client.post('/api/tenant/copilot/feedback', {
      tenantId,
      messageId,
      rating,
      comment,
    });
  }

  // Global Copilot Management

  /**
   * Get global copilot settings
   */
  async getGlobalSettings(): Promise<any> {
    const response = await this.client.get<any>('/api/global/copilot/settings');
    return response.data;
  }

  /**
   * Update global copilot settings
   */
  async updateGlobalSettings(data: any): Promise<any> {
    const response = await this.client.put<any>('/api/global/copilot/settings', data);
    return response.data;
  }

  /**
   * Get global copilot analytics
   */
  async getGlobalAnalytics(): Promise<any> {
    const response = await this.client.get<any>('/api/global/copilot/analytics');
    return response.data;
  }

  /**
   * Get global copilot conversations
   */
  async getGlobalConversations(params: { page: number; pageSize: number }): Promise<any> {
    const response = await this.client.get<any>('/api/global/copilot/conversations', params);
    return response.data;
  }

  /**
   * Get global conversation by ID
   */
  async getGlobalConversation(conversationId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/copilot/conversations/${conversationId}`);
    return response.data;
  }

  /**
   * Get global platform insights
   */
  async getGlobalPlatformInsights(): Promise<any> {
    const response = await this.client.get<any>('/api/global/copilot/platform-insights');
    return response.data;
  }

  /**
   * Get global recommendations
   */
  async getGlobalRecommendations(): Promise<any> {
    const response = await this.client.get<any>('/api/global/copilot/recommendations');
    return response.data;
  }

  /**
   * Get global alerts
   */
  async getGlobalAlerts(): Promise<any> {
    const response = await this.client.get<any>('/api/global/copilot/alerts');
    return response.data;
  }

  /**
   * Acknowledge global alert
   */
  async acknowledgeGlobalAlert(alertId: string): Promise<void> {
    await this.client.post(`/api/global/copilot/alerts/${alertId}/acknowledge`);
  }

  /**
   * Get knowledge base status
   */
  async getKnowledgeBaseStatus(): Promise<any> {
    const response = await this.client.get<any>('/api/global/copilot/knowledge-base/status');
    return response.data;
  }

  /**
   * Analyze all tenants
   */
  async analyzeTenants(data?: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/copilot/analyze-tenants', data || {});
    return response.data;
  }

  /**
   * Execute global query
   */
  async executeGlobalQuery(query: string): Promise<any> {
    const response = await this.client.post<any>('/api/global/copilot/query', { query });
    return response.data;
  }

  /**
   * Execute global action
   */
  async executeGlobalAction(command: string): Promise<any> {
    const response = await this.client.post<any>('/api/global/copilot/actions/execute', { command });
    return response.data;
  }
}

// Export singleton instance
export const copilotService = new CopilotService();
