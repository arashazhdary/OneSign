using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Audit.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Audit.Infrastructure.EfCore.Entities;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;
using Onesign.Modules.Billing.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;
using Onesign.Modules.Developer.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;
using Onesign.Modules.Federation.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;
using Onesign.Modules.Observability.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Observability.Infrastructure.EfCore.Entities;
using Onesign.Modules.Identity.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;
using Onesign.Modules.Organization.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;
using Onesign.Modules.Security.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Entities;
// Phase 11 - Notification Center
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Configurations;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;
// Phase 12 - Access Requests
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Configurations;
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;
// Phase 15 - Identity Lifecycle
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Configurations;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;
// Phase 16 - Privileged Access
using Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Configurations;
using Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Entities;
// Phase 17 - Identity Insights
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Configurations;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;
// Phase 19 - Extensibility
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;
// Phase 20 - Multi-Region
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Configurations;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;
// Phase 21 - Deployment
using Onesign.Modules.Deployment.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Deployment.Infrastructure.EfCore.Entities;
// Phase 22 - Crypto
using Onesign.Modules.Crypto.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;
// Phase 23 - Privacy
using Onesign.Modules.Privacy.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Entities;
// Phase 18 - Adaptive Security
using Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Configurations;
using Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Entities;
// Phase 26 - Automation
using Onesign.Modules.Automation.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

namespace Onesign.Api.Data;

public class OnesignDbContext : DbContext
{
    public OnesignDbContext(DbContextOptions<OnesignDbContext> options) : base(options)
    {
    }

    // Tenants
    public DbSet<TenantEntity> Tenants => Set<TenantEntity>();
    public DbSet<TenantConfigEntity> TenantConfigs => Set<TenantConfigEntity>();

    // Identity
    public DbSet<GlobalUserEntity> GlobalUsers => Set<GlobalUserEntity>();
    public DbSet<TenantUserEntity> TenantUsers => Set<TenantUserEntity>();
    public DbSet<PasswordResetTokenEntity> PasswordResetTokens => Set<PasswordResetTokenEntity>();
    public DbSet<UserLoginSessionEntity> UserLoginSessions => Set<UserLoginSessionEntity>();
    public DbSet<ExternalLoginEntity> ExternalLogins => Set<ExternalLoginEntity>();
    public DbSet<AuthorizationCodeEntity> AuthorizationCodes => Set<AuthorizationCodeEntity>();

    // Applications
    public DbSet<ApplicationClientEntity> ApplicationClients => Set<ApplicationClientEntity>();
    public DbSet<ClientRedirectUriEntity> ClientRedirectUris => Set<ClientRedirectUriEntity>();
    public DbSet<ClientSecretEntity> ClientSecrets => Set<ClientSecretEntity>();

    // Audit
    public DbSet<AuditEventEntity> AuditEvents => Set<AuditEventEntity>();

    // Organization
    public DbSet<OrgUnitEntity> OrgUnits => Set<OrgUnitEntity>();
    public DbSet<UserOrgUnitEntity> UserOrgUnits => Set<UserOrgUnitEntity>();
    public DbSet<ApplicationOrgUnitEntity> ApplicationOrgUnits => Set<ApplicationOrgUnitEntity>();
    public DbSet<DelegatedAdminScopeEntity> DelegatedAdminScopes => Set<DelegatedAdminScopeEntity>();

    // Security
    public DbSet<SecurityPolicyEntity> SecurityPolicies => Set<SecurityPolicyEntity>();
    public DbSet<OrgUnitMfaRuleEntity> OrgUnitMfaRules => Set<OrgUnitMfaRuleEntity>();
    public DbSet<UserMfaMethodEntity> UserMfaMethods => Set<UserMfaMethodEntity>();
    public DbSet<MfaChallengeEntity> MfaChallenges => Set<MfaChallengeEntity>();
    public DbSet<TrustedDeviceEntity> TrustedDevices => Set<TrustedDeviceEntity>();
    public DbSet<RiskEventEntity> RiskEvents => Set<RiskEventEntity>();
    // NotificationCenter
    public DbSet<NotificationTemplateEntity> NotificationTemplates => Set<NotificationTemplateEntity>();
    public DbSet<NotificationChannelConfigEntity> NotificationChannelConfigs => Set<NotificationChannelConfigEntity>();
    public DbSet<NotificationOutboxItemEntity> NotificationOutboxItems => Set<NotificationOutboxItemEntity>();
    public DbSet<NotificationEventSubscriptionEntity> NotificationEventSubscriptions => Set<NotificationEventSubscriptionEntity>();
    public DbSet<NotificationDeliveryLogEntity> NotificationDeliveryLogs => Set<NotificationDeliveryLogEntity>();

    // AccessRequests
    public DbSet<AccessRequestEntity> AccessRequests => Set<AccessRequestEntity>();
    public DbSet<ApprovalStepEntity> ApprovalSteps => Set<ApprovalStepEntity>();
    public DbSet<AccessRequestItemEntity> AccessRequestItems => Set<AccessRequestItemEntity>();
    public DbSet<WorkflowDefinitionEntity> WorkflowDefinitions => Set<WorkflowDefinitionEntity>();

    // IdentityLifecycle
    public DbSet<HRIdentityRecordEntity> HRIdentityRecords => Set<HRIdentityRecordEntity>();
    public DbSet<LifecycleEventEntity> LifecycleEvents => Set<LifecycleEventEntity>();
    public DbSet<AccessPackageEntity> AccessPackages => Set<AccessPackageEntity>();
    public DbSet<LifecyclePolicyEntity> LifecyclePolicies => Set<LifecyclePolicyEntity>();

    // PrivilegedAccess
    public DbSet<JitGrantEntity> JitGrants => Set<JitGrantEntity>();
    public DbSet<BreakGlassAccountEntity> BreakGlassAccounts => Set<BreakGlassAccountEntity>();
    public DbSet<PrivilegedSessionEntity> PrivilegedSessions => Set<PrivilegedSessionEntity>();

    // IdentityInsights
    public DbSet<UserRiskProfileEntity> UserRiskProfiles => Set<UserRiskProfileEntity>();
    public DbSet<InsightEntity> Insights => Set<InsightEntity>();
    public DbSet<TenantRiskProfileEntity> TenantRiskProfiles => Set<TenantRiskProfileEntity>();

    // Extensibility
    public DbSet<WebhookSubscriptionEntity> WebhookSubscriptions => Set<WebhookSubscriptionEntity>();
    public DbSet<LoginHookEntity> LoginHooks => Set<LoginHookEntity>();
    public DbSet<TokenTransformationRuleEntity> TokenTransformationRules => Set<TokenTransformationRuleEntity>();
    public DbSet<WebhookDeliveryLogEntity> WebhookDeliveryLogs => Set<WebhookDeliveryLogEntity>();

    // MultiRegion
    public DbSet<RegionEntity> Regions => Set<RegionEntity>();
    public DbSet<TenantDataResidencyEntity> TenantDataResidencies => Set<TenantDataResidencyEntity>();
    public DbSet<RegionBackupSetEntity> RegionBackupSets => Set<RegionBackupSetEntity>();
    public DbSet<TenantBackupSetEntity> TenantBackupSets => Set<TenantBackupSetEntity>();

    // Deployment
    public DbSet<DeploymentEnvironmentEntity> DeploymentEnvironments => Set<DeploymentEnvironmentEntity>();
    public DbSet<EnvironmentFeatureConfigEntity> EnvironmentFeatureConfigs => Set<EnvironmentFeatureConfigEntity>();

    // Crypto
    public DbSet<KeySetEntity> KeySets => Set<KeySetEntity>();
    public DbSet<KeyVersionEntity> KeyVersions => Set<KeyVersionEntity>();
    public DbSet<KeyRotationPolicyEntity> KeyRotationPolicies => Set<KeyRotationPolicyEntity>();

    // Privacy
    public DbSet<DataRetentionPolicyEntity> DataRetentionPolicies => Set<DataRetentionPolicyEntity>();
    public DbSet<DataSubjectRequestEntity> DataSubjectRequests => Set<DataSubjectRequestEntity>();

    // AdaptiveSecurity
    public DbSet<AdaptivePolicyEntity> AdaptivePolicies => Set<AdaptivePolicyEntity>();
    public DbSet<SecuritySignalEntity> SecuritySignals => Set<SecuritySignalEntity>();
    public DbSet<UserSecurityContextEntity> UserSecurityContexts => Set<UserSecurityContextEntity>();

    // Automation
    public DbSet<AutomationWorkflowEntity> AutomationWorkflows => Set<AutomationWorkflowEntity>();
    public DbSet<AutomationTriggerEntity> AutomationTriggers => Set<AutomationTriggerEntity>();
    public DbSet<AutomationConditionEntity> AutomationConditions => Set<AutomationConditionEntity>();
    public DbSet<AutomationActionEntity> AutomationActions => Set<AutomationActionEntity>();
    public DbSet<AutomationExecutionEntity> AutomationExecutions => Set<AutomationExecutionEntity>();

    // Federation
    public DbSet<SamlProviderEntity> SamlProviders => Set<SamlProviderEntity>();
    public DbSet<OidcFederationProviderEntity> OidcFederationProviders => Set<OidcFederationProviderEntity>();
    public DbSet<AttributeMappingEntity> AttributeMappings => Set<AttributeMappingEntity>();
    public DbSet<ScimTokenEntity> ScimTokens => Set<ScimTokenEntity>();
    public DbSet<JitProvisioningLogEntity> JitProvisioningLogs => Set<JitProvisioningLogEntity>();

    // Billing
    public DbSet<PlanEntity> Plans => Set<PlanEntity>();
    public DbSet<PlanFeatureEntity> PlanFeatures => Set<PlanFeatureEntity>();
    public DbSet<TenantSubscriptionEntity> TenantSubscriptions => Set<TenantSubscriptionEntity>();
    public DbSet<UsageCounterEntity> UsageCounters => Set<UsageCounterEntity>();
    public DbSet<TenantUsageSnapshotEntity> TenantUsageSnapshots => Set<TenantUsageSnapshotEntity>();

    // Observability
    public DbSet<AuditEventEntity> AuditEventsObservability => Set<AuditEventEntity>();

    // Authorization
    public DbSet<PolicyDefinitionEntity> PolicyDefinitions => Set<PolicyDefinitionEntity>();
    public DbSet<PolicyConditionGroupEntity> PolicyConditionGroups => Set<PolicyConditionGroupEntity>();
    public DbSet<PolicyConditionEntity> PolicyConditions => Set<PolicyConditionEntity>();
    public DbSet<PolicyTargetEntity> PolicyTargets => Set<PolicyTargetEntity>();
    public DbSet<PolicyAssignmentEntity> PolicyAssignments => Set<PolicyAssignmentEntity>();

    // Developer
    public DbSet<ApiKeyEntity> ApiKeys => Set<ApiKeyEntity>();
    public DbSet<ServiceAccountEntity> ServiceAccounts => Set<ServiceAccountEntity>();
    public DbSet<SdkConfigurationEntity> SdkConfigurations => Set<SdkConfigurationEntity>();
    public DbSet<WebhookEndpointEntity> WebhookEndpoints => Set<WebhookEndpointEntity>();
    public DbSet<ApiUsageLogEntity> ApiUsageLogs => Set<ApiUsageLogEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tenants
        modelBuilder.ApplyConfiguration(new TenantEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new TenantConfigEntityTypeConfiguration());

        // Identity
        modelBuilder.ApplyConfiguration(new GlobalUserEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new TenantUserEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new PasswordResetTokenEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new UserLoginSessionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new ExternalLoginEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new AuthorizationCodeEntityTypeConfiguration());

        // Applications
        modelBuilder.ApplyConfiguration(new ApplicationClientEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new ClientRedirectUriEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new ClientSecretEntityTypeConfiguration());

        // Audit
        modelBuilder.ApplyConfiguration(new AuditEventEntityTypeConfiguration());

        // Organization
        modelBuilder.ApplyConfiguration(new OrgUnitEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new UserOrgUnitEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new ApplicationOrgUnitEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new DelegatedAdminScopeEntityTypeConfiguration());

        // Security
        modelBuilder.ApplyConfiguration(new SecurityPolicyEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new OrgUnitMfaRuleEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new UserMfaMethodEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new MfaChallengeEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new TrustedDeviceEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new RiskEventEntityTypeConfiguration());

        // Federation
        modelBuilder.ApplyConfiguration(new SamlProviderEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new OidcFederationProviderEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new AttributeMappingEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new ScimTokenEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new JitProvisioningLogEntityTypeConfiguration());

        // Billing
        modelBuilder.ApplyConfiguration(new PlanEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new PlanFeatureEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new TenantSubscriptionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new UsageCounterEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new TenantUsageSnapshotEntityTypeConfiguration());

        // Observability
        modelBuilder.ApplyConfiguration(new AuditEventEntityTypeConfiguration());

        // Authorization
        modelBuilder.ApplyConfiguration(new PolicyDefinitionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new PolicyConditionGroupEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new PolicyConditionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new PolicyTargetEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new PolicyAssignmentEntityTypeConfiguration());

        // Developer
        modelBuilder.ApplyConfiguration(new ApiKeyEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new ServiceAccountEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new SdkConfigurationEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new WebhookEndpointEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new ApiUsageLogEntityTypeConfiguration());
        // NotificationCenter
        modelBuilder.ApplyConfiguration(new NotificationTemplateEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new NotificationChannelConfigEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new NotificationOutboxItemEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new NotificationEventSubscriptionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new NotificationDeliveryLogEntityTypeConfiguration());

        // AccessRequests
        modelBuilder.ApplyConfiguration(new AccessRequestEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new ApprovalStepEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new AccessRequestItemEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new WorkflowDefinitionEntityTypeConfiguration());

        // IdentityLifecycle
        modelBuilder.ApplyConfiguration(new HRIdentityRecordEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new LifecycleEventEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new AccessPackageEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new LifecyclePolicyEntityTypeConfiguration());

        // PrivilegedAccess
        modelBuilder.ApplyConfiguration(new JitGrantEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new BreakGlassAccountEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new PrivilegedSessionEntityTypeConfiguration());

        // IdentityInsights
        modelBuilder.ApplyConfiguration(new UserRiskProfileEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new InsightEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new TenantRiskProfileEntityTypeConfiguration());

        // Extensibility
        modelBuilder.ApplyConfiguration(new WebhookSubscriptionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new LoginHookEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new TokenTransformationRuleEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new WebhookDeliveryLogEntityTypeConfiguration());

        // MultiRegion
        modelBuilder.ApplyConfiguration(new RegionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new TenantDataResidencyEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new RegionBackupSetEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new TenantBackupSetEntityTypeConfiguration());

        // Deployment
        modelBuilder.ApplyConfiguration(new DeploymentEnvironmentEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new EnvironmentFeatureConfigEntityTypeConfiguration());

        // Crypto
        modelBuilder.ApplyConfiguration(new KeySetEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new KeyVersionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new KeyRotationPolicyEntityTypeConfiguration());

        // Privacy
        modelBuilder.ApplyConfiguration(new DataRetentionPolicyEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new DataSubjectRequestEntityTypeConfiguration());

        // AdaptiveSecurity
        modelBuilder.ApplyConfiguration(new AdaptivePolicyEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new SecuritySignalEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new UserSecurityContextEntityTypeConfiguration());

        // Automation
        modelBuilder.ApplyConfiguration(new AutomationWorkflowEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new AutomationTriggerEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new AutomationConditionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new AutomationActionEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new AutomationExecutionEntityTypeConfiguration());
    }
}

