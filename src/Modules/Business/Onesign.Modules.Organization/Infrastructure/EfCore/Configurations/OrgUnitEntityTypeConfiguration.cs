using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Configurations;

public class OrgUnitEntityTypeConfiguration : IEntityTypeConfiguration<OrgUnitEntity>
{
    public void Configure(EntityTypeBuilder<OrgUnitEntity> builder)
    {
        builder.ToTable("OrgUnits");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Code).HasMaxLength(100);
        builder.Property(x => x.Path).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Level).IsRequired();
        builder.Property(x => x.SortOrder).IsRequired();
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        // Indexes
        builder.HasIndex(x => x.TenantId);
        builder.HasIndex(x => x.ParentId);
        
        // Unique index on (TenantId, Path) - for path-based tree queries
        builder.HasIndex(x => new { x.TenantId, x.Path }).IsUnique();

        // Unique constraint on (TenantId, Code) if Code is not null
        builder.HasIndex(x => new { x.TenantId, x.Code })
            .IsUnique()
            .HasFilter("[Code] IS NOT NULL");

        // Foreign key to Tenant
        builder.HasOne<Onesign.Modules.Tenants.Infrastructure.EfCore.Entities.TenantEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        // Foreign key to parent (self-referencing)
        builder.HasOne<OrgUnitEntity>()
            .WithMany()
            .HasForeignKey(x => x.ParentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

