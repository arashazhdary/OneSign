using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Configurations;

public class AttributeMappingEntityTypeConfiguration : IEntityTypeConfiguration<AttributeMappingEntity>
{
    public void Configure(EntityTypeBuilder<AttributeMappingEntity> builder)
    {
        builder.ToTable("AttributeMappings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.InternalAttributeName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.MappingType).IsRequired();
        builder.Property(x => x.ExternalAttributeName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.StaticValue).HasMaxLength(500);
        builder.Property(x => x.TemplateExpression).HasMaxLength(1000);
        builder.Property(x => x.IsRequired).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.SamlProviderId);
        builder.HasIndex(x => x.OidcFederationProviderId);

        // Foreign key to Tenant
        builder.HasOne<Onesign.Modules.Tenants.Infrastructure.EfCore.Entities.TenantEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign key to SamlProvider (optional)
        // Using Restrict to avoid multiple cascade paths (Tenant -> SamlProvider -> AttributeMapping)
        builder.HasOne<SamlProviderEntity>()
            .WithMany()
            .HasForeignKey(x => x.SamlProviderId)
            .OnDelete(DeleteBehavior.Restrict);

        // Foreign key to OidcFederationProvider (optional)
        // Using Restrict to avoid multiple cascade paths (Tenant -> OidcFederationProvider -> AttributeMapping)
        builder.HasOne<OidcFederationProviderEntity>()
            .WithMany()
            .HasForeignKey(x => x.OidcFederationProviderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
