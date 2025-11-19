using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Configurations;

public class IncidentLinkedEntityTypeConfiguration : IEntityTypeConfiguration<IncidentLinkedEntity>
{
    public void Configure(EntityTypeBuilder<IncidentLinkedEntity> builder)
    {
        builder.ToTable("Incidents_Entities", "Incidents");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EntityId).IsRequired().HasMaxLength(500);
        builder.Property(x => x.EntityName).IsRequired().HasMaxLength(500);

        builder.HasIndex(x => x.IncidentId)
            .HasDatabaseName("IX_IncidentEntities_IncidentId");

        builder.HasIndex(x => new { x.IncidentId, x.EntityType })
            .HasDatabaseName("IX_IncidentEntities_IncidentId_EntityType");

        builder.HasIndex(x => new { x.IncidentId, x.Role })
            .HasDatabaseName("IX_IncidentEntities_IncidentId_Role");

        builder.HasIndex(x => new { x.EntityType, x.EntityId })
            .HasDatabaseName("IX_IncidentEntities_EntityType_EntityId");
    }
}
