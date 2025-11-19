using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Platform.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Platform.Infrastructure.EfCore.Configurations;

public class MigrationHistoryEntityTypeConfiguration : IEntityTypeConfiguration<MigrationHistoryEntity>
{
    public void Configure(EntityTypeBuilder<MigrationHistoryEntity> builder)
    {
        builder.ToTable("Platform_MigrationHistory", "Platform");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.MigrationName).IsRequired().HasMaxLength(500);
        builder.Property(x => x.ErrorMessage).HasMaxLength(5000);

        builder.HasIndex(x => x.MigrationName)
            .IsUnique()
            .HasDatabaseName("IX_Platform_MigrationHistory_MigrationName");

        builder.HasIndex(x => x.Status)
            .HasDatabaseName("IX_Platform_MigrationHistory_Status");

        builder.HasIndex(x => x.AppliedAt)
            .HasDatabaseName("IX_Platform_MigrationHistory_AppliedAt");

        builder.HasIndex(x => x.AppliedByUserId)
            .HasDatabaseName("IX_Platform_MigrationHistory_AppliedByUserId");
    }
}
