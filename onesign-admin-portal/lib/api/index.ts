/**
 * OneSign API Client
 * Main export point for the API client library
 *
 * @example
 * ```typescript
 * import { services, apiClient } from '@/lib/api';
 *
 * // Use singleton service instances
 * const users = await services.users.getUsers({ tenantId: 'xxx' });
 *
 * // Or create custom service instances
 * import { UsersService } from '@/lib/api';
 * const usersService = new UsersService(customApiClient);
 * ```
 */

// Export API Client
export { ApiClient, apiClient, createApiClient } from './api-client';
export type { ApiClientConfig, RequestConfig, ApiResponse } from './api-client';

// Export all services
export * from './services';

// Export all types
export * from './types';

// Export error classes
export * from './errors';

// Export utilities
export * from './utils';

// Export API modules
export * as AccessRequestsAPI from './access-requests';
export * as BrandingAPI from './branding';
export * as FederationAPI from './federation';
export * as LifecycleAPI from './lifecycle';
export * as NotificationsAPI from './notifications';
export * as PrivacyAPI from './privacy';
export * as ExtensibilityAPI from './extensibility';
export * as PlatformAPI from './platform';
export * as InsightsAPI from './insights';
export * as HuntingAPI from './hunting';
export * as CopilotAPI from './copilot';
export * as ChangeManagementAPI from './change-management';
export * as AutomationAPI from './automation';

// Default export
export default {
  client: apiClient,
  services: {
    auth: () => import('./services/auth.service').then(m => m.authService),
    users: () => import('./services/users.service').then(m => m.usersService),
    applications: () => import('./services/applications.service').then(m => m.applicationsService),
    security: () => import('./services/security.service').then(m => m.securityService),
    incidents: () => import('./services/incidents.service').then(m => m.incidentsService),
    governance: () => import('./services/governance.service').then(m => m.governanceService),
    automation: () => import('./services/automation.service').then(m => m.automationService),
    copilot: () => import('./services/copilot.service').then(m => m.copilotService),
    platform: () => import('./services/platform.service').then(m => m.platformService),
    billing: () => import('./services/billing.service').then(m => m.billingService),
  },
};
