/**
 * Services Export
 * Central export point for all API services
 */

// Import services first to ensure they're initialized
import { AuthService, authService } from './auth.service';
import { UsersService, usersService } from './users.service';
import { ApplicationsService, applicationsService } from './applications.service';
import { SecurityService, securityService } from './security.service';
import { IncidentsService, incidentsService } from './incidents.service';
import { GovernanceService, governanceService } from './governance.service';
import { AutomationService, automationService } from './automation.service';
import { CopilotService, copilotService } from './copilot.service';
import { PlatformService, platformService } from './platform.service';
import { BillingService, billingService } from './billing.service';
import { HuntingService, huntingService } from './hunting.service';
import { AccessService, accessService } from './access.service';
import { LifecycleService, lifecycleService } from './lifecycle.service';
import { ChangeManagementService, changeManagementService } from './change-management.service';
import { ObservabilityService, observabilityService } from './observability.service';

// Re-export service classes and instances
export { AuthService, authService };
export { UsersService, usersService };
export { ApplicationsService, applicationsService };
export { SecurityService, securityService };
export { IncidentsService, incidentsService };
export { GovernanceService, governanceService };
export { AutomationService, automationService };
export { CopilotService, copilotService };
export { PlatformService, platformService };
export { BillingService, billingService };
export { HuntingService, huntingService };
export { AccessService, accessService };
export { LifecycleService, lifecycleService };
export { ChangeManagementService, changeManagementService };
export { ObservabilityService, observabilityService };

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
