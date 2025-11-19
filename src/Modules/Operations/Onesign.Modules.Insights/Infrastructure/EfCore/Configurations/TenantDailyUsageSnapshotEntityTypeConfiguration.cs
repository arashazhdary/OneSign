using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Insights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Insights.Infrastructure.EfCore.Configurations;

public class TenantDailyUsageSnapshotEntityTypeConfiguration : IEntityTypeConfiguration<TenantDailyUsageSnapshotEntity>
{
    public void Configure(EntityTypeBuilder<TenantDailyUsageSnapshotEntity> builder)
    {
        builder.ToTable("Insights_TenantDailyUsageSnapshots", "Insights");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.Date).IsRequired();
        builder.Property(x => x.TotalUsers).IsRequired();
        builder.Property(x => x.ActiveUsers).IsRequired();
        builder.Property(x => x.MfaEnabledUsers).IsRequired();
        builder.Property(x => x.TotalApplications).IsRequired();
        builder.Property(x => x.ApplicationsWithSSOEnabled).IsRequired();
        builder.Property(x => x.TotalSignInCount).IsRequired();
        builder.Property(x => x.FailedSignInCount).IsRequired();
        builder.Property(x => x.HighRiskSignInCount).IsRequired();
        builder.Property(x => x.AccessRequestCount).IsRequired();
        builder.Property(x => x.AccessRequestApprovedCount).IsRequired();
        builder.Property(x => x.LifecycleEventsCount).IsRequired();
        builder.Property(x => x.EmergencyAccessCount).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.Date })
            .IsUnique()
            .HasDatabaseName("IX_Insights_TenantDailyUsageSnapshots_TenantId_Date");

        builder.HasIndex(x => x.Date)
            .HasDatabaseName("IX_Insights_TenantDailyUsageSnapshots_Date");
    }
}
