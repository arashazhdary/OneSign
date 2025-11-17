using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Configurations;

public class AccessRequestEntityTypeConfiguration : IEntityTypeConfiguration<AccessRequestEntity>
{
    public void Configure(EntityTypeBuilder<AccessRequestEntity> builder)
    {
        builder.ToTable("AccessRequests", "AccessRequests");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RequesterName).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Justification).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.ReviewComment).HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.Status, x.CreatedAt })
            .HasDatabaseName("IX_AccessRequests_TenantId_Status_CreatedAt");

        builder.HasIndex(x => new { x.TenantId, x.RequesterId })
            .HasDatabaseName("IX_AccessRequests_TenantId_RequesterId");

        builder.HasMany(x => x.Items)
            .WithOne(x => x.AccessRequest)
            .HasForeignKey(x => x.AccessRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.ApprovalSteps)
            .WithOne(x => x.AccessRequest)
            .HasForeignKey(x => x.AccessRequestId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
