using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Configurations;

public class RegionBackupSetEntityTypeConfiguration : IEntityTypeConfiguration<RegionBackupSetEntity>
{
    public void Configure(EntityTypeBuilder<RegionBackupSetEntity> builder)
    {
        builder.ToTable("RegionBackupSets", "MultiRegion");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RegionId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.BackupType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.StorageLocation).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.ErrorMessage).HasMaxLength(2000);

        builder.HasIndex(x => x.RegionId)
            .HasDatabaseName("IX_RegionBackupSets_RegionId");

        builder.HasIndex(x => new { x.RegionId, x.CreatedAt })
            .HasDatabaseName("IX_RegionBackupSets_RegionId_CreatedAt");
    }
}
