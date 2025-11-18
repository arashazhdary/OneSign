using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Configurations;

public class JitGrantEntityTypeConfiguration : IEntityTypeConfiguration<JitGrantEntity>
{
    public void Configure(EntityTypeBuilder<JitGrantEntity> builder)
    {
        builder.ToTable("JitGrants", "PrivilegedAccess");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RoleName).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Justification).IsRequired().HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.UserId, x.Status })
            .HasDatabaseName("IX_JitGrants_TenantId_UserId_Status");

        builder.HasIndex(x => new { x.TenantId, x.ExpiresAt })
            .HasDatabaseName("IX_JitGrants_TenantId_ExpiresAt");
    }
}
