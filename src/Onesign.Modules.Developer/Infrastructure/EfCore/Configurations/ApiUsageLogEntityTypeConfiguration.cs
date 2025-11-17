using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Developer.Infrastructure.EfCore.Configurations;

public class ApiUsageLogEntityTypeConfiguration : IEntityTypeConfiguration<ApiUsageLogEntity>
{
    public void Configure(EntityTypeBuilder<ApiUsageLogEntity> builder)
    {
        builder.ToTable("ApiUsageLogs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Endpoint)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.HttpMethod)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(x => x.IpAddress)
            .HasMaxLength(50);

        builder.Property(x => x.UserAgent)
            .HasMaxLength(500);

        builder.Property(x => x.RequestedAt)
            .IsRequired();

        // Indexes for analytics queries
        builder.HasIndex(x => new { x.TenantId, x.RequestedAt })
            .HasDatabaseName("IX_ApiUsageLogs_TenantId_RequestedAt");

        builder.HasIndex(x => new { x.ApiKeyId, x.RequestedAt })
            .HasDatabaseName("IX_ApiUsageLogs_ApiKeyId_RequestedAt");
    }
}
