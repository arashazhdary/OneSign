using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Api.Data;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Configurations;

public class UsageCounterEntityTypeConfiguration : IEntityTypeConfiguration<UsageCounterEntity>
{
    public void Configure(EntityTypeBuilder<UsageCounterEntity> builder)
    {
        builder.ToTable("UsageCounters");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TenantId)
            .IsRequired();

        builder.Property(x => x.MetricType)
            .IsRequired();

        builder.Property(x => x.PeriodYear)
            .IsRequired();

        builder.Property(x => x.PeriodMonth)
            .IsRequired();

        builder.Property(x => x.Value)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Unique composite index - one counter per tenant/metric/period
        builder.HasIndex(x => new { x.TenantId, x.MetricType, x.PeriodYear, x.PeriodMonth })
            .IsUnique();

        // Index on TenantId for efficient tenant-specific queries
        builder.HasIndex(x => x.TenantId);

        // Foreign key to Tenant
        builder.HasOne<TenantEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
