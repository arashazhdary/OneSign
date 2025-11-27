import { ApiClient, apiClient } from '../api-client';
import { PaginatedResponse } from '../types/common';
import {
  SecurityPolicy,
  RiskEvent,
  GetRiskEventsParams,
  ThreatDetection,
  SecurityAlert,
  AuditLog,
  GetAuditLogsParams,
  AccessReview,
  AccessReviewItem,
  ConditionalAccessPolicy,
} from '../types/security';

/**
 * Security Service
 * Handles all security and compliance operations
 */
export class SecurityService {
  constructor(private client: ApiClient = apiClient) {}

  // Security Policies

  /**
   * Get security policies
   */
  async getPolicies(tenantId?: string): Promise<SecurityPolicy[]> {
    const endpoint = tenantId ? '/api/tenant/security/policies' : '/api/global/security/policies';
    const response = await this.client.get<SecurityPolicy[]>(endpoint, { tenantId });
    return response.data;
  }

  /**
   * Get policy by ID
   */
  async getPolicyById(policyId: string, tenantId?: string): Promise<SecurityPolicy> {
    const endpoint = tenantId
      ? `/api/tenant/security/policies/${policyId}`
      : `/api/global/security/policies/${policyId}`;
    const response = await this.client.get<SecurityPolicy>(endpoint, { tenantId });
    return response.data;
  }

  /**
   * Create security policy
   */
  async createPolicy(data: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    const endpoint = data.tenantId
      ? '/api/tenant/security/policies'
      : '/api/global/security/policies';
    const response = await this.client.post<SecurityPolicy>(endpoint, data);
    return response.data;
  }

  /**
   * Update security policy
   */
  async updatePolicy(
    policyId: string,
    data: Partial<SecurityPolicy>,
    tenantId?: string
  ): Promise<SecurityPolicy> {
    const endpoint = tenantId
      ? `/api/tenant/security/policies/${policyId}`
      : `/api/global/security/policies/${policyId}`;
    const response = await this.client.put<SecurityPolicy>(endpoint, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete security policy
   */
  async deletePolicy(policyId: string, tenantId?: string): Promise<void> {
    const endpoint = tenantId
      ? `/api/tenant/security/policies/${policyId}`
      : `/api/global/security/policies/${policyId}`;
    await this.client.delete(endpoint, { params: { tenantId } });
  }

  /**
   * Enable security policy
   */
  async enablePolicy(policyId: string, tenantId?: string): Promise<void> {
    const endpoint = tenantId
      ? `/api/tenant/security/policies/${policyId}/enable`
      : `/api/global/security/policies/${policyId}/enable`;
    await this.client.post(endpoint, { tenantId });
  }

  /**
   * Disable security policy
   */
  async disablePolicy(policyId: string, tenantId?: string): Promise<void> {
    const endpoint = tenantId
      ? `/api/tenant/security/policies/${policyId}/disable`
      : `/api/global/security/policies/${policyId}/disable`;
    await this.client.post(endpoint, { tenantId });
  }

  // Risk Events

  /**
   * Get risk events
   */
  async getRiskEvents(params: GetRiskEventsParams): Promise<PaginatedResponse<RiskEvent>> {
    const response = await this.client.get<PaginatedResponse<RiskEvent>>(
      '/api/tenant/security/risk-events',
      params
    );
    return response.data;
  }

  /**
   * Get risk event by ID
   */
  async getRiskEventById(tenantId: string, eventId: string): Promise<RiskEvent> {
    const response = await this.client.get<RiskEvent>(
      `/api/tenant/security/risk-events/${eventId}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Create risk event
   */
  async createRiskEvent(tenantId: string, data: Partial<RiskEvent>): Promise<RiskEvent> {
    const response = await this.client.post<RiskEvent>(
      '/api/tenant/risk-events',
      { ...data, tenantId }
    );
    return response.data;
  }

  /**
   * Update risk event status
   */
  async updateRiskEventStatus(
    tenantId: string,
    eventId: string,
    status: string,
    notes?: string
  ): Promise<RiskEvent> {
    const response = await this.client.put<RiskEvent>(
      `/api/tenant/security/risk-events/${eventId}/status`,
      { tenantId, status, notes }
    );
    return response.data;
  }

  /**
   * Mitigate risk event
   */
  async mitigateRiskEvent(
    tenantId: string,
    eventId: string,
    actions: string[]
  ): Promise<void> {
    await this.client.post(`/api/tenant/security/risk-events/${eventId}/mitigate`, {
      tenantId,
      actions,
    });
  }

  // Threat Detection

  /**
   * Get threat detections
   */
  async getThreatDetections(tenantId: string): Promise<ThreatDetection[]> {
    const response = await this.client.get<ThreatDetection[]>(
      '/api/tenant/security/threat-detection',
      { tenantId }
    );
    return response.data;
  }

  /**
   * Create threat detection
   */
  async createThreatDetection(data: Partial<ThreatDetection>): Promise<ThreatDetection> {
    const response = await this.client.post<ThreatDetection>(
      '/api/tenant/security/threat-detection',
      data
    );
    return response.data;
  }

  /**
   * Update threat detection
   */
  async updateThreatDetection(
    tenantId: string,
    detectionId: string,
    data: Partial<ThreatDetection>
  ): Promise<ThreatDetection> {
    const response = await this.client.put<ThreatDetection>(
      `/api/tenant/security/threat-detection/${detectionId}`,
      { ...data, tenantId }
    );
    return response.data;
  }

  /**
   * Delete threat detection
   */
  async deleteThreatDetection(tenantId: string, detectionId: string): Promise<void> {
    await this.client.delete(`/api/tenant/security/threat-detection/${detectionId}`, {
      params: { tenantId },
    });
  }

  // Security Alerts

  /**
   * Get security alerts
   */
  async getAlerts(tenantId: string, status?: string): Promise<SecurityAlert[]> {
    const response = await this.client.get<SecurityAlert[]>('/api/tenant/security/alerts', {
      tenantId,
      status,
    });
    return response.data;
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(tenantId: string, alertId: string): Promise<void> {
    await this.client.post(`/api/tenant/security/alerts/${alertId}/acknowledge`, { tenantId });
  }

  /**
   * Resolve alert
   */
  async resolveAlert(tenantId: string, alertId: string, notes?: string): Promise<void> {
    await this.client.post(`/api/tenant/security/alerts/${alertId}/resolve`, {
      tenantId,
      notes,
    });
  }

  /**
   * Suppress alert
   */
  async suppressAlert(tenantId: string, alertId: string): Promise<void> {
    await this.client.post(`/api/tenant/security/alerts/${alertId}/suppress`, { tenantId });
  }

  /**
   * Get global alerts (Global Admin only)
   */
  async getGlobalAlerts(status?: string): Promise<SecurityAlert[]> {
    const response = await this.client.get<SecurityAlert[]>('/api/global/security/alerts', {
      status,
    });
    return response.data;
  }

  /**
   * Acknowledge global alert (Global Admin only)
   */
  async acknowledgeGlobalAlert(alertId: string): Promise<void> {
    await this.client.post(`/api/global/security/alerts/${alertId}/acknowledge`, {});
  }

  /**
   * Resolve global alert (Global Admin only)
   */
  async resolveGlobalAlert(alertId: string, notes?: string): Promise<void> {
    await this.client.post(`/api/global/security/alerts/${alertId}/resolve`, {
      notes,
    });
  }

  /**
   * Silence global alert (Global Admin only)
   */
  async silenceGlobalAlert(alertId: string, duration?: number): Promise<void> {
    await this.client.post(`/api/global/security/alerts/${alertId}/silence`, {
      duration,
    });
  }

  // Audit Logs

  /**
   * Get audit logs
   */
  async getAuditLogs(params: GetAuditLogsParams): Promise<PaginatedResponse<AuditLog>> {
    const response = await this.client.get<PaginatedResponse<AuditLog>>(
      '/api/tenant/security/audit-logs',
      params
    );
    return response.data;
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(
    tenantId: string,
    format: 'csv' | 'xlsx' | 'json',
    filters?: any
  ): Promise<Blob> {
    const response = await this.client.get<Blob>('/api/tenant/security/audit-logs/export', {
      tenantId,
      format,
      ...filters,
    });
    return response.data;
  }

  // Access Reviews

  /**
   * Get access reviews
   */
  async getAccessReviews(tenantId: string, status?: string): Promise<AccessReview[]> {
    const response = await this.client.get<AccessReview[]>('/api/tenant/security/access-reviews', {
      tenantId,
      status,
    });
    return response.data;
  }

  /**
   * Get access review by ID
   */
  async getAccessReviewById(tenantId: string, reviewId: string): Promise<AccessReview> {
    const response = await this.client.get<AccessReview>(
      `/api/tenant/security/access-reviews/${reviewId}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Create access review
   */
  async createAccessReview(data: Partial<AccessReview>): Promise<AccessReview> {
    const response = await this.client.post<AccessReview>(
      '/api/tenant/security/access-reviews',
      data
    );
    return response.data;
  }

  /**
   * Submit access review decision
   */
  async submitReviewDecision(
    tenantId: string,
    reviewId: string,
    itemId: string,
    decision: 'approve' | 'revoke',
    notes?: string
  ): Promise<void> {
    await this.client.post(`/api/tenant/security/access-reviews/${reviewId}/items/${itemId}/decide`, {
      tenantId,
      decision,
      notes,
    });
  }

  /**
   * Complete access review
   */
  async completeAccessReview(tenantId: string, reviewId: string): Promise<void> {
    await this.client.post(`/api/tenant/security/access-reviews/${reviewId}/complete`, {
      tenantId,
    });
  }

  // Conditional Access

  /**
   * Get conditional access policies
   */
  async getConditionalAccessPolicies(tenantId?: string): Promise<ConditionalAccessPolicy[]> {
    const endpoint = tenantId
      ? '/api/tenant/security/conditional-access'
      : '/api/global/security/conditional-access';
    const response = await this.client.get<ConditionalAccessPolicy[]>(endpoint, { tenantId });
    return response.data;
  }

  /**
   * Create conditional access policy
   */
  async createConditionalAccessPolicy(
    data: Partial<ConditionalAccessPolicy>
  ): Promise<ConditionalAccessPolicy> {
    const endpoint = data.tenantId
      ? '/api/tenant/security/conditional-access'
      : '/api/global/security/conditional-access';
    const response = await this.client.post<ConditionalAccessPolicy>(endpoint, data);
    return response.data;
  }

  /**
   * Update conditional access policy
   */
  async updateConditionalAccessPolicy(
    policyId: string,
    data: Partial<ConditionalAccessPolicy>,
    tenantId?: string
  ): Promise<ConditionalAccessPolicy> {
    const endpoint = tenantId
      ? `/api/tenant/security/conditional-access/${policyId}`
      : `/api/global/security/conditional-access/${policyId}`;
    const response = await this.client.put<ConditionalAccessPolicy>(endpoint, {
      ...data,
      tenantId,
    });
    return response.data;
  }

  /**
   * Delete conditional access policy
   */
  async deleteConditionalAccessPolicy(policyId: string, tenantId?: string): Promise<void> {
    const endpoint = tenantId
      ? `/api/tenant/security/conditional-access/${policyId}`
      : `/api/global/security/conditional-access/${policyId}`;
    await this.client.delete(endpoint, { params: { tenantId } });
  }

  // Adaptive Security

  /**
   * Get adaptive security policies
   */
  async getAdaptiveSecurityPolicies(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(
      '/api/tenant/adaptive-security/policies',
      { tenantId }
    );
    return response.data;
  }

  /**
   * Get adaptive security policy by ID
   */
  async getAdaptiveSecurityPolicyById(tenantId: string, policyId: string): Promise<any> {
    const response = await this.client.get<any>(
      `/api/tenant/adaptive-security/policies/${policyId}`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Create adaptive security policy
   */
  async createAdaptiveSecurityPolicy(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>(
      '/api/tenant/adaptive-security/policies',
      { ...data, tenantId }
    );
    return response.data;
  }

  /**
   * Update adaptive security policy
   */
  async updateAdaptiveSecurityPolicy(tenantId: string, policyId: string, data: any): Promise<any> {
    const response = await this.client.put<any>(
      `/api/tenant/adaptive-security/policies/${policyId}`,
      { ...data, tenantId }
    );
    return response.data;
  }

  /**
   * Delete adaptive security policy
   */
  async deleteAdaptiveSecurityPolicy(tenantId: string, policyId: string): Promise<void> {
    await this.client.delete(`/api/tenant/adaptive-security/policies/${policyId}`, {
      params: { tenantId },
    });
  }

  /**
   * Enable adaptive security policy
   */
  async enableAdaptiveSecurityPolicy(tenantId: string, policyId: string): Promise<void> {
    await this.client.post(`/api/tenant/adaptive-security/policies/${policyId}/enable`, {
      tenantId,
    });
  }

  /**
   * Disable adaptive security policy
   */
  async disableAdaptiveSecurityPolicy(tenantId: string, policyId: string): Promise<void> {
    await this.client.post(`/api/tenant/adaptive-security/policies/${policyId}/disable`, {
      tenantId,
    });
  }

  /**
   * Get adaptive security dashboard
   */
  async getAdaptiveSecurityDashboard(tenantId: string): Promise<any> {
    const response = await this.client.get<any>(
      '/api/tenant/adaptive-security/dashboard',
      { tenantId }
    );
    return response.data;
  }

  /**
   * Get adaptive security signals
   */
  async getAdaptiveSecuritySignals(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(
      '/api/tenant/adaptive-security/signals',
      { tenantId }
    );
    return response.data;
  }

  /**
   * Update adaptive security signal
   */
  async updateAdaptiveSecuritySignal(tenantId: string, signalId: string, data: any): Promise<any> {
    const response = await this.client.put<any>(
      `/api/tenant/adaptive-security/signals/${signalId}`,
      { ...data, tenantId }
    );
    return response.data;
  }

  /**
   * Process adaptive security signal
   */
  async processAdaptiveSecuritySignal(tenantId: string, data: any): Promise<void> {
    await this.client.post('/api/tenant/adaptive-security/signals', {
      ...data,
      tenantId,
    });
  }

  /**
   * Get high-risk users
   */
  async getHighRiskUsers(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(
      '/api/tenant/adaptive-security/high-risk-users',
      { tenantId }
    );
    return response.data;
  }

  /**
   * Get security contexts
   */
  async getSecurityContexts(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(
      '/api/tenant/adaptive-security/contexts',
      { tenantId }
    );
    return response.data;
  }

  /**
   * Refresh user security context
   */
  async refreshUserSecurityContext(tenantId: string, userId: string): Promise<void> {
    await this.client.post(`/api/tenant/adaptive-security/contexts/${userId}/refresh`, {
      tenantId,
    });
  }

  /**
   * Get user risk score
   */
  async getUserRiskScore(tenantId: string, userId: string): Promise<any> {
    const response = await this.client.get<any>(
      `/api/tenant/adaptive-security/users/${userId}/risk-score`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Evaluate user risk
   */
  async evaluateUserRisk(tenantId: string, userId: string): Promise<any> {
    const response = await this.client.post<any>(
      '/api/tenant/adaptive-security/evaluate',
      { userId, tenantId }
    );
    return response.data;
  }

  /**
   * Get user security context
   */
  async getUserSecurityContext(tenantId: string, userId: string): Promise<any> {
    const response = await this.client.get<any>(
      `/api/tenant/adaptive-security/users/${userId}/context`,
      { tenantId }
    );
    return response.data;
  }

  /**
   * Update user security context
   */
  async updateUserSecurityContext(tenantId: string, userId: string, data: any): Promise<any> {
    const response = await this.client.put<any>(
      `/api/tenant/adaptive-security/users/${userId}/context`,
      { ...data, tenantId }
    );
    return response.data;
  }

  // MFA Management

  /**
   * Create MFA challenge
   */
  async createMFAChallenge(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>(
      '/api/tenant/mfa/challenge',
      { ...data, tenantId }
    );
    return response.data;
  }

  /**
   * Check MFA requirement
   */
  async checkMFARequirement(tenantId: string, userId: string): Promise<any> {
    const response = await this.client.get<any>(
      '/api/tenant/mfa/check-requirement',
      { tenantId, userId }
    );
    return response.data;
  }

  /**
   * Get user MFA methods
   */
  async getUserMFAMethods(tenantId: string, userId?: string): Promise<any[]> {
    const response = await this.client.get<any[]>(
      '/api/tenant/mfa/methods',
      { tenantId, userId }
    );
    return response.data;
  }

  /**
   * Delete MFA method
   */
  async deleteMFAMethod(tenantId: string, methodId: string): Promise<void> {
    await this.client.delete(`/api/tenant/mfa/methods/${methodId}`, {
      params: { tenantId },
    });
  }

  /**
   * Disable MFA for user
   */
  async disableMFAForUser(tenantId: string, userId: string): Promise<void> {
    await this.client.post('/api/tenant/mfa/disable', {
      tenantId,
      userId,
    });
  }

  // Trusted Devices

  /**
   * Get trusted devices
   */
  async getTrustedDevices(tenantId: string, userId?: string): Promise<any[]> {
    const response = await this.client.get<any[]>(
      '/api/tenant/trusted-devices',
      { tenantId, userId }
    );
    return response.data;
  }

  /**
   * Check device trust
   */
  async checkDeviceTrust(tenantId: string, deviceFingerprint: string): Promise<any> {
    const response = await this.client.get<any>(
      '/api/tenant/trusted-devices/check',
      { tenantId, deviceFingerprint }
    );
    return response.data;
  }

  /**
   * Revoke device trust
   */
  async revokeDeviceTrust(tenantId: string, deviceId: string): Promise<void> {
    await this.client.post(`/api/tenant/trusted-devices/${deviceId}/revoke`, {
      tenantId,
    });
  }

  // Security Policy - Org Unit Rules

  /**
   * Get org unit MFA rules
   */
  async getOrgUnitMFARules(tenantId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(
      '/api/tenant/security/policy/org-unit-rules',
      { tenantId }
    );
    return response.data;
  }

  /**
   * Update org unit MFA rules
   */
  async updateOrgUnitMFARules(tenantId: string, data: any): Promise<any> {
    const response = await this.client.put<any>(
      '/api/tenant/security/policy/org-unit-rules',
      { ...data, tenantId }
    );
    return response.data;
  }

  // Policies Management

  /**
   * Get policies
   */
  async getPolicies(tenantId: string, enabled?: boolean): Promise<any[]> {
    const params: any = { tenantId };
    if (enabled !== undefined) params.enabled = enabled;
    const response = await this.client.get<any[]>('/api/tenant/policies', params);
    return response.data;
  }

  /**
   * Create policy
   */
  async createPolicy(tenantId: string, data: any): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/policies', { ...data, tenantId });
    return response.data;
  }

  /**
   * Update policy
   */
  async updatePolicy(tenantId: string, policyId: string, data: any): Promise<any> {
    const response = await this.client.put<any>(`/api/tenant/policies/${policyId}`, { ...data, tenantId });
    return response.data;
  }

  /**
   * Delete policy
   */
  async deletePolicy(tenantId: string, policyId: string): Promise<void> {
    await this.client.delete(`/api/tenant/policies/${policyId}`, { params: { tenantId } });
  }

  /**
   * Evaluate policy
   */
  async evaluatePolicy(tenantId: string, policyId: string, context: any): Promise<any> {
    const response = await this.client.post<any>(`/api/tenant/policies/${policyId}/evaluate`, {
      tenantId,
      ...context
    });
    return response.data;
  }

  /**
   * Assign policy to entity
   */
  async assignPolicy(tenantId: string, policyId: string, entityType: string, entityId: string): Promise<void> {
    await this.client.post(`/api/tenant/policies/${policyId}/assign`, {
      tenantId,
      entityType,
      entityId
    });
  }

  // Security Policy Management

  /**
   * Update security policy
   */
  async updateSecurityPolicy(tenantId: string, data: any): Promise<any> {
    const response = await this.client.put<any>('/api/tenant/security/policy', { ...data, tenantId });
    return response.data;
  }

  // TOTP Enrollment

  /**
   * Begin TOTP enrollment
   */
  async beginTotpEnrollment(userId: string, userEmail: string): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/mfa/totp/begin', {}, { userId, userEmail });
    return response.data;
  }

  /**
   * Confirm TOTP enrollment
   */
  async confirmTotpEnrollment(userId: string, tenantId: string, secret: string, code: string): Promise<any> {
    const response = await this.client.post<any>('/api/tenant/mfa/totp/confirm', { secret, code }, { userId, tenantId });
    return response.data;
  }

  // Policy Detail Management

  /**
   * Get policy by ID
   */
  async getPolicyById(tenantId: string, policyId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/policies/${policyId}`, { tenantId });
    return response.data;
  }

  /**
   * Get policy applied entities
   */
  async getPolicyAppliedEntities(tenantId: string, policyId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/tenant/policies/${policyId}/applied`, { tenantId });
    return response.data;
  }

  /**
   * Get policy audit log
   */
  async getPolicyAuditLog(tenantId: string, policyId: string, pageSize?: number): Promise<any[]> {
    const params: any = { tenantId };
    if (pageSize) params.pageSize = pageSize;
    const response = await this.client.get<any[]>(`/api/tenant/policies/${policyId}/audit-log`, params);
    return response.data;
  }

  /**
   * Get policy impact analysis
   */
  async getPolicyImpactAnalysis(tenantId: string, policyId: string): Promise<any> {
    const response = await this.client.get<any>(`/api/tenant/policies/${policyId}/impact-analysis`, { tenantId });
    return response.data;
  }

  /**
   * Activate policy
   */
  async activatePolicy(tenantId: string, policyId: string): Promise<void> {
    await this.client.post(`/api/tenant/policies/${policyId}/activate`, { tenantId });
  }

  /**
   * Deactivate policy
   */
  async deactivatePolicy(tenantId: string, policyId: string): Promise<void> {
    await this.client.post(`/api/tenant/policies/${policyId}/deactivate`, { tenantId });
  }

  /**
   * Test policy
   */
  async testPolicy(tenantId: string, policyId: string, userId: string): Promise<any> {
    const response = await this.client.post<any>(`/api/tenant/policies/${policyId}/test`, { tenantId, userId });
    return response.data;
  }

  /**
   * Apply policy to entity
   */
  async applyPolicyToEntity(tenantId: string, policyId: string, entityType: string, entityId: string): Promise<void> {
    await this.client.post(`/api/tenant/policies/${policyId}/apply`, {
      tenantId,
      entityType,
      entityId
    });
  }

  // Risk Event Detail Management

  /**
   * Get risk event timeline
   */
  async getRiskEventTimeline(tenantId: string, eventId: string): Promise<any[]> {
    const response = await this.client.get<any[]>(`/api/tenant/risk-events/${eventId}/timeline`, { tenantId });
    return response.data;
  }

  /**
   * Resolve risk event
   */
  async resolveRiskEvent(tenantId: string, eventId: string): Promise<void> {
    await this.client.post(`/api/tenant/risk-events/${eventId}/resolve`, { tenantId });
  }
}

// Export singleton instance
export const securityService = new SecurityService();
