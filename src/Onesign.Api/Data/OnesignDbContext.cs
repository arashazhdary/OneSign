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
    }
}

