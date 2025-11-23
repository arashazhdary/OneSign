import { ApiClient, apiClient } from '../api-client';

/**
 * Observability Service
 * Handles all observability operations including logs, traces, and metrics
 */
export class ObservabilityService {
  constructor(private client: ApiClient = apiClient) {}

  // Logs Management

  /**
   * Get system logs
   */
  async getLogs(filters?: {
    level?: string;
    service?: string;
    search?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    const response = await this.client.get<any>('/api/global/observability/logs', filters);
    return response.data;
  }

  /**
   * Stream logs
   */
  async streamLogs(filters?: {
    level?: string;
    service?: string;
    search?: string;
  }): Promise<any> {
    const response = await this.client.get<any>('/api/global/observability/logs/stream', filters);
    return response.data;
  }

  /**
   * Export logs
   */
  async exportLogs(filters?: {
    level?: string;
    service?: string;
    search?: string;
    startTime?: string;
    endTime?: string;
    format?: string;
  }): Promise<Blob> {
    const response = await this.client.get<any>('/api/global/observability/logs/export', {
      ...filters,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Get log details
   */
  async getLogDetails(logId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/observability/logs/${logId}`);
    return response.data;
  }

  // Traces Management

  /**
   * Get distributed traces
   */
  async getTraces(filters?: {
    service?: string;
    operation?: string;
    minDuration?: number;
    maxDuration?: number;
    startTime?: string;
    endTime?: string;
  }): Promise<any> {
    const response = await this.client.get<any>('/api/global/observability/traces', filters);
    return response.data;
  }

  /**
   * Get trace details
   */
  async getTraceDetails(traceId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/observability/traces/${traceId}`);
    return response.data;
  }

  // Metrics Management

  /**
   * Get metrics
   */
  async getMetrics(metric: string, filters?: {
    service?: string;
    startTime?: string;
    endTime?: string;
    interval?: string;
  }): Promise<any> {
    const response = await this.client.get<any>(`/api/global/observability/metrics/${metric}`, filters);
    return response.data;
  }

  /**
   * Get available metrics
   */
  async getAvailableMetrics(): Promise<string[]> {
    const response = await this.client.get<string[]>('/api/global/observability/metrics');
    return response.data;
  }

  // Services

  /**
   * Get monitored services
   */
  async getServices(): Promise<string[]> {
    const response = await this.client.get<string[]>('/api/global/observability/services');
    return response.data;
  }
}

// Export singleton instance
export const observabilityService = new ObservabilityService();
