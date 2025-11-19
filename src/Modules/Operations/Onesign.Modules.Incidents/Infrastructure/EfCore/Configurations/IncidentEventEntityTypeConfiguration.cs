using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Configurations;

public class IncidentEventEntityTypeConfiguration : IEntityTypeConfiguration<IncidentEventEntity>
{
    public void Configure(EntityTypeBuilder<IncidentEventEntity> builder)
    {
        builder.ToTable("Incidents_Events", "Incidents");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EventType).IsRequired().HasMaxLength(200);
        builder.Property(x => x.EventData).IsRequired();
        builder.Property(x => x.SourceModule).IsRequired().HasMaxLength(200);

        builder.HasIndex(x => x.IncidentId)
            .HasDatabaseName("IX_IncidentEvents_IncidentId");

        builder.HasIndex(x => new { x.IncidentId, x.EventType })
            .HasDatabaseName("IX_IncidentEvents_IncidentId_EventType");

        builder.HasIndex(x => new { x.IncidentId, x.Timestamp })
            .HasDatabaseName("IX_IncidentEvents_IncidentId_Timestamp");

        builder.HasIndex(x => new { x.IncidentId, x.SourceModule })
            .HasDatabaseName("IX_IncidentEvents_IncidentId_SourceModule");
    }
}
