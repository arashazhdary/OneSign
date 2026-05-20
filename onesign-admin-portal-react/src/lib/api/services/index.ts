// Export all API services
// Based on OneSign Technical Specification

// Authentication services
export { authService } from './auth.service';

// Tenant-level services
export { applicationsService } from './applications.service';
export { orgUnitsService } from './org-units.service';
export { rolesService } from './roles.service';
export { securityService } from './security.service';
export { policiesService } from './policies.service';
export { accessService } from './access.service';
export { privilegedAccessService } from './privileged-access.service';
export { incidentsService } from './incidents.service';
export { tenantService } from './tenant.service';
export { billingService } from './billing.service';
export { lifecycleService } from './lifecycle.service';

// Global-level services
export { globalService } from './global.service';
export { adminService } from './admin.service';

// Other services
export { automationService } from './automation.service';
export { huntingService } from './hunting.service';
export { copilotService } from './copilot.service';
export { changeManagementService } from './change-management.service';
export { governanceService } from './governance.service';
export { platformService } from './platform.service';
export { usersService } from './users.service';

// Re-export types
export type {
  ApplicationDto,
  CreateApplicationDto,
  UpdateApplicationDto,
  RedirectUriDto,
  ClientSecretDto,
} from './applications.service';

export type {
  OrgUnitDto,
  OrgUnitTreeNode,
  CreateOrgUnitDto,
  UpdateOrgUnitDto,
} from './org-units.service';

export type {
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  PermissionDto,
} from './roles.service';

export type {
  SecurityPolicyDto,
  UpdateSecurityPolicyDto,
  OrgUnitMfaRuleDto,
  AdaptiveSecurityPolicyDto,
  SecuritySignalDto,
  HighRiskUserDto,
  UserSecurityContextDto,
} from './security.service';

export type {
  AccessRequestDto,
  CreateAccessRequestDto,
} from './access.service';

export type {
  JitGrantDto,
  JitRequestDto,
  BreakGlassAccountDto,
  PrivilegedSessionDto,
  PamDashboardDto,
} from './privileged-access.service';

export type {
  TenantDto,
  CreateTenantDto,
  RegionDto,
  KeySetDto,
  BillingPlanDto,
  GlobalInsightsOverviewDto,
  RiskyTenantDto,
} from './global.service';

export type {
  ChangeSetDto,
  ChangeItemDto,
  ImpactAnalysisDto,
  SimulationResultDto,
} from './change-management.service';

export type {
  SubscriptionDto,
  QuotaStatusDto,
  BillingSummaryDto,
  InvoiceDto,
  ApiUsageDto,
} from './billing.service';

export type {
  AccessPackageDto,
  LifecycleEventDto,
  LifecyclePolicyDto,
  HrRecordDto,
} from './lifecycle.service';

export type {
  LoginDto,
  LoginResponseDto,
  UserInfoDto,
} from './auth.service';
