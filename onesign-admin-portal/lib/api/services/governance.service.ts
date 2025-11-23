import { ApiClient, apiClient } from '../api-client';
import { PaginatedResponse } from '../types/common';
import {
  ComplianceFramework,
  Policy,
  PolicyViolation,
  ComplianceReport,
  DataClassification,
} from '../types/governance';

/**
 * Governance Service
 * Handles all governance and compliance operations
 */
export class GovernanceService {
  constructor(private client: ApiClient = apiClient) {}

  // Compliance Frameworks

  /**
   * Get compliance frameworks
   */
  async getFrameworks(): Promise<ComplianceFramework[]> {
    const response = await this.client.get<ComplianceFramework[]>(
      '/api/global/governance/frameworks'
    );
    return response.data;
  }

  /**
   * Get framework by ID
   */
  async getFrameworkById(frameworkId: string): Promise<ComplianceFramework> {
    const response = await this.client.get<ComplianceFramework>(
      `/api/global/governance/frameworks/${frameworkId}`
    );
    return response.data;
  }

  // Policies

  /**
   * Get policies
   */
  async getPolicies(tenantId?: string): Promise<Policy[]> {
    const endpoint = tenantId ? '/api/tenant/governance/policies' : '/api/global/governance/policies';
    const response = await this.client.get<Policy[]>(endpoint, { tenantId });
    return response.data;
  }

  /**
   * Get policy by ID
   */
  async getPolicyById(policyId: string, tenantId?: string): Promise<Policy> {
    const endpoint = tenantId
      ? `/api/tenant/governance/policies/${policyId}`
      : `/api/global/governance/policies/${policyId}`;
    const response = await this.client.get<Policy>(endpoint, { tenantId });
    return response.data;
  }

  /**
   * Create policy
   */
  async createPolicy(data: Partial<Policy>): Promise<Policy> {
    const endpoint = data.tenantId
      ? '/api/tenant/governance/policies'
      : '/api/global/governance/policies';
    const response = await this.client.post<Policy>(endpoint, data);
    return response.data;
  }

  /**
   * Update policy
   */
  async updatePolicy(policyId: string, data: Partial<Policy>, tenantId?: string): Promise<Policy> {
    const endpoint = tenantId
      ? `/api/tenant/governance/policies/${policyId}`
      : `/api/global/governance/policies/${policyId}`;
    const response = await this.client.put<Policy>(endpoint, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete policy
   */
  async deletePolicy(policyId: string, tenantId?: string): Promise<void> {
    const endpoint = tenantId
      ? `/api/tenant/governance/policies/${policyId}`
      : `/api/global/governance/policies/${policyId}`;
    await this.client.delete(endpoint, { params: { tenantId } });
  }

  /**
   * Publish policy
   */
  async publishPolicy(policyId: string, tenantId?: string): Promise<void> {
    const endpoint = tenantId
      ? `/api/tenant/governance/policies/${policyId}/publish`
      : `/api/global/governance/policies/${policyId}/publish`;
    await this.client.post(endpoint, { tenantId });
  }

  // Policy Violations

  /**
   * Get policy violations
   */
  async getViolations(tenantId: string, status?: string): Promise<PolicyViolation[]> {
    const response = await this.client.get<PolicyViolation[]>(
      '/api/tenant/governance/violations',
      { tenantId, status }
    );
    return response.data;
  }

  /**
   * Get violation by ID
   */
  async getViolationById(tenantId: string, violationId: string): Promise<PolicyViolation> {
    const response = await this.client.get<PolicyViolation>(
      `/api/tenant/governance/violations/${violationId}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Resolve violation
   */
  async resolveViolation(
    tenantId: string,
    violationId: string,
    resolution: string
  ): Promise<void> {
    await this.client.post(`/api/tenant/governance/violations/${violationId}/resolve`, {
      tenantId,
      resolution,
    });
  }

  // Compliance Reports

  /**
   * Get compliance reports
   */
  async getReports(tenantId: string, status?: string): Promise<ComplianceReport[]> {
    const response = await this.client.get<ComplianceReport[]>(
      '/api/tenant/governance/reports',
      { tenantId, status }
    );
    return response.data;
  }

  /**
   * Get report by ID
   */
  async getReportById(tenantId: string, reportId: string): Promise<ComplianceReport> {
    const response = await this.client.get<ComplianceReport>(
      `/api/tenant/governance/reports/${reportId}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Generate compliance report
   */
  async generateReport(
    tenantId: string,
    framework: string,
    from: string,
    to: string
  ): Promise<ComplianceReport> {
    const response = await this.client.post<ComplianceReport>(
      '/api/tenant/governance/reports/generate',
      { tenantId, framework, from, to }
    );
    return response.data;
  }

  /**
   * Approve report
   */
  async approveReport(tenantId: string, reportId: string): Promise<void> {
    await this.client.post(`/api/tenant/governance/reports/${reportId}/approve`, { tenantId });
  }

  /**
   * Publish report
   */
  async publishReport(tenantId: string, reportId: string): Promise<void> {
    await this.client.post(`/api/tenant/governance/reports/${reportId}/publish`, { tenantId });
  }

  /**
   * Export report
   */
  async exportReport(
    tenantId: string,
    reportId: string,
    format: 'pdf' | 'xlsx' | 'json'
  ): Promise<Blob> {
    const response = await this.client.get<Blob>(
      `/api/tenant/governance/reports/${reportId}/export`,
      { tenantId, format }
    );
    return response.data;
  }

  // Data Classification

  /**
   * Get data classifications
   */
  async getDataClassifications(): Promise<DataClassification[]> {
    const response = await this.client.get<DataClassification[]>(
      '/api/global/governance/data-classifications'
    );
    return response.data;
  }

  /**
   * Create data classification
   */
  async createDataClassification(data: Partial<DataClassification>): Promise<DataClassification> {
    const response = await this.client.post<DataClassification>(
      '/api/global/governance/data-classifications',
      data
    );
    return response.data;
  }

  /**
   * Update data classification
   */
  async updateDataClassification(
    classificationId: string,
    data: Partial<DataClassification>
  ): Promise<DataClassification> {
    const response = await this.client.put<DataClassification>(
      `/api/global/governance/data-classifications/${classificationId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete data classification
   */
  async deleteDataClassification(classificationId: string): Promise<void> {
    await this.client.delete(`/api/global/governance/data-classifications/${classificationId}`);
  }

  // Access Review Campaigns

  /**
   * Get access review campaigns
   */
  async getCampaigns(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/governance/campaigns', { tenantId });
    return response.data;
  }

  /**
   * Create access review campaign
   */
  async createCampaign(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/governance/campaigns', { ...data, tenantId });
    return response.data;
  }

  // Audit Search

  /**
   * Search global audit logs
   */
  async searchGlobalAudit(data: any): Promise<any> {
    const response = await this.client.post<any>('/api/global/observability/audit/search', data);
    return response.data;
  }

  /**
   * Get global audit event by ID
   */
  async getGlobalAuditEvent(id: string): Promise<any> {
    const response = await this.client.get<any>(`/api/global/observability/audit/${id}`);
    return response.data;
  }

  /**
   * Search tenant audit logs
   */
  async searchTenantAudit(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/observability/audit/search', { ...data, tenantId });
    return response.data;
  }

  /**
   * Get tenant audit event by ID
   */
  async getTenantAuditEvent(tenantId: string, id: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/observability/audit/${id}`, { tenantId });
    return response.data;
  }

  // Privacy & Data Subject Requests

  /**
   * Get data subject requests (GDPR/CCPA)
   */
  async getDataSubjectRequests(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/privacy/data-requests', { tenantId });
    return response.data;
  }

  /**
   * Create data subject request
   */
  async createDataSubjectRequest(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/privacy/data-requests', { ...data, tenantId });
    return response.data;
  }

  /**
   * Execute data subject request
   */
  async executeDataSubjectRequest(tenantId: string, id: string): Promise<void> {
    await this.client.post(`/api/tenant/privacy/data-requests/${id}/execute`, { tenantId });
  }

  /**
   * Get data retention policies
   */
  async getRetentionPolicies(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/tenant/privacy/retention-policies', { tenantId });
    return response.data;
  }

  /**
   * Update data retention policy
   */
  async updateRetentionPolicy(tenantId: string, category: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/privacy/retention-policies/${category}`, { ...data, tenantId });
    return response.data;
  }
}

// Export singleton instance
export const governanceService = new GovernanceService();
