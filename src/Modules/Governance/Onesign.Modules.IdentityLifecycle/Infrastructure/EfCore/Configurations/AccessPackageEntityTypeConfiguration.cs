using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Configurations;

public class AccessPackageEntityTypeConfiguration : IEntityTypeConfiguration<AccessPackageEntity>
{
    public void Configure(EntityTypeBuilder<AccessPackageEntity> builder)
    {
        builder.ToTable("AccessPackages", "IdentityLifecycle");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.RoleIdsJson).IsRequired();
        builder.Property(x => x.ApplicationIdsJson).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.IsEnabled })
            .HasDatabaseName("IX_AccessPackages_TenantId_IsEnabled");
    }
}
