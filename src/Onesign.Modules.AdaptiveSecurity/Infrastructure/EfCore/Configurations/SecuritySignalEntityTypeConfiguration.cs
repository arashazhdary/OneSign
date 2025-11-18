using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Configurations;

public class SecuritySignalEntityTypeConfiguration : IEntityTypeConfiguration<SecuritySignalEntity>
{
    public void Configure(EntityTypeBuilder<SecuritySignalEntity> builder)
    {
        builder.ToTable("SecuritySignals", "AdaptiveSecurity");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.DetailsJson).IsRequired();
        builder.Property(x => x.ActionTaken).HasMaxLength(500);

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_SecuritySignals_TenantId");

        builder.HasIndex(x => new { x.TenantId, x.UserId })
            .HasDatabaseName("IX_SecuritySignals_TenantId_UserId");

        builder.HasIndex(x => new { x.TenantId, x.SignalType })
            .HasDatabaseName("IX_SecuritySignals_TenantId_SignalType");

        builder.HasIndex(x => new { x.TenantId, x.DetectedAt })
            .HasDatabaseName("IX_SecuritySignals_TenantId_DetectedAt");

        builder.HasIndex(x => new { x.TenantId, x.ProcessedAt })
            .HasDatabaseName("IX_SecuritySignals_TenantId_ProcessedAt");
    }
}
