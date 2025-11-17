using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Audit.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Audit.Infrastructure.EfCore.Entities;
using Onesign.Modules.Identity.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;
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
    }
}

