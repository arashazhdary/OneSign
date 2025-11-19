using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Platform.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Platform.Infrastructure.EfCore.Configurations;

public class PlatformVersionEntityTypeConfiguration : IEntityTypeConfiguration<PlatformVersionEntity>
{
    public void Configure(EntityTypeBuilder<PlatformVersionEntity> builder)
    {
        builder.ToTable("Platform_Versions", "Platform");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Version).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.ReleaseNotes).HasMaxLength(10000);

        builder.HasIndex(x => x.Version)
            .IsUnique()
            .HasDatabaseName("IX_Platform_Versions_Version");

        builder.HasIndex(x => x.IsCurrentVersion)
            .HasDatabaseName("IX_Platform_Versions_IsCurrentVersion");

        builder.HasIndex(x => x.ReleaseDate)
            .HasDatabaseName("IX_Platform_Versions_ReleaseDate");
    }
}
