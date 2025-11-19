using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Configurations;

public class PlanFeatureEntityTypeConfiguration : IEntityTypeConfiguration<PlanFeatureEntity>
{
    public void Configure(EntityTypeBuilder<PlanFeatureEntity> builder)
    {
        builder.ToTable("PlanFeatures");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PlanId)
            .IsRequired();

        builder.Property(x => x.Key)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Value)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.LimitType);

        // Index on PlanId for efficient queries
        builder.HasIndex(x => x.PlanId);

        // Composite index for (PlanId, Key) - ensures unique keys per plan
        builder.HasIndex(x => new { x.PlanId, x.Key })
            .IsUnique();
    }
}
