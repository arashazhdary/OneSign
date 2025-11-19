using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Incidents.Infrastructure.EfCore.Configurations;

public class IncidentPlaybookRunEntityTypeConfiguration : IEntityTypeConfiguration<IncidentPlaybookRunEntity>
{
    public void Configure(EntityTypeBuilder<IncidentPlaybookRunEntity> builder)
    {
        builder.ToTable("Incidents_PlaybookRuns", "Incidents");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.WorkflowName).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Result).HasMaxLength(4000);

        builder.HasIndex(x => x.IncidentId)
            .HasDatabaseName("IX_IncidentPlaybookRuns_IncidentId");

        builder.HasIndex(x => new { x.IncidentId, x.WorkflowId })
            .HasDatabaseName("IX_IncidentPlaybookRuns_IncidentId_WorkflowId");

        builder.HasIndex(x => new { x.IncidentId, x.Status })
            .HasDatabaseName("IX_IncidentPlaybookRuns_IncidentId_Status");
    }
}
