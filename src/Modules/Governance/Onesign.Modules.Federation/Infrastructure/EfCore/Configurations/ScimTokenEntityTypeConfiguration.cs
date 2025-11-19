using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Federation.Infrastructure.EfCore.Configurations;

public class ScimTokenEntityTypeConfiguration : IEntityTypeConfiguration<ScimTokenEntity>
{
    public void Configure(EntityTypeBuilder<ScimTokenEntity> builder)
    {
        builder.ToTable("ScimTokens");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.TokenHash).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.TokenHash).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.Status });

        // Foreign key to Tenant
        builder.HasOne<Onesign.Modules.Tenants.Infrastructure.EfCore.Entities.TenantEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
