using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Configurations;

public class OidcFederationProviderEntityTypeConfiguration : IEntityTypeConfiguration<OidcFederationProviderEntity>
{
    public void Configure(EntityTypeBuilder<OidcFederationProviderEntity> builder)
    {
        builder.ToTable("OidcFederationProviders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ProviderType).IsRequired();
        builder.Property(x => x.Authority).IsRequired().HasMaxLength(500);
        builder.Property(x => x.ClientId).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ClientSecret).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Scopes).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Enabled).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => new { x.TenantId, x.Name });

        // Foreign key to Tenant
        builder.HasOne<Onesign.Modules.Tenants.Infrastructure.EfCore.Entities.TenantEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
