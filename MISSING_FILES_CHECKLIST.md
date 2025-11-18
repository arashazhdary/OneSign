# OneSign Implementation - Missing Files Checklist

This document provides a detailed checklist of all files that need to be created to complete the Phase implementations.

---

## Phase 11 - NotificationCenter

### Missing Application DTOs
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/DTOs/NotificationChannelConfigDto.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/DTOs/NotificationEventSubscriptionDto.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/DTOs/NotificationDeliveryLogDto.cs`

### Missing Commands
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Commands/UpdateNotificationTemplateCommand.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Commands/DeleteNotificationTemplateCommand.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Commands/UpdateNotificationChannelConfigCommand.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Commands/UpdateNotificationEventSubscriptionCommand.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Commands/RetryNotificationCommand.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Commands/CancelNotificationCommand.cs`

### Missing Queries
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Queries/GetNotificationTemplateDetailsQuery.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Queries/GetNotificationChannelConfigQuery.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Queries/GetNotificationEventSubscriptionsQuery.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Queries/GetNotificationDeliveryLogsQuery.cs`

### Missing Handlers
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Handlers/UpdateNotificationTemplateCommandHandler.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Handlers/DeleteNotificationTemplateCommandHandler.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Handlers/UpdateNotificationChannelConfigCommandHandler.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Handlers/UpdateNotificationEventSubscriptionCommandHandler.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Handlers/RetryNotificationCommandHandler.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Handlers/CancelNotificationCommandHandler.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Handlers/GetNotificationTemplateDetailsQueryHandler.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Handlers/GetNotificationChannelConfigQueryHandler.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Handlers/GetNotificationEventSubscriptionsQueryHandler.cs`
- [ ] `/src/Onesign.Modules.NotificationCenter/Application/Handlers/GetNotificationDeliveryLogsQueryHandler.cs`

---

## Phase 12 - AccessRequests

### Missing Domain Services
- [ ] `/src/Onesign.Modules.AccessRequests/Domain/Services/IAccessApprovalService.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Domain/Services/IAccessRequestWorkflowEngine.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Domain/Services/IAccessRequestProvisioningService.cs`

### Missing Domain Entities
- [ ] `/src/Onesign.Modules.AccessRequests/Domain/Entities/AccessRequestSlaConfig.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Domain/Entities/AccessApprovalFlow.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Domain/Entities/AccessApprovalDecision.cs`

### Missing Application DTOs
- [ ] `/src/Onesign.Modules.AccessRequests/Application/DTOs/AccessApprovalFlowDto.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/DTOs/CreateAccessApprovalFlowRequest.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/DTOs/UpdateAccessApprovalFlowRequest.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/DTOs/ApprovalDecisionDto.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/DTOs/AccessRequestDashboardStatsDto.cs`

### Missing Commands
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Commands/SubmitAccessRequestCommand.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Commands/CancelAccessRequestCommand.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Commands/ApproveAccessRequestStepCommand.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Commands/RejectAccessRequestStepCommand.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Commands/EscalateAccessRequestStepCommand.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Commands/CreateAccessApprovalFlowCommand.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Commands/UpdateAccessApprovalFlowCommand.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Commands/DeleteAccessApprovalFlowCommand.cs`

### Missing Queries
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Queries/GetMyAccessRequestsQuery.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Queries/GetAccessRequestsForApproverQuery.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Queries/GetAccessRequestDetailsQuery.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Queries/GetAccessApprovalFlowsQuery.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Queries/GetAccessApprovalFlowDetailsQuery.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Application/Queries/GetAccessRequestDashboardStatsQuery.cs`

### Missing Handlers
- [ ] (All handlers for above commands/queries)

### Missing Infrastructure
- [ ] `/src/Onesign.Modules.AccessRequests/Infrastructure/EfCore/Entities/AccessApprovalFlowEntity.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Infrastructure/EfCore/Entities/AccessApprovalDecisionEntity.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Infrastructure/EfCore/Entities/AccessRequestSlaConfigEntity.cs`
- [ ] `/src/Onesign.Modules.AccessRequests/Infrastructure/EfCore/Configurations/*EntityTypeConfiguration.cs` (for new entities)

---

## Phase 13 - Platform Hardening & Tenant Isolation

### Missing Middleware
- [ ] `/src/Onesign.Api/Middleware/TenantStatusEnforcementMiddleware.cs`
- [ ] `/src/Onesign.Api/Middleware/RateLimitingMiddleware.cs`

### Missing Shared Services
- [ ] `/src/Onesign.Shared/Services/ITenantDbConnectionFactory.cs`
- [ ] `/src/Onesign.Api/Services/TenantDbConnectionFactory.cs`

### Missing Controllers
- [ ] `/src/Onesign.Api/Controllers/Global/TenantLifecycleController.cs`
- [ ] `/src/Onesign.Api/Controllers/Health/HealthController.cs`

### Missing Tools/CLI
- [ ] `/src/Onesign.Api/Tools/TenantMigrationTool.cs` (or separate project)

### Missing Services
- [ ] `/src/Onesign.Api/Services/TenantCacheService.cs`
- [ ] `/src/Onesign.Api/Services/ConfigurationCacheService.cs`

---

## Phase 14 - SDKs & Developer Tooling

### Missing SDK Projects (NEW SOLUTIONS)
- [ ] `/src/Onesign.Sdk.AspNetCore/` (complete NuGet package)
- [ ] `/src/onesign-sdk-node/` (NPM package project)
- [ ] `/src/onesign-sdk-react/` (NPM package project)
- [ ] `/tools/onesign-cli/` (standalone CLI tool)

### Missing Sample Applications
- [ ] `/samples/dotnet-api/` (complete minimal sample)
- [ ] `/samples/node-api/` (complete minimal sample)
- [ ] `/samples/react-spa/` (complete minimal sample)

---

## Phase 15 - Identity Lifecycle Automation

### Missing Application DTOs
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/DTOs/HRIdentityRecordDto.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/DTOs/LifecycleEventDto.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/DTOs/AccessPackageDto.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/DTOs/CreateAccessPackageRequest.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/DTOs/UpdateAccessPackageRequest.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/DTOs/LifecyclePolicyDto.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/DTOs/CreateLifecyclePolicyRequest.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/DTOs/UpdateLifecyclePolicyRequest.cs`

### Missing Commands
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Commands/CreateAccessPackageCommand.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Commands/UpdateAccessPackageCommand.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Commands/DeleteAccessPackageCommand.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Commands/CreateLifecyclePolicyCommand.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Commands/UpdateLifecyclePolicyCommand.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Commands/DeleteLifecyclePolicyCommand.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Commands/ProcessLifecycleEventCommand.cs`

### Missing Queries
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Queries/GetAccessPackagesQuery.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Queries/GetAccessPackageDetailsQuery.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Queries/GetLifecyclePoliciesQuery.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Queries/GetUserLifecycleEventsQuery.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Application/Queries/GetProcessingStatusQuery.cs`

### Missing Domain Services
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Domain/Services/ILifecyclePolicyEvaluator.cs`
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Domain/Services/LifecyclePolicyEvaluator.cs` (implementation)
- [ ] `/src/Onesign.Modules.IdentityLifecycle/Domain/Services/LifecycleProcessorService.cs` (implementation)

### Missing Background Workers
- [ ] `/src/Onesign.Api/BackgroundServices/LifecycleEventProcessorWorker.cs`

---

## Phase 16 - Privileged Access & JIT

### Missing Application DTOs
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/DTOs/JitGrantDto.cs`
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/DTOs/BreakGlassAccountDto.cs`
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/DTOs/PrivilegedSessionDto.cs`

### Missing Commands
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/Commands/CreateBreakGlassAccountCommand.cs`
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/Commands/UpdateBreakGlassAccountCommand.cs`
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/Commands/DeleteBreakGlassAccountCommand.cs`
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/Commands/ExpireJitGrantCommand.cs`

### Missing Queries
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/Queries/GetActiveJitGrantsQuery.cs`
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/Queries/GetBreakGlassAccountsQuery.cs`
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/Queries/GetPrivilegedSessionsQuery.cs`
- [ ] `/src/Onesign.Modules.PrivilegedAccess/Application/Queries/GetPrivilegedAccessDashboardQuery.cs`

### Missing Background Workers
- [ ] `/src/Onesign.Api/BackgroundServices/JitExpiryWorker.cs`

---

## Phase 17 - Identity Analytics & Risk Scoring

### Missing Application DTOs
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/DTOs/TenantRiskProfileDto.cs`
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/DTOs/InsightDetailDto.cs`
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/DTOs/HighRiskUserDto.cs`
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/DTOs/ZombieAccountDto.cs`

### Missing Commands
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/Commands/ResolveInsightCommand.cs`
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/Commands/DismissInsightCommand.cs`
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/Commands/CreateManualInsightCommand.cs`

### Missing Queries
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/Queries/GetHighRiskUsersQuery.cs`
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/Queries/GetTenantRiskQuery.cs`
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/Queries/GetInsightsDashboardQuery.cs`
- [ ] `/src/Onesign.Modules.IdentityInsights/Application/Queries/GetZombieAccountsQuery.cs`

### Missing Domain Services
- [ ] `/src/Onesign.Modules.IdentityInsights/Domain/Services/IRiskScoringService.cs`
- [ ] `/src/Onesign.Modules.IdentityInsights/Domain/Services/IInsightGenerationService.cs`
- [ ] `/src/Onesign.Modules.IdentityInsights/Infrastructure/Services/RiskScoringService.cs` (implementation)
- [ ] `/src/Onesign.Modules.IdentityInsights/Infrastructure/Services/InsightGenerationService.cs` (implementation)

### Missing Background Workers
- [ ] `/src/Onesign.Api/BackgroundServices/RiskScoringCalculatorWorker.cs`

---

## Phase 18 - AI Adaptive Security & Copilot

### NEW MODULE - Entire Modules to Create:
- [ ] `/src/Onesign.Modules.SecurityAdaptive/` (complete module)
- [ ] `/src/Onesign.Modules.SecurityCopilot/` (complete module)

### Missing Controllers
- [ ] `/src/Onesign.Api/Controllers/Tenant/CopilotController.cs`

---

## Phase 19 - Extensibility & Hooks Platform

### Missing Domain Services
- [ ] `/src/Onesign.Modules.Extensibility/Domain/Services/IEventPublisher.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Domain/Services/IWebhookDeliveryService.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Domain/Services/ILoginHookExecutor.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Domain/Services/ITokenTransformationEngine.cs`

### Missing Application Commands
- [ ] `/src/Onesign.Modules.Extensibility/Application/Commands/UpdateWebhookCommand.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Application/Commands/DeleteWebhookCommand.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Application/Commands/UpdateLoginHookCommand.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Application/Commands/DeleteLoginHookCommand.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Application/Commands/CreateTokenRuleCommand.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Application/Commands/UpdateTokenRuleCommand.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Application/Commands/DeleteTokenRuleCommand.cs`

### Missing Application Queries
- [ ] `/src/Onesign.Modules.Extensibility/Application/Queries/GetWebhooksQuery.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Application/Queries/GetLoginHooksQuery.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Application/Queries/GetTokenRulesQuery.cs`
- [ ] `/src/Onesign.Modules.Extensibility/Application/Queries/GetWebhookDeliveryLogsQuery.cs`

### Missing Background Workers
- [ ] `/src/Onesign.Api/BackgroundServices/WebhookDeliveryWorker.cs`

### Missing Core Services
- [ ] `/src/Onesign.Api/Services/EventPublisher.cs`

---

## Phase 20 - Multi-Region & DR

### Missing Domain Services
- [ ] `/src/Onesign.Modules.MultiRegion/Domain/Services/IRegionHealthMonitor.cs`
- [ ] `/src/Onesign.Modules.MultiRegion/Domain/Services/IBackupService.cs`
- [ ] `/src/Onesign.Modules.MultiRegion/Domain/Services/IRestoreService.cs`
- [ ] `/src/Onesign.Modules.MultiRegion/Domain/Services/IFailoverService.cs`
- [ ] `/src/Onesign.Modules.MultiRegion/Domain/Services/ITenantDataResidencyService.cs`

### Missing Application Commands
- [ ] `/src/Onesign.Modules.MultiRegion/Application/Commands/FailoverRegionCommand.cs`
- [ ] `/src/Onesign.Modules.MultiRegion/Application/Commands/RestoreTenantFromBackupCommand.cs`
- [ ] `/src/Onesign.Modules.MultiRegion/Application/Commands/InitiateRegionFailoverCommand.cs`

### Missing Application Queries
- [ ] `/src/Onesign.Modules.MultiRegion/Application/Queries/GetRegionStatusQuery.cs`
- [ ] `/src/Onesign.Modules.MultiRegion/Application/Queries/GetTenantDataResidencyQuery.cs`
- [ ] `/src/Onesign.Modules.MultiRegion/Application/Queries/GetBackupSetsQuery.cs`
- [ ] `/src/Onesign.Modules.MultiRegion/Application/Queries/GetDRStatusQuery.cs`

### Missing Background Workers
- [ ] `/src/Onesign.Api/BackgroundServices/BackupSchedulerWorker.cs`
- [ ] `/src/Onesign.Api/BackgroundServices/RegionHealthCheckerWorker.cs`
- [ ] `/src/Onesign.Api/BackgroundServices/DataResidencyEnforcementWorker.cs`

### Missing Controllers
- [ ] `/src/Onesign.Api/Controllers/Health/HealthController.cs`

---

## Phase 21 - On-Prem & Hybrid Deployment

### Missing Domain Models
- [ ] `/src/Onesign.Modules.Deployment/Domain/Models/DeploymentDescriptor.cs`

### Missing Domain Services
- [ ] `/src/Onesign.Modules.Deployment/Domain/Services/IDeploymentInitializer.cs`
- [ ] `/src/Onesign.Modules.Deployment/Domain/Services/ILicenseValidator.cs`

### Missing Application Commands
- [ ] `/src/Onesign.Modules.Deployment/Application/Commands/InitializeEnvironmentCommand.cs`
- [ ] `/src/Onesign.Modules.Deployment/Application/Commands/UpdateDeploymentDescriptorCommand.cs`
- [ ] `/src/Onesign.Modules.Deployment/Application/Commands/ValidateLicenseCommand.cs`

### Missing Application Queries
- [ ] `/src/Onesign.Modules.Deployment/Application/Queries/GetDeploymentDescriptorQuery.cs`
- [ ] `/src/Onesign.Modules.Deployment/Application/Queries/GetEnvironmentConfigQuery.cs`
- [ ] `/src/Onesign.Modules.Deployment/Application/Queries/GetEnvironmentVersionsQuery.cs`

### Missing Infrastructure
- [ ] `/src/Onesign.Modules.Deployment/Infrastructure/Services/DeploymentInitializer.cs`
- [ ] `/src/Onesign.Modules.Deployment/Infrastructure/Services/YamlDeploymentDescriptorParser.cs`

### Missing Tools
- [ ] `/tools/Installer/` (separate project or CLI tool)

---

## Phase 22 - Crypto & Key Management

### Missing Domain Services
- [ ] `/src/Onesign.Modules.Crypto/Domain/Services/IKeyStore.cs`
- [ ] `/src/Onesign.Modules.Crypto/Domain/Services/IKeyGenerator.cs`
- [ ] `/src/Onesign.Modules.Crypto/Domain/Services/IKeyRotationEngine.cs`
- [ ] `/src/Onesign.Modules.Crypto/Domain/Services/IKeyProvider.cs`

### Missing Application Commands
- [ ] `/src/Onesign.Modules.Crypto/Application/Commands/GenerateKeyCommand.cs`
- [ ] `/src/Onesign.Modules.Crypto/Application/Commands/RotateKeyCommand.cs`
- [ ] `/src/Onesign.Modules.Crypto/Application/Commands/RevokeKeyCommand.cs`
- [ ] `/src/Onesign.Modules.Crypto/Application/Commands/RolloverKeyCommand.cs`

### Missing Application Queries
- [ ] `/src/Onesign.Modules.Crypto/Application/Queries/GetKeySetQuery.cs`
- [ ] `/src/Onesign.Modules.Crypto/Application/Queries/GetKeyVersionsQuery.cs`
- [ ] `/src/Onesign.Modules.Crypto/Application/Queries/GetRotationPolicyQuery.cs`
- [ ] `/src/Onesign.Modules.Crypto/Application/Queries/GetJwksQuery.cs`

### Missing Background Workers
- [ ] `/src/Onesign.Api/BackgroundServices/KeyRotationWorker.cs`

### Missing KeyStore Implementations
- [ ] `/src/Onesign.Modules.Crypto/Infrastructure/KeyStore/LocalKeyStore.cs`
- [ ] `/src/Onesign.Modules.Crypto/Infrastructure/KeyStore/AzureKeyVaultKeyStore.cs`
- [ ] `/src/Onesign.Modules.Crypto/Infrastructure/KeyStore/AwsKmsKeyStore.cs`
- [ ] `/src/Onesign.Modules.Crypto/Infrastructure/KeyStore/HashicorpVaultKeyStore.cs`
- [ ] `/src/Onesign.Modules.Crypto/Infrastructure/KeyStore/HsmKeyStore.cs`

### Missing Implementations
- [ ] `/src/Onesign.Modules.Crypto/Infrastructure/Services/KeyGenerator.cs`
- [ ] `/src/Onesign.Modules.Crypto/Infrastructure/Services/KeyRotationEngine.cs`
- [ ] `/src/Onesign.Modules.Crypto/Infrastructure/Services/KeyProvider.cs`

---

## Phase 23 - Privacy & Data Protection

### Missing Domain Services
- [ ] `/src/Onesign.Modules.Privacy/Domain/Services/IDataRetentionService.cs`
- [ ] `/src/Onesign.Modules.Privacy/Domain/Services/IAnonymizationService.cs`
- [ ] `/src/Onesign.Modules.Privacy/Domain/Services/IDataExportService.cs`
- [ ] `/src/Onesign.Modules.Privacy/Domain/Services/IDataSubjectRequestProcessor.cs`

### Missing Application Commands
- [ ] `/src/Onesign.Modules.Privacy/Application/Commands/CreateDataRetentionPolicyCommand.cs`
- [ ] `/src/Onesign.Modules.Privacy/Application/Commands/UpdateDataRetentionPolicyCommand.cs`
- [ ] `/src/Onesign.Modules.Privacy/Application/Commands/CreateDataSubjectRequestCommand.cs`
- [ ] `/src/Onesign.Modules.Privacy/Application/Commands/ApproveDataSubjectRequestCommand.cs`
- [ ] `/src/Onesign.Modules.Privacy/Application/Commands/RejectDataSubjectRequestCommand.cs`
- [ ] `/src/Onesign.Modules.Privacy/Application/Commands/ProcessDataSubjectRequestCommand.cs`

### Missing Application Queries
- [ ] `/src/Onesign.Modules.Privacy/Application/Queries/GetDataRetentionPoliciesQuery.cs`
- [ ] `/src/Onesign.Modules.Privacy/Application/Queries/GetDataSubjectRequestsQuery.cs`
- [ ] `/src/Onesign.Modules.Privacy/Application/Queries/GetDataSubjectRequestDetailsQuery.cs`

### Missing Background Workers
- [ ] `/src/Onesign.Api/BackgroundServices/DataRetentionEnforcementWorker.cs`
- [ ] `/src/Onesign.Api/BackgroundServices/DataSubjectRequestProcessorWorker.cs`

### Missing Implementations
- [ ] `/src/Onesign.Modules.Privacy/Infrastructure/Services/AnonymizationService.cs`
- [ ] `/src/Onesign.Modules.Privacy/Infrastructure/Services/DataExportService.cs`
- [ ] `/src/Onesign.Modules.Privacy/Infrastructure/Services/DataRetentionService.cs`
- [ ] `/src/Onesign.Modules.Privacy/Infrastructure/Services/DataSubjectRequestProcessor.cs`

---

## Summary Statistics

Total files needed across all phases: ~250+ files

### By Category:
- **Domain Services**: ~45+ files
- **Application Commands**: ~60+ files
- **Application Queries**: ~50+ files
- **Application Handlers**: ~80+ files
- **Application DTOs**: ~40+ files
- **Infrastructure Services**: ~30+ files
- **Background Workers**: ~15+ files
- **Controllers**: ~5+ files
- **SDK/Tools**: ~20+ files

