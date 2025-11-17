using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Configurations;

public class UserOrgUnitEntityTypeConfiguration : IEntityTypeConfiguration<UserOrgUnitEntity>
{
    public void Configure(EntityTypeBuilder<UserOrgUnitEntity> builder)
    {
        builder.ToTable("UserOrgUnits");
        builder.HasKey(x => new { x.TenantUserId, x.OrgUnitId });
        builder.Property(x => x.TenantUserId).IsRequired();
        builder.Property(x => x.OrgUnitId).IsRequired();
        builder.Property(x => x.IsPrimary).IsRequired();

        // Foreign key to TenantUser
        builder.HasOne<Onesign.Modules.Identity.Infrastructure.EfCore.Entities.TenantUserEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantUserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign key to OrgUnit
        builder.HasOne<OrgUnitEntity>()
            .WithMany()
            .HasForeignKey(x => x.OrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.TenantUserId);
        builder.HasIndex(x => x.OrgUnitId);
    }
}

