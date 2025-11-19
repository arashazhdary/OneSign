using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Data.Contexts;
using Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Configurations;

public class TenantUsageSnapshotEntityTypeConfiguration : IEntityTypeConfiguration<TenantUsageSnapshotEntity>
{
    public void Configure(EntityTypeBuilder<TenantUsageSnapshotEntity> builder)
    {
        builder.ToTable("TenantUsageSnapshots");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TenantId)
            .IsRequired();

        builder.Property(x => x.CapturedAt)
            .IsRequired();

        builder.Property(x => x.UserCount)
            .IsRequired();

        builder.Property(x => x.ActiveUsersLast30Days)
            .IsRequired();

        builder.Property(x => x.ApplicationCount)
            .IsRequired();

        builder.Property(x => x.IdpConnectionCount)
            .IsRequired();

        builder.Property(x => x.OrgUnitCount)
            .IsRequired();

        builder.Property(x => x.LoginsThisMonth)
            .IsRequired();

        builder.Property(x => x.ScimCallsThisMonth)
            .IsRequired();

        // Composite index on (TenantId, CapturedAt) for efficient time-series queries
        builder.HasIndex(x => new { x.TenantId, x.CapturedAt });

        // Index on TenantId for filtering
        builder.HasIndex(x => x.TenantId);

        // Foreign key to Tenant
        builder.HasOne<TenantEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
