using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Configurations;

public class SamlProviderEntityTypeConfiguration : IEntityTypeConfiguration<SamlProviderEntity>
{
    public void Configure(EntityTypeBuilder<SamlProviderEntity> builder)
    {
        builder.ToTable("SamlProviders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.EntityId).IsRequired().HasMaxLength(500);
        builder.Property(x => x.IdpSsoUrl).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.IdpCertificate).IsRequired();
        builder.Property(x => x.SpEntityId).IsRequired().HasMaxLength(500);
        builder.Property(x => x.SpAssertionConsumerServiceUrl).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.BindingType).IsRequired();
        builder.Property(x => x.SignAuthRequest).IsRequired();
        builder.Property(x => x.WantAssertionsSigned).IsRequired();
        builder.Property(x => x.Enabled).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => new { x.TenantId, x.EntityId }).IsUnique();

        // Foreign key to Tenant
        builder.HasOne<Onesign.Modules.Tenants.Infrastructure.EfCore.Entities.TenantEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
