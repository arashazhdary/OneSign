using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Configurations;

public class TenantDataResidencyEntityTypeConfiguration : IEntityTypeConfiguration<TenantDataResidencyEntity>
{
    public void Configure(EntityTypeBuilder<TenantDataResidencyEntity> builder)
    {
        builder.ToTable("TenantDataResidencies", "MultiRegion");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.DataRegionId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.BackupRegionId).HasMaxLength(50);
        builder.Property(x => x.ComplianceTag).HasMaxLength(100);

        builder.HasIndex(x => x.TenantId)
            .IsUnique()
            .HasDatabaseName("IX_TenantDataResidencies_TenantId");

        builder.HasIndex(x => x.DataRegionId)
            .HasDatabaseName("IX_TenantDataResidencies_DataRegionId");
    }
}
