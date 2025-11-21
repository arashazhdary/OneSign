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
}

// Export singleton instance
export const copilotService = new CopilotService();
