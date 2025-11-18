using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Configurations;

public class PrivilegedSessionEntityTypeConfiguration : IEntityTypeConfiguration<PrivilegedSessionEntity>
{
    public void Configure(EntityTypeBuilder<PrivilegedSessionEntity> builder)
    {
        builder.ToTable("PrivilegedSessions", "PrivilegedAccess");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserDisplayName).IsRequired().HasMaxLength(500);
        builder.Property(x => x.PrivilegedRolesJson).IsRequired();
        builder.Property(x => x.IpAddress).HasMaxLength(100);

        builder.HasIndex(x => new { x.TenantId, x.UserId, x.IsActive })
            .HasDatabaseName("IX_PrivilegedSessions_TenantId_UserId_IsActive");

        builder.HasIndex(x => new { x.TenantId, x.IsActive })
            .HasDatabaseName("IX_PrivilegedSessions_TenantId_IsActive");
    }
}
