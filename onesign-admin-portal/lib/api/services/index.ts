/**
 * Services Export
 * Central export point for all API services
 */

// Export service classes
export { AuthService, authService } from './auth.service';
export { UsersService, usersService } from './users.service';
export { ApplicationsService, applicationsService } from './applications.service';
export { SecurityService, securityService } from './security.service';
export { IncidentsService, incidentsService } from './incidents.service';
export { GovernanceService, governanceService } from './governance.service';
export { AutomationService, automationService } from './automation.service';
export { CopilotService, copilotService } from './copilot.service';
export { PlatformService, platformService } from './platform.service';
export { BillingService, billingService } from './billing.service';
export { HuntingService, huntingService } from './hunting.service';
export { AccessService, accessService } from './access.service';
export { LifecycleService, lifecycleService } from './lifecycle.service';
export { ChangeManagementService, changeManagementService } from './change-management.service';
export { ObservabilityService, observabilityService } from './observability.service';

// Export all services as a single object
export const services = {
  auth: authService,
  users: usersService,
  applications: applicationsService,
  security: securityService,
  incidents: incidentsService,
  governance: governanceService,
  automation: automationService,
  copilot: copilotService,
  platform: platformService,
  billing: billingService,
  hunting: huntingService,
  access: accessService,
  lifecycle: lifecycleService,
  changeManagement: changeManagementService,
  observability: observabilityService,
};
