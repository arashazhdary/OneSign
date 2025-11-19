using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Configurations;

public class IncidentEntityTypeConfiguration : IEntityTypeConfiguration<IncidentEntity>
{
    public void Configure(EntityTypeBuilder<IncidentEntity> builder)
    {
        builder.ToTable("Incidents_Incidents", "Incidents");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Description).IsRequired();
        builder.Property(x => x.ResolutionSummary).HasMaxLength(2000);

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_Incidents_TenantId");

        builder.HasIndex(x => new { x.TenantId, x.Status })
            .HasDatabaseName("IX_Incidents_TenantId_Status");

        builder.HasIndex(x => new { x.TenantId, x.Severity })
            .HasDatabaseName("IX_Incidents_TenantId_Severity");

        builder.HasIndex(x => new { x.TenantId, x.Category })
            .HasDatabaseName("IX_Incidents_TenantId_Category");

        builder.HasIndex(x => new { x.TenantId, x.DetectedAt })
            .HasDatabaseName("IX_Incidents_TenantId_DetectedAt");

        builder.HasIndex(x => new { x.TenantId, x.PrimaryUserId })
            .HasDatabaseName("IX_Incidents_TenantId_PrimaryUserId");

        builder.HasIndex(x => new { x.TenantId, x.PrimaryAppId })
            .HasDatabaseName("IX_Incidents_TenantId_PrimaryAppId");
    }
}
