using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Configurations;

public class UpgradeRequestEntityTypeConfiguration : IEntityTypeConfiguration<UpgradeRequestEntity>
{
    public void Configure(EntityTypeBuilder<UpgradeRequestEntity> builder)
    {
        builder.ToTable("UpgradeRequests");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TenantId)
            .IsRequired();

        builder.Property(x => x.TargetPlanId)
            .IsRequired();

        builder.Property(x => x.Comments)
            .HasMaxLength(2000);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.RequestedBy)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.RequestedAt)
            .IsRequired();

        builder.Property(x => x.ReviewedBy)
            .HasMaxLength(256);

        builder.Property(x => x.ReviewComments)
            .HasMaxLength(2000);

        // Index on TenantId for faster queries
        builder.HasIndex(x => x.TenantId);

        // Index on Status for filtering
        builder.HasIndex(x => x.Status);

        // Index on RequestedAt for sorting
        builder.HasIndex(x => x.RequestedAt);
    }
}
