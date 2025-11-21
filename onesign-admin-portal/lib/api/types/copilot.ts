/**
 * AI Copilot related types
 */

export interface CopilotConversation {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  context: string;
  createdAt: string;
  updatedAt: string;
  messages: CopilotMessage[];
}

export interface CopilotMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CopilotQueryRequest {
  tenantId: string;
  userId: string;
  conversationId?: string;
  query: string;
  context?: string;
  includeContext?: boolean;
}

export interface CopilotQueryResponse {
  conversationId: string;
  messageId: string;
  response: string;
  suggestions?: string[];
  relatedResources?: CopilotResource[];
  confidence?: number;
}

export interface CopilotResource {
  type: string;
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface CopilotSuggestion {
  id: string;
  type: 'query' | 'action' | 'insight';
  title: string;
  description: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface CopilotInsight {
  id: string;
  tenantId: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actionable: boolean;
  suggestedActions?: string[];
  generatedAt: string;
  metadata?: Record<string, any>;
}

export interface CopilotAnalysisRequest {
  tenantId: string;
  analysisType: 'risk' | 'compliance' | 'usage' | 'anomaly';
  scope?: string;
  parameters?: Record<string, any>;
}

export interface CopilotAnalysisResponse {
  analysisId: string;
  status: 'completed' | 'pending' | 'failed';
  results: {
    summary: string;
    findings: CopilotFinding[];
    recommendations: string[];
    visualizations?: any[];
  };
  generatedAt: string;
}

export interface CopilotFinding {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string[];
  impact?: string;
  recommendation?: string;
}
