using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Configurations;

public class JitProvisioningLogEntityTypeConfiguration : IEntityTypeConfiguration<JitProvisioningLogEntity>
{
    public void Configure(EntityTypeBuilder<JitProvisioningLogEntity> builder)
    {
        builder.ToTable("JitProvisioningLogs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.UserId).IsRequired().HasMaxLength(450);
        builder.Property(x => x.ExternalUserId).IsRequired().HasMaxLength(450);
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.ErrorMessage).HasMaxLength(2000);
        builder.Property(x => x.CreatedAt).IsRequired();

        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => new { x.TenantId, x.UserId });
        builder.HasIndex(x => x.SamlProviderId);
        builder.HasIndex(x => x.OidcFederationProviderId);
        builder.HasIndex(x => x.CreatedAt);

        // Foreign key to Tenant
        builder.HasOne<Onesign.Modules.Tenants.Infrastructure.EfCore.Entities.TenantEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign key to SamlProvider (optional)
        builder.HasOne<SamlProviderEntity>()
            .WithMany()
            .HasForeignKey(x => x.SamlProviderId)
            .OnDelete(DeleteBehavior.SetNull);

        // Foreign key to OidcFederationProvider (optional)
        builder.HasOne<OidcFederationProviderEntity>()
            .WithMany()
            .HasForeignKey(x => x.OidcFederationProviderId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
