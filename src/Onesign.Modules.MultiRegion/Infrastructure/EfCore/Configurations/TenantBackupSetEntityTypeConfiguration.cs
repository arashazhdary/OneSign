using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Configurations;

public class TenantBackupSetEntityTypeConfiguration : IEntityTypeConfiguration<TenantBackupSetEntity>
{
    public void Configure(EntityTypeBuilder<TenantBackupSetEntity> builder)
    {
        builder.ToTable("TenantBackupSets", "MultiRegion");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RegionId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.BackupType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.StorageLocation).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.ErrorMessage).HasMaxLength(2000);

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_TenantBackupSets_TenantId");

        builder.HasIndex(x => new { x.TenantId, x.CreatedAt })
            .HasDatabaseName("IX_TenantBackupSets_TenantId_CreatedAt");
    }
}
