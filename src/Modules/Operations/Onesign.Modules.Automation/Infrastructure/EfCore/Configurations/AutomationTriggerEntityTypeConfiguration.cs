using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Automation.Infrastructure.EfCore.Configurations;

public class AutomationTriggerEntityTypeConfiguration : IEntityTypeConfiguration<AutomationTriggerEntity>
{
    public void Configure(EntityTypeBuilder<AutomationTriggerEntity> builder)
    {
        builder.ToTable("Automation_Triggers", "Automation");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EventType).IsRequired().HasMaxLength(200);
        builder.Property(x => x.SourceModule).IsRequired().HasMaxLength(100);

        builder.HasIndex(x => x.WorkflowId)
            .HasDatabaseName("IX_Automation_Triggers_WorkflowId");

        builder.HasIndex(x => x.EventType)
            .HasDatabaseName("IX_Automation_Triggers_EventType");
    }
}
