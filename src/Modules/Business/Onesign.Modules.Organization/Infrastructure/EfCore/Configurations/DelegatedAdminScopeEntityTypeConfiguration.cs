using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Configurations;

public class DelegatedAdminScopeEntityTypeConfiguration : IEntityTypeConfiguration<DelegatedAdminScopeEntity>
{
    public void Configure(EntityTypeBuilder<DelegatedAdminScopeEntity> builder)
    {
        builder.ToTable("DelegatedAdminScopes");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantUserId).IsRequired();
        builder.Property(x => x.OrgUnitId).IsRequired();
        builder.Property(x => x.ScopeType).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        // Unique constraint: a user can only have one delegated admin scope per OrgUnit
        builder.HasIndex(x => new { x.TenantUserId, x.OrgUnitId }).IsUnique();

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

