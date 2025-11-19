using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Configurations;

public class IncidentNoteEntityTypeConfiguration : IEntityTypeConfiguration<IncidentNoteEntity>
{
    public void Configure(EntityTypeBuilder<IncidentNoteEntity> builder)
    {
        builder.ToTable("Incidents_Notes", "Incidents");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Content).IsRequired();

        builder.HasIndex(x => x.IncidentId)
            .HasDatabaseName("IX_IncidentNotes_IncidentId");

        builder.HasIndex(x => new { x.IncidentId, x.CreatedByUserId })
            .HasDatabaseName("IX_IncidentNotes_IncidentId_CreatedByUserId");

        builder.HasIndex(x => new { x.IncidentId, x.CreatedAt })
            .HasDatabaseName("IX_IncidentNotes_IncidentId_CreatedAt");
    }
}
