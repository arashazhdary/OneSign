using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.PrivilegedAccess.Infrastructure.EfCore.Configurations;

public class BreakGlassAccountEntityTypeConfiguration : IEntityTypeConfiguration<BreakGlassAccountEntity>
{
    public void Configure(EntityTypeBuilder<BreakGlassAccountEntity> builder)
    {
        builder.ToTable("BreakGlassAccounts", "PrivilegedAccess");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Username).IsRequired().HasMaxLength(200);
        builder.Property(x => x.PasswordHash).IsRequired().HasMaxLength(500);
        builder.Property(x => x.AllowedTenantsJson).IsRequired();
        builder.Property(x => x.AllowedRolesJson).IsRequired();

        builder.HasIndex(x => x.Username)
            .HasDatabaseName("IX_BreakGlassAccounts_Username")
            .IsUnique();

        builder.HasIndex(x => x.IsEnabled)
            .HasDatabaseName("IX_BreakGlassAccounts_IsEnabled");
    }
}
