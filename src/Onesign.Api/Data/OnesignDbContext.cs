using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Audit.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Audit.Infrastructure.EfCore.Entities;
using Onesign.Modules.Identity.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;
using Onesign.Modules.Organization.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;
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

    // PrivilegedAccess
    public DbSet<JitGrantEntity> JitGrants => Set<JitGrantEntity>();

    // IdentityInsights
    public DbSet<UserRiskProfileEntity> UserRiskProfiles => Set<UserRiskProfileEntity>();
    public DbSet<InsightEntity> Insights => Set<InsightEntity>();

    // Extensibility
    public DbSet<WebhookSubscriptionEntity> WebhookSubscriptions => Set<WebhookSubscriptionEntity>();

    // MultiRegion
    public DbSet<RegionEntity> Regions => Set<RegionEntity>();

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

        // PrivilegedAccess
        modelBuilder.ApplyConfiguration(new JitGrantEntityTypeConfiguration());

        // IdentityInsights
        modelBuilder.ApplyConfiguration(new UserRiskProfileEntityTypeConfiguration());
        modelBuilder.ApplyConfiguration(new InsightEntityTypeConfiguration());

        // Extensibility
        modelBuilder.ApplyConfiguration(new WebhookSubscriptionEntityTypeConfiguration());

        // MultiRegion
        modelBuilder.ApplyConfiguration(new RegionEntityTypeConfiguration());
    }
}

