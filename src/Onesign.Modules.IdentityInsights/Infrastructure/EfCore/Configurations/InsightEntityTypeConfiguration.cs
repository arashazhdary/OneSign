using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Configurations;

public class InsightEntityTypeConfiguration : IEntityTypeConfiguration<InsightEntity>
{
    public void Configure(EntityTypeBuilder<InsightEntity> builder)
    {
        builder.ToTable("Insights", "IdentityInsights");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScopeType).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(500);
        builder.Property(x => x.MessageKey).IsRequired().HasMaxLength(200);
        builder.Property(x => x.DataJson).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.Type, x.Status })
            .HasDatabaseName("IX_Insights_TenantId_Type_Status");

        builder.HasIndex(x => new { x.TenantId, x.Severity, x.CreatedAt })
            .HasDatabaseName("IX_Insights_TenantId_Severity_CreatedAt");
    }
}
