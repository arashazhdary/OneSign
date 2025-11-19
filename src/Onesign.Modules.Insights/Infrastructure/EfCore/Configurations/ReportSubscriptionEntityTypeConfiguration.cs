using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Insights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Insights.Infrastructure.EfCore.Configurations;

public class ReportSubscriptionEntityTypeConfiguration : IEntityTypeConfiguration<ReportSubscriptionEntity>
{
    public void Configure(EntityTypeBuilder<ReportSubscriptionEntity> builder)
    {
        builder.ToTable("Insights_ReportSubscriptions", "Insights");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScopeType).IsRequired();
        builder.Property(x => x.ReportType).IsRequired();
        builder.Property(x => x.CronOrFrequency).IsRequired().HasMaxLength(100);
        builder.Property(x => x.EmailRecipients).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.IsActive).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.CreatedByUserId).IsRequired();

        builder.HasIndex(x => new { x.ScopeType, x.ScopeId })
            .HasDatabaseName("IX_Insights_ReportSubscriptions_ScopeType_ScopeId");

        builder.HasIndex(x => x.IsActive)
            .HasDatabaseName("IX_Insights_ReportSubscriptions_IsActive");

        builder.HasIndex(x => x.ReportType)
            .HasDatabaseName("IX_Insights_ReportSubscriptions_ReportType");

        builder.HasIndex(x => x.CreatedByUserId)
            .HasDatabaseName("IX_Insights_ReportSubscriptions_CreatedByUserId");
    }
}
