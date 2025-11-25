import { lazy } from 'react';

// ==================== AUTH ROUTES ====================
export const authRoutes = {
  Login: lazy(() => import('@/pages/auth/LoginPage')),
  CompleteFirstLogin: lazy(() => import('@/pages/auth/CompleteFirstLoginPage')),
  GoogleCallback: lazy(() => import('@/pages/auth/GoogleCallbackPage')),
};

// ==================== ADMIN ROUTES ====================
export const adminRoutes = {
  Dashboard: lazy(() => import('@/pages/admin/DashboardPage')),
  Users: lazy(() => import('@/pages/admin/UsersPage')),
  Tenants: lazy(() => import('@/pages/admin/TenantsPage')),
  Roles: lazy(() => import('@/pages/admin/RolesPage')),
  ApiKeys: lazy(() => import('@/pages/admin/ApiKeysPage')),
  Settings: lazy(() => import('@/pages/admin/SettingsPage')),
};

// ==================== GLOBAL ROUTES ====================
export const globalRoutes = {
  AccessReviews: lazy(() => import('@/pages/global/access-reviews/GlobalAccessReviewsPage')),
  Alerts: lazy(() => import('@/pages/global/alerts/GlobalAlertsPage')),
  ApiManagement: lazy(() => import('@/pages/global/api-management/GlobalApiManagementPage')),
  Audit: lazy(() => import('@/pages/global/audit/GlobalAuditPage')),
  Automation: lazy(() => import('@/pages/global/automation/GlobalAutomationPage')),
  Backups: lazy(() => import('@/pages/global/backups/GlobalBackupsPage')),
  Billing: lazy(() => import('@/pages/global/billing/GlobalBillingPage')),
  ChangeManagement: lazy(() => import('@/pages/global/change-management/GlobalChangeManagementPage')),
  ChangesAudit: lazy(() => import('@/pages/global/changes/audit/GlobalChangesAuditPage')),
  Copilot: lazy(() => import('@/pages/global/copilot/GlobalCopilotPage')),
  Crypto: lazy(() => import('@/pages/global/crypto/GlobalCryptoPage')),
  Diagnostics: lazy(() => import('@/pages/global/diagnostics/GlobalDiagnosticsPage')),
  Environments: lazy(() => import('@/pages/global/environments/GlobalEnvironmentsPage')),
  FeatureFlags: lazy(() => import('@/pages/global/feature-flags/GlobalFeatureFlagsPage')),
  Health: lazy(() => import('@/pages/global/health/GlobalHealthPage')),
  Hunting: lazy(() => import('@/pages/global/hunting/GlobalHuntingPage')),
  Insights: lazy(() => import('@/pages/global/insights/GlobalInsightsPage')),
  InsightsAdvanced: lazy(() => import('@/pages/global/insights/advanced/GlobalInsightsAdvancedPage')),
  Integrations: lazy(() => import('@/pages/global/integrations/GlobalIntegrationsPage')),
  Licenses: lazy(() => import('@/pages/global/licenses/GlobalLicensesPage')),
  Maintenance: lazy(() => import('@/pages/global/maintenance/GlobalMaintenancePage')),
  Metrics: lazy(() => import('@/pages/global/metrics/GlobalMetricsPage')),
  Migrations: lazy(() => import('@/pages/global/migrations/GlobalMigrationsPage')),
  Monitoring: lazy(() => import('@/pages/global/monitoring/GlobalMonitoringPage')),
  Observability: lazy(() => import('@/pages/global/observability/GlobalObservabilityPage')),
  Performance: lazy(() => import('@/pages/global/performance/GlobalPerformancePage')),
  Platform: lazy(() => import('@/pages/global/platform/GlobalPlatformPage')),
  RateLimiting: lazy(() => import('@/pages/global/rate-limiting/GlobalRateLimitingPage')),
  Regions: lazy(() => import('@/pages/global/regions/GlobalRegionsPage')),
  Security: lazy(() => import('@/pages/global/security/GlobalSecurityPage')),
  Settings: lazy(() => import('@/pages/global/settings/GlobalSettingsPage')),
  Templates: lazy(() => import('@/pages/global/templates/GlobalTemplatesPage')),
  Tenants: lazy(() => import('@/pages/global/tenants/GlobalTenantsPage')),
  TenantsLifecycle: lazy(() => import('@/pages/global/tenants/lifecycle/GlobalTenantsLifecyclePage')),
  Webhooks: lazy(() => import('@/pages/global/webhooks/GlobalWebhooksPage')),
};

// ==================== DOCS ROUTES ====================
export const docsRoutes = {
  Discovery: lazy(() => import('@/pages/docs/discovery/DocsDiscoveryPage')),
  UserInfo: lazy(() => import('@/pages/docs/userinfo/DocsUserinfoPage')),
};

// ==================== TENANT ROUTES ====================
export const tenantRoutes = {
  // Access
  AccessCertifications: lazy(() => import('@/pages/tenant/access/certifications/TenantAccessCertificationsPage')),
  AccessReviews: lazy(() => import('@/pages/tenant/access/reviews/TenantAccessReviewsPage')),
  AccessRequests: lazy(() => import('@/pages/tenant/access-requests/TenantAccessRequestsPage')),
  AccessRequestsDetail: lazy(() => import('@/pages/tenant/access-requests/[id]/TenantAccessRequestsDetailPage')),

  // Account & Security
  Account: lazy(() => import('@/pages/tenant/account/TenantAccountPage')),
  AdaptiveSecurity: lazy(() => import('@/pages/tenant/adaptive-security/TenantAdaptiveSecurityPage')),
  Alerts: lazy(() => import('@/pages/tenant/alerts/TenantAlertsPage')),

  // Analytics
  Analytics: lazy(() => import('@/pages/tenant/analytics/TenantAnalyticsPage')),
  AnalyticsApplications: lazy(() => import('@/pages/tenant/analytics/applications/TenantAnalyticsApplicationsPage')),
  AnalyticsSecurity: lazy(() => import('@/pages/tenant/analytics/security/TenantAnalyticsSecurityPage')),
  AnalyticsUsers: lazy(() => import('@/pages/tenant/analytics/users/TenantAnalyticsUsersPage')),

  // API
  ApiKeys: lazy(() => import('@/pages/tenant/api-keys/TenantApiKeysPage')),
  ApiUsage: lazy(() => import('@/pages/tenant/api-usage/TenantApiUsagePage')),

  // Apps
  Apps: lazy(() => import('@/pages/tenant/apps/TenantAppsPage')),
  AppsDetail: lazy(() => import('@/pages/tenant/apps/[id]/TenantAppsDetailPage')),

  // Audit
  Audit: lazy(() => import('@/pages/tenant/audit/TenantAuditPage')),

  // Automation
  Automation: lazy(() => import('@/pages/tenant/automation/TenantAutomationPage')),
  AutomationDesigner: lazy(() => import('@/pages/tenant/automation/designer/TenantAutomationDesignerPage')),
  AutomationWorkflowsDetail: lazy(() => import('@/pages/tenant/automation/workflows/[id]/TenantAutomationWorkflowsDetailPage')),
  AutomationWorkflowsExecutions: lazy(() => import('@/pages/tenant/automation/workflows/[id]/executions/TenantAutomationWorkflowsDetailExecutionsPage')),

  // B
  Backups: lazy(() => import('@/pages/tenant/backups/TenantBackupsPage')),
  Billing: lazy(() => import('@/pages/tenant/billing/TenantBillingPage')),
  Branding: lazy(() => import('@/pages/tenant/branding/TenantBrandingPage')),

  // C
  Certificates: lazy(() => import('@/pages/tenant/certificates/TenantCertificatesPage')),
  ChangeManagement: lazy(() => import('@/pages/tenant/change-management/TenantChangeManagementPage')),
  Compliance: lazy(() => import('@/pages/tenant/compliance/TenantCompliancePage')),
  ConditionalAccess: lazy(() => import('@/pages/tenant/conditional-access/TenantConditionalAccessPage')),
  Copilot: lazy(() => import('@/pages/tenant/copilot/TenantCopilotPage')),

  // D
  Dashboard: lazy(() => import('@/pages/tenant/dashboard/TenantDashboardPage')),
  DataRetention: lazy(() => import('@/pages/tenant/data-retention/TenantDataRetentionPage')),
  DelegatedAdmins: lazy(() => import('@/pages/tenant/delegated-admins/TenantDelegatedAdminsPage')),
  DelegatedAdminsDetail: lazy(() => import('@/pages/tenant/delegated-admins/[id]/TenantDelegatedAdminsDetailPage')),
  Domains: lazy(() => import('@/pages/tenant/domains/TenantDomainsPage')),

  // E
  Exports: lazy(() => import('@/pages/tenant/exports/TenantExportsPage')),
  Extensibility: lazy(() => import('@/pages/tenant/extensibility/TenantExtensibilityPage')),

  // F
  Federation: lazy(() => import('@/pages/tenant/federation/TenantFederationPage')),

  // G
  Governance: lazy(() => import('@/pages/tenant/governance/TenantGovernancePage')),
  GovernanceCampaigns: lazy(() => import('@/pages/tenant/governance/campaigns/TenantGovernanceCampaignsPage')),

  // H
  Hunting: lazy(() => import('@/pages/tenant/hunting/TenantHuntingPage')),

  // I
  Imports: lazy(() => import('@/pages/tenant/imports/TenantImportsPage')),
  Incidents: lazy(() => import('@/pages/tenant/incidents/TenantIncidentsPage')),
  IncidentsDetail: lazy(() => import('@/pages/tenant/incidents/[id]/TenantIncidentsDetailPage')),
  Insights: lazy(() => import('@/pages/tenant/insights/TenantInsightsPage')),
  InsightsAdvanced: lazy(() => import('@/pages/tenant/insights/advanced/TenantInsightsAdvancedPage')),
  Integrations: lazy(() => import('@/pages/tenant/integrations/TenantIntegrationsPage')),
  IntegrationsDetail: lazy(() => import('@/pages/tenant/integrations/[id]/TenantIntegrationsDetailPage')),
  IpWhitelist: lazy(() => import('@/pages/tenant/ip-whitelist/TenantIpWhitelistPage')),

  // L
  Lifecycle: lazy(() => import('@/pages/tenant/lifecycle/TenantLifecyclePage')),

  // M
  MfaManagement: lazy(() => import('@/pages/tenant/mfa-management/TenantMfaManagementPage')),

  // N
  Notifications: lazy(() => import('@/pages/tenant/notifications/TenantNotificationsPage')),
  NotificationsTemplatesDetail: lazy(() => import('@/pages/tenant/notifications/templates/[id]/TenantNotificationsTemplatesDetailPage')),

  // O
  Observability: lazy(() => import('@/pages/tenant/observability/TenantObservabilityPage')),
  OrgUnits: lazy(() => import('@/pages/tenant/org-units/TenantOrgUnitsPage')),
  OrgUnitsDetail: lazy(() => import('@/pages/tenant/org-units/[id]/TenantOrgUnitsDetailPage')),

  // P
  Policies: lazy(() => import('@/pages/tenant/policies/TenantPoliciesPage')),
  PoliciesDetail: lazy(() => import('@/pages/tenant/policies/[id]/TenantPoliciesDetailPage')),
  Privacy: lazy(() => import('@/pages/tenant/privacy/TenantPrivacyPage')),
  PrivilegedAccess: lazy(() => import('@/pages/tenant/privileged-access/TenantPrivilegedAccessPage')),

  // Q
  Quotas: lazy(() => import('@/pages/tenant/quotas/TenantQuotasPage')),

  // R
  Reports: lazy(() => import('@/pages/tenant/reports/TenantReportsPage')),
  ReportsCompliance: lazy(() => import('@/pages/tenant/reports/compliance/TenantReportsCompliancePage')),
  RiskEvents: lazy(() => import('@/pages/tenant/risk-events/TenantRiskEventsPage')),
  RiskEventsDetail: lazy(() => import('@/pages/tenant/risk-events/[id]/TenantRiskEventsDetailPage')),
  Roles: lazy(() => import('@/pages/tenant/roles/TenantRolesPage')),
  RolesDetail: lazy(() => import('@/pages/tenant/roles/[id]/TenantRolesDetailPage')),

  // S
  Schedules: lazy(() => import('@/pages/tenant/schedules/TenantSchedulesPage')),
  Scopes: lazy(() => import('@/pages/tenant/scopes/TenantScopesPage')),
  Security: lazy(() => import('@/pages/tenant/security/TenantSecurityPage')),
  SecurityAnomalyDetection: lazy(() => import('@/pages/tenant/security/anomaly-detection/TenantSecurityAnomalyDetectionPage')),
  ServiceAccounts: lazy(() => import('@/pages/tenant/service-accounts/TenantServiceAccountsPage')),
  ServiceAccountsDetail: lazy(() => import('@/pages/tenant/service-accounts/[id]/TenantServiceAccountsDetailPage')),
  Sessions: lazy(() => import('@/pages/tenant/sessions/TenantSessionsPage')),
  Settings: lazy(() => import('@/pages/tenant/settings/TenantSettingsPage')),

  // T
  Templates: lazy(() => import('@/pages/tenant/templates/TenantTemplatesPage')),
  Tokens: lazy(() => import('@/pages/tenant/tokens/TenantTokensPage')),

  // U
  Users: lazy(() => import('@/pages/tenant/users/TenantUsersPage')),
  UsersDetail: lazy(() => import('@/pages/tenant/users/[id]/TenantUsersDetailPage')),

  // W
  Webhooks: lazy(() => import('@/pages/tenant/webhooks/TenantWebhooksPage')),
};

export default {
  auth: authRoutes,
  admin: adminRoutes,
  global: globalRoutes,
  docs: docsRoutes,
  tenant: tenantRoutes,
};
