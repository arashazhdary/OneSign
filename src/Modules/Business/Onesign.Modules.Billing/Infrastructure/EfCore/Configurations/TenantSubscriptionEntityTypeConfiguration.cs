using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Api.Data;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Configurations;

public class TenantSubscriptionEntityTypeConfiguration : IEntityTypeConfiguration<TenantSubscriptionEntity>
{
    public void Configure(EntityTypeBuilder<TenantSubscriptionEntity> builder)
    {
        builder.ToTable("TenantSubscriptions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TenantId)
            .IsRequired();

        builder.Property(x => x.PlanId)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.StartedAt)
            .IsRequired();

        builder.Property(x => x.TrialEndsAt);

        builder.Property(x => x.CurrentPeriodEndsAt);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Unique index on TenantId - one active subscription per tenant
        builder.HasIndex(x => x.TenantId)
            .IsUnique();

        // Index on PlanId for querying subscriptions by plan
        builder.HasIndex(x => x.PlanId);

        // Index on Status for filtering by subscription status
        builder.HasIndex(x => x.Status);

        // Foreign key to Plan
        builder.HasOne(x => x.Plan)
            .WithMany()
            .HasForeignKey(x => x.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        // Foreign key to Tenant (from Admin module)
        builder.HasOne<TenantEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
