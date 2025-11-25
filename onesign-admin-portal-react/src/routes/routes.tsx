import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Layouts
import { AdminLayout } from '@/layouts/AdminLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { GlobalLayout } from '@/layouts/GlobalLayout';

// ==================== AUTH PAGES ====================
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const GoogleCallbackPage = lazy(() => import('@/pages/auth/GoogleCallbackPage'));
const CompleteFirstLoginPage = lazy(() => import('@/pages/auth/CompleteFirstLoginPage'));

// ==================== ADMIN PAGES ====================
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage'));
const AdminTenantsPage = lazy(() => import('@/pages/admin/TenantsPage'));
const AdminRolesPage = lazy(() => import('@/pages/admin/RolesPage'));
const AdminApiKeysPage = lazy(() => import('@/pages/admin/ApiKeysPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

// ==================== DOCS PAGES ====================
const DocsDiscoveryPage = lazy(() => import('@/pages/docs/discovery/DocsDiscoveryPage'));
const DocsUserinfoPage = lazy(() => import('@/pages/docs/userinfo/DocsUserinfoPage'));

// ==================== GLOBAL PAGES ====================
const GlobalAccessReviewsPage = lazy(() => import('@/pages/global/access-reviews/GlobalAccessReviewsPage'));
const GlobalAlertsPage = lazy(() => import('@/pages/global/alerts/GlobalAlertsPage'));
const GlobalApiManagementPage = lazy(() => import('@/pages/global/api-management/GlobalApiManagementPage'));
const GlobalAuditPage = lazy(() => import('@/pages/global/audit/GlobalAuditPage'));
const GlobalAutomationPage = lazy(() => import('@/pages/global/automation/GlobalAutomationPage'));
const GlobalBackupsPage = lazy(() => import('@/pages/global/backups/GlobalBackupsPage'));
const GlobalBillingPage = lazy(() => import('@/pages/global/billing/GlobalBillingPage'));
const GlobalChangeManagementPage = lazy(() => import('@/pages/global/change-management/GlobalChangeManagementPage'));
const GlobalChangesAuditPage = lazy(() => import('@/pages/global/changes/audit/GlobalChangesAuditPage'));
const GlobalCopilotPage = lazy(() => import('@/pages/global/copilot/GlobalCopilotPage'));
const GlobalCryptoPage = lazy(() => import('@/pages/global/crypto/GlobalCryptoPage'));
const GlobalDiagnosticsPage = lazy(() => import('@/pages/global/diagnostics/GlobalDiagnosticsPage'));
const GlobalEnvironmentsPage = lazy(() => import('@/pages/global/environments/GlobalEnvironmentsPage'));
const GlobalFeatureFlagsPage = lazy(() => import('@/pages/global/feature-flags/GlobalFeatureFlagsPage'));
const GlobalHealthPage = lazy(() => import('@/pages/global/health/GlobalHealthPage'));
const GlobalHuntingPage = lazy(() => import('@/pages/global/hunting/GlobalHuntingPage'));
const GlobalInsightsPage = lazy(() => import('@/pages/global/insights/GlobalInsightsPage'));
const GlobalInsightsAdvancedPage = lazy(() => import('@/pages/global/insights/advanced/GlobalInsightsAdvancedPage'));
const GlobalIntegrationsPage = lazy(() => import('@/pages/global/integrations/GlobalIntegrationsPage'));
const GlobalLicensesPage = lazy(() => import('@/pages/global/licenses/GlobalLicensesPage'));
const GlobalMaintenancePage = lazy(() => import('@/pages/global/maintenance/GlobalMaintenancePage'));
const GlobalMetricsPage = lazy(() => import('@/pages/global/metrics/GlobalMetricsPage'));
const GlobalMigrationsPage = lazy(() => import('@/pages/global/migrations/GlobalMigrationsPage'));
const GlobalMonitoringPage = lazy(() => import('@/pages/global/monitoring/GlobalMonitoringPage'));
const GlobalObservabilityPage = lazy(() => import('@/pages/global/observability/GlobalObservabilityPage'));
const GlobalPerformancePage = lazy(() => import('@/pages/global/performance/GlobalPerformancePage'));
const GlobalPlatformPage = lazy(() => import('@/pages/global/platform/GlobalPlatformPage'));
const GlobalRateLimitingPage = lazy(() => import('@/pages/global/rate-limiting/GlobalRateLimitingPage'));
const GlobalRegionsPage = lazy(() => import('@/pages/global/regions/GlobalRegionsPage'));
const GlobalSecurityPage = lazy(() => import('@/pages/global/security/GlobalSecurityPage'));
const GlobalSettingsPage = lazy(() => import('@/pages/global/settings/GlobalSettingsPage'));
const GlobalTemplatesPage = lazy(() => import('@/pages/global/templates/GlobalTemplatesPage'));
const GlobalTenantsPage = lazy(() => import('@/pages/global/tenants/GlobalTenantsPage'));
const GlobalTenantsLifecyclePage = lazy(() => import('@/pages/global/tenants/lifecycle/GlobalTenantsLifecyclePage'));
const GlobalWebhooksPage = lazy(() => import('@/pages/global/webhooks/GlobalWebhooksPage'));

// ==================== TENANT PAGES ====================
const TenantDashboardPage = lazy(() => import('@/pages/tenant/DashboardPage'));
const TenantUsersPage = lazy(() => import('@/pages/tenant/UsersPage'));
const TenantUsersDetailPage = lazy(() => import('@/pages/tenant/users/[id]/TenantUsersDetailPage'));
const TenantAppsPage = lazy(() => import('@/pages/tenant/AppsPage'));
const TenantAppsDetailPage = lazy(() => import('@/pages/tenant/apps/[id]/TenantAppsDetailPage'));
const TenantRolesPage = lazy(() => import('@/pages/tenant/RolesPage'));
const TenantRolesDetailPage = lazy(() => import('@/pages/tenant/roles/[id]/TenantRolesDetailPage'));
const TenantAuditPage = lazy(() => import('@/pages/tenant/AuditPage'));
const TenantSettingsPage = lazy(() => import('@/pages/tenant/SettingsPage'));

// Tenant Advanced
const TenantAccessCertificationsPage = lazy(() => import('@/pages/tenant/access/certifications/TenantAccessCertificationsPage'));
const TenantAccessReviewsPage = lazy(() => import('@/pages/tenant/access/reviews/TenantAccessReviewsPage'));
const TenantAccessRequestsPage = lazy(() => import('@/pages/tenant/access-requests/TenantAccessRequestsPage'));
const TenantAccessRequestsDetailPage = lazy(() => import('@/pages/tenant/access-requests/[id]/TenantAccessRequestsDetailPage'));
const TenantAccountPage = lazy(() => import('@/pages/tenant/account/TenantAccountPage'));
const TenantAdaptiveSecurityPage = lazy(() => import('@/pages/tenant/adaptive-security/TenantAdaptiveSecurityPage'));
const TenantAlertsPage = lazy(() => import('@/pages/tenant/alerts/TenantAlertsPage'));
const TenantAnalyticsPage = lazy(() => import('@/pages/tenant/analytics/TenantAnalyticsPage'));
const TenantAnalyticsApplicationsPage = lazy(() => import('@/pages/tenant/analytics/applications/TenantAnalyticsApplicationsPage'));
const TenantAnalyticsSecurityPage = lazy(() => import('@/pages/tenant/analytics/security/TenantAnalyticsSecurityPage'));
const TenantAnalyticsUsersPage = lazy(() => import('@/pages/tenant/analytics/users/TenantAnalyticsUsersPage'));
const TenantApiKeysPage = lazy(() => import('@/pages/tenant/api-keys/TenantApiKeysPage'));
const TenantApiUsagePage = lazy(() => import('@/pages/tenant/api-usage/TenantApiUsagePage'));
const TenantAutomationPage = lazy(() => import('@/pages/tenant/automation/TenantAutomationPage'));
const TenantAutomationDesignerPage = lazy(() => import('@/pages/tenant/automation/designer/TenantAutomationDesignerPage'));
const TenantAutomationWorkflowsDetailPage = lazy(() => import('@/pages/tenant/automation/workflows/[id]/TenantAutomationWorkflowsDetailPage'));
const TenantAutomationWorkflowsDetailExecutionsPage = lazy(() => import('@/pages/tenant/automation/workflows/[id]/executions/TenantAutomationWorkflowsDetailExecutionsPage'));
const TenantBackupsPage = lazy(() => import('@/pages/tenant/backups/TenantBackupsPage'));
const TenantBillingPage = lazy(() => import('@/pages/tenant/billing/TenantBillingPage'));
const TenantBrandingPage = lazy(() => import('@/pages/tenant/branding/TenantBrandingPage'));
const TenantCertificatesPage = lazy(() => import('@/pages/tenant/certificates/TenantCertificatesPage'));
const TenantChangeManagementPage = lazy(() => import('@/pages/tenant/change-management/TenantChangeManagementPage'));
const TenantCompliancePage = lazy(() => import('@/pages/tenant/compliance/TenantCompliancePage'));
const TenantConditionalAccessPage = lazy(() => import('@/pages/tenant/conditional-access/TenantConditionalAccessPage'));
const TenantCopilotPage = lazy(() => import('@/pages/tenant/copilot/TenantCopilotPage'));
const TenantDataRetentionPage = lazy(() => import('@/pages/tenant/data-retention/TenantDataRetentionPage'));
const TenantDelegatedAdminsPage = lazy(() => import('@/pages/tenant/delegated-admins/TenantDelegatedAdminsPage'));
const TenantDelegatedAdminsDetailPage = lazy(() => import('@/pages/tenant/delegated-admins/[id]/TenantDelegatedAdminsDetailPage'));
const TenantDomainsPage = lazy(() => import('@/pages/tenant/domains/TenantDomainsPage'));
const TenantExportsPage = lazy(() => import('@/pages/tenant/exports/TenantExportsPage'));
const TenantExtensibilityPage = lazy(() => import('@/pages/tenant/extensibility/TenantExtensibilityPage'));
const TenantFederationPage = lazy(() => import('@/pages/tenant/federation/TenantFederationPage'));
const TenantGovernancePage = lazy(() => import('@/pages/tenant/governance/TenantGovernancePage'));
const TenantGovernanceCampaignsPage = lazy(() => import('@/pages/tenant/governance/campaigns/TenantGovernanceCampaignsPage'));
const TenantHuntingPage = lazy(() => import('@/pages/tenant/hunting/TenantHuntingPage'));
const TenantImportsPage = lazy(() => import('@/pages/tenant/imports/TenantImportsPage'));
const TenantIncidentsPage = lazy(() => import('@/pages/tenant/incidents/TenantIncidentsPage'));
const TenantIncidentsDetailPage = lazy(() => import('@/pages/tenant/incidents/[id]/TenantIncidentsDetailPage'));
const TenantInsightsPage = lazy(() => import('@/pages/tenant/insights/TenantInsightsPage'));
const TenantInsightsAdvancedPage = lazy(() => import('@/pages/tenant/insights/advanced/TenantInsightsAdvancedPage'));
const TenantIntegrationsPage = lazy(() => import('@/pages/tenant/integrations/TenantIntegrationsPage'));
const TenantIntegrationsDetailPage = lazy(() => import('@/pages/tenant/integrations/[id]/TenantIntegrationsDetailPage'));
const TenantIpWhitelistPage = lazy(() => import('@/pages/tenant/ip-whitelist/TenantIpWhitelistPage'));
const TenantLifecyclePage = lazy(() => import('@/pages/tenant/lifecycle/TenantLifecyclePage'));
const TenantMfaManagementPage = lazy(() => import('@/pages/tenant/mfa-management/TenantMfaManagementPage'));
const TenantNotificationsPage = lazy(() => import('@/pages/tenant/notifications/TenantNotificationsPage'));
const TenantNotificationsTemplatesDetailPage = lazy(() => import('@/pages/tenant/notifications/templates/[id]/TenantNotificationsTemplatesDetailPage'));
const TenantObservabilityPage = lazy(() => import('@/pages/tenant/observability/TenantObservabilityPage'));
const TenantOrgUnitsPage = lazy(() => import('@/pages/tenant/org-units/TenantOrgUnitsPage'));
const TenantOrgUnitsDetailPage = lazy(() => import('@/pages/tenant/org-units/[id]/TenantOrgUnitsDetailPage'));
const TenantPoliciesPage = lazy(() => import('@/pages/tenant/policies/TenantPoliciesPage'));
const TenantPoliciesDetailPage = lazy(() => import('@/pages/tenant/policies/[id]/TenantPoliciesDetailPage'));
const TenantPrivacyPage = lazy(() => import('@/pages/tenant/privacy/TenantPrivacyPage'));
const TenantPrivilegedAccessPage = lazy(() => import('@/pages/tenant/privileged-access/TenantPrivilegedAccessPage'));
const TenantQuotasPage = lazy(() => import('@/pages/tenant/quotas/TenantQuotasPage'));
const TenantReportsPage = lazy(() => import('@/pages/tenant/reports/TenantReportsPage'));
const TenantReportsCompliancePage = lazy(() => import('@/pages/tenant/reports/compliance/TenantReportsCompliancePage'));
const TenantRiskEventsPage = lazy(() => import('@/pages/tenant/risk-events/TenantRiskEventsPage'));
const TenantRiskEventsDetailPage = lazy(() => import('@/pages/tenant/risk-events/[id]/TenantRiskEventsDetailPage'));
const TenantSchedulesPage = lazy(() => import('@/pages/tenant/schedules/TenantSchedulesPage'));
const TenantScopesPage = lazy(() => import('@/pages/tenant/scopes/TenantScopesPage'));
const TenantSecurityPage = lazy(() => import('@/pages/tenant/security/TenantSecurityPage'));
const TenantSecurityAnomalyDetectionPage = lazy(() => import('@/pages/tenant/security/anomaly-detection/TenantSecurityAnomalyDetectionPage'));
const TenantServiceAccountsPage = lazy(() => import('@/pages/tenant/service-accounts/TenantServiceAccountsPage'));
const TenantServiceAccountsDetailPage = lazy(() => import('@/pages/tenant/service-accounts/[id]/TenantServiceAccountsDetailPage'));
const TenantSessionsPage = lazy(() => import('@/pages/tenant/sessions/TenantSessionsPage'));
const TenantTemplatesPage = lazy(() => import('@/pages/tenant/templates/TenantTemplatesPage'));
const TenantTokensPage = lazy(() => import('@/pages/tenant/tokens/TenantTokensPage'));
const TenantWebhooksPage = lazy(() => import('@/pages/tenant/webhooks/TenantWebhooksPage'));

export const routes: RouteObject[] = [
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/google/callback',
    element: <GoogleCallbackPage />,
  },
  {
    path: '/complete-first-login',
    element: <CompleteFirstLoginPage />,
  },

  // Docs routes
  {
    path: '/docs/discovery',
    element: <DocsDiscoveryPage />,
  },
  {
    path: '/docs/userinfo',
    element: <DocsUserinfoPage />,
  },

  // Admin routes
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'tenants', element: <AdminTenantsPage /> },
      { path: 'roles', element: <AdminRolesPage /> },
      { path: 'api-keys', element: <AdminApiKeysPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },

  // Global routes
  {
    path: '/global',
    element: <GlobalLayout />,
    children: [
      { path: 'access-reviews', element: <GlobalAccessReviewsPage /> },
      { path: 'alerts', element: <GlobalAlertsPage /> },
      { path: 'api-management', element: <GlobalApiManagementPage /> },
      { path: 'audit', element: <GlobalAuditPage /> },
      { path: 'automation', element: <GlobalAutomationPage /> },
      { path: 'backups', element: <GlobalBackupsPage /> },
      { path: 'billing', element: <GlobalBillingPage /> },
      { path: 'change-management', element: <GlobalChangeManagementPage /> },
      { path: 'changes/audit', element: <GlobalChangesAuditPage /> },
      { path: 'copilot', element: <GlobalCopilotPage /> },
      { path: 'crypto', element: <GlobalCryptoPage /> },
      { path: 'diagnostics', element: <GlobalDiagnosticsPage /> },
      { path: 'environments', element: <GlobalEnvironmentsPage /> },
      { path: 'feature-flags', element: <GlobalFeatureFlagsPage /> },
      { path: 'health', element: <GlobalHealthPage /> },
      { path: 'hunting', element: <GlobalHuntingPage /> },
      { path: 'insights', element: <GlobalInsightsPage /> },
      { path: 'insights/advanced', element: <GlobalInsightsAdvancedPage /> },
      { path: 'integrations', element: <GlobalIntegrationsPage /> },
      { path: 'licenses', element: <GlobalLicensesPage /> },
      { path: 'maintenance', element: <GlobalMaintenancePage /> },
      { path: 'metrics', element: <GlobalMetricsPage /> },
      { path: 'migrations', element: <GlobalMigrationsPage /> },
      { path: 'monitoring', element: <GlobalMonitoringPage /> },
      { path: 'observability', element: <GlobalObservabilityPage /> },
      { path: 'performance', element: <GlobalPerformancePage /> },
      { path: 'platform', element: <GlobalPlatformPage /> },
      { path: 'rate-limiting', element: <GlobalRateLimitingPage /> },
      { path: 'regions', element: <GlobalRegionsPage /> },
      { path: 'security', element: <GlobalSecurityPage /> },
      { path: 'settings', element: <GlobalSettingsPage /> },
      { path: 'templates', element: <GlobalTemplatesPage /> },
      { path: 'tenants', element: <GlobalTenantsPage /> },
      { path: 'tenants/lifecycle', element: <GlobalTenantsLifecyclePage /> },
      { path: 'webhooks', element: <GlobalWebhooksPage /> },
    ],
  },

  // Tenant routes
  {
    path: '/tenant',
    element: <TenantLayout />,
    children: [
      { index: true, element: <TenantDashboardPage /> },
      { path: 'dashboard', element: <TenantDashboardPage /> },

      // Basic
      { path: 'users', element: <TenantUsersPage /> },
      { path: 'users/:id', element: <TenantUsersDetailPage /> },
      { path: 'apps', element: <TenantAppsPage /> },
      { path: 'apps/:id', element: <TenantAppsDetailPage /> },
      { path: 'roles', element: <TenantRolesPage /> },
      { path: 'roles/:id', element: <TenantRolesDetailPage /> },
      { path: 'audit', element: <TenantAuditPage /> },
      { path: 'settings', element: <TenantSettingsPage /> },

      // Access Management
      { path: 'access/certifications', element: <TenantAccessCertificationsPage /> },
      { path: 'access/reviews', element: <TenantAccessReviewsPage /> },
      { path: 'access-requests', element: <TenantAccessRequestsPage /> },
      { path: 'access-requests/:id', element: <TenantAccessRequestsDetailPage /> },

      // Analytics
      { path: 'analytics', element: <TenantAnalyticsPage /> },
      { path: 'analytics/applications', element: <TenantAnalyticsApplicationsPage /> },
      { path: 'analytics/security', element: <TenantAnalyticsSecurityPage /> },
      { path: 'analytics/users', element: <TenantAnalyticsUsersPage /> },

      // Automation
      { path: 'automation', element: <TenantAutomationPage /> },
      { path: 'automation/designer', element: <TenantAutomationDesignerPage /> },
      { path: 'automation/workflows/:id', element: <TenantAutomationWorkflowsDetailPage /> },
      { path: 'automation/workflows/:id/executions', element: <TenantAutomationWorkflowsDetailExecutionsPage /> },

      // Security & Compliance
      { path: 'adaptive-security', element: <TenantAdaptiveSecurityPage /> },
      { path: 'certificates', element: <TenantCertificatesPage /> },
      { path: 'compliance', element: <TenantCompliancePage /> },
      { path: 'conditional-access', element: <TenantConditionalAccessPage /> },
      { path: 'security', element: <TenantSecurityPage /> },
      { path: 'security/anomaly-detection', element: <TenantSecurityAnomalyDetectionPage /> },
      { path: 'privacy', element: <TenantPrivacyPage /> },
      { path: 'privileged-access', element: <TenantPrivilegedAccessPage /> },
      { path: 'mfa-management', element: <TenantMfaManagementPage /> },

      // Governance
      { path: 'governance', element: <TenantGovernancePage /> },
      { path: 'governance/campaigns', element: <TenantGovernanceCampaignsPage /> },
      { path: 'policies', element: <TenantPoliciesPage /> },
      { path: 'policies/:id', element: <TenantPoliciesDetailPage /> },

      // Incidents & Risk
      { path: 'incidents', element: <TenantIncidentsPage /> },
      { path: 'incidents/:id', element: <TenantIncidentsDetailPage /> },
      { path: 'risk-events', element: <TenantRiskEventsPage /> },
      { path: 'risk-events/:id', element: <TenantRiskEventsDetailPage /> },
      { path: 'alerts', element: <TenantAlertsPage /> },
      { path: 'hunting', element: <TenantHuntingPage /> },

      // Integrations
      { path: 'integrations', element: <TenantIntegrationsPage /> },
      { path: 'integrations/:id', element: <TenantIntegrationsDetailPage /> },
      { path: 'webhooks', element: <TenantWebhooksPage /> },
      { path: 'extensibility', element: <TenantExtensibilityPage /> },
      { path: 'api-keys', element: <TenantApiKeysPage /> },
      { path: 'api-usage', element: <TenantApiUsagePage /> },

      // Admin & Configuration
      { path: 'delegated-admins', element: <TenantDelegatedAdminsPage /> },
      { path: 'delegated-admins/:id', element: <TenantDelegatedAdminsDetailPage /> },
      { path: 'service-accounts', element: <TenantServiceAccountsPage /> },
      { path: 'service-accounts/:id', element: <TenantServiceAccountsDetailPage /> },
      { path: 'org-units', element: <TenantOrgUnitsPage /> },
      { path: 'org-units/:id', element: <TenantOrgUnitsDetailPage /> },
      { path: 'scopes', element: <TenantScopesPage /> },
      { path: 'schedules', element: <TenantSchedulesPage /> },

      // Operations
      { path: 'backups', element: <TenantBackupsPage /> },
      { path: 'exports', element: <TenantExportsPage /> },
      { path: 'imports', element: <TenantImportsPage /> },
      { path: 'lifecycle', element: <TenantLifecyclePage /> },
      { path: 'data-retention', element: <TenantDataRetentionPage /> },

      // Monitoring & Insights
      { path: 'insights', element: <TenantInsightsPage /> },
      { path: 'insights/advanced', element: <TenantInsightsAdvancedPage /> },
      { path: 'observability', element: <TenantObservabilityPage /> },
      { path: 'sessions', element: <TenantSessionsPage /> },

      // Customization
      { path: 'branding', element: <TenantBrandingPage /> },
      { path: 'templates', element: <TenantTemplatesPage /> },
      { path: 'notifications', element: <TenantNotificationsPage /> },
      { path: 'notifications/templates/:id', element: <TenantNotificationsTemplatesDetailPage /> },
      { path: 'domains', element: <TenantDomainsPage /> },
      { path: 'federation', element: <TenantFederationPage /> },

      // Other
      { path: 'account', element: <TenantAccountPage /> },
      { path: 'billing', element: <TenantBillingPage /> },
      { path: 'change-management', element: <TenantChangeManagementPage /> },
      { path: 'copilot', element: <TenantCopilotPage /> },
      { path: 'ip-whitelist', element: <TenantIpWhitelistPage /> },
      { path: 'quotas', element: <TenantQuotasPage /> },
      { path: 'reports', element: <TenantReportsPage /> },
      { path: 'reports/compliance', element: <TenantReportsCompliancePage /> },
      { path: 'tokens', element: <TenantTokensPage /> },
    ],
  },
];
