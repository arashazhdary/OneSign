using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.MultiRegion.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.MultiRegion.Infrastructure.EfCore.Configurations;

public class RegionEntityTypeConfiguration : IEntityTypeConfiguration<RegionEntity>
{
    public void Configure(EntityTypeBuilder<RegionEntity> builder)
    {
        builder.ToTable("Regions", "MultiRegion");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).IsRequired().HasMaxLength(50);
        builder.Property(x => x.DisplayName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.EndpointBaseUrl).IsRequired().HasMaxLength(500);
        builder.Property(x => x.DbClusterRef).HasMaxLength(200);
        builder.Property(x => x.StorageClusterRef).HasMaxLength(200);

        builder.HasIndex(x => x.IsActive)
            .HasDatabaseName("IX_Regions_IsActive");
    }
}
