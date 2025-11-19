using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Platform.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Platform.Infrastructure.EfCore.Configurations;

public class IntegrationTestResultEntityTypeConfiguration : IEntityTypeConfiguration<IntegrationTestResultEntity>
{
    public void Configure(EntityTypeBuilder<IntegrationTestResultEntity> builder)
    {
        builder.ToTable("Platform_IntegrationTestResults", "Platform");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TestName).IsRequired().HasMaxLength(500);
        builder.Property(x => x.ErrorMessage).HasMaxLength(5000);
        builder.Property(x => x.StackTrace).HasMaxLength(10000);
        builder.Property(x => x.Category).HasMaxLength(200);

        builder.HasIndex(x => x.TestSuiteId)
            .HasDatabaseName("IX_Platform_IntegrationTestResults_TestSuiteId");

        builder.HasIndex(x => x.Status)
            .HasDatabaseName("IX_Platform_IntegrationTestResults_Status");

        builder.HasIndex(x => x.Category)
            .HasDatabaseName("IX_Platform_IntegrationTestResults_Category");

        builder.HasIndex(x => x.StartedAt)
            .HasDatabaseName("IX_Platform_IntegrationTestResults_StartedAt");

        builder.HasIndex(x => new { x.TestSuiteId, x.Status })
            .HasDatabaseName("IX_Platform_IntegrationTestResults_TestSuiteId_Status");
    }
}
