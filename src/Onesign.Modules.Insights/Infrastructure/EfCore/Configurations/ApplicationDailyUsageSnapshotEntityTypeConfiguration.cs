using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Insights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Insights.Infrastructure.EfCore.Configurations;

public class ApplicationDailyUsageSnapshotEntityTypeConfiguration : IEntityTypeConfiguration<ApplicationDailyUsageSnapshotEntity>
{
    public void Configure(EntityTypeBuilder<ApplicationDailyUsageSnapshotEntity> builder)
    {
        builder.ToTable("Insights_ApplicationDailyUsageSnapshots", "Insights");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.ApplicationId).IsRequired();
        builder.Property(x => x.Date).IsRequired();
        builder.Property(x => x.UniqueUsers).IsRequired();
        builder.Property(x => x.SignInCount).IsRequired();
        builder.Property(x => x.FailedSignInCount).IsRequired();
        builder.Property(x => x.HighRiskSignInCount).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.ApplicationId, x.Date })
            .IsUnique()
            .HasDatabaseName("IX_Insights_ApplicationDailyUsageSnapshots_TenantId_ApplicationId_Date");

        builder.HasIndex(x => new { x.TenantId, x.Date })
            .HasDatabaseName("IX_Insights_ApplicationDailyUsageSnapshots_TenantId_Date");

        builder.HasIndex(x => x.Date)
            .HasDatabaseName("IX_Insights_ApplicationDailyUsageSnapshots_Date");
    }
}
