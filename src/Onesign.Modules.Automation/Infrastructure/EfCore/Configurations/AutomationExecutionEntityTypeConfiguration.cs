using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Automation.Infrastructure.EfCore.Configurations;

public class AutomationExecutionEntityTypeConfiguration : IEntityTypeConfiguration<AutomationExecutionEntity>
{
    public void Configure(EntityTypeBuilder<AutomationExecutionEntity> builder)
    {
        builder.ToTable("Automation_Executions", "Automation");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EventType).IsRequired().HasMaxLength(200);
        builder.Property(x => x.EventId).HasMaxLength(500);
        builder.Property(x => x.ErrorMessage).HasMaxLength(4000);
        builder.Property(x => x.PayloadSnapshot).IsRequired();

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_Automation_Executions_TenantId");

        builder.HasIndex(x => x.WorkflowId)
            .HasDatabaseName("IX_Automation_Executions_WorkflowId");

        builder.HasIndex(x => new { x.WorkflowId, x.EventId })
            .HasDatabaseName("IX_Automation_Executions_WorkflowId_EventId");

        builder.HasIndex(x => new { x.TenantId, x.Status })
            .HasDatabaseName("IX_Automation_Executions_TenantId_Status");

        builder.HasIndex(x => new { x.TenantId, x.StartedAt })
            .HasDatabaseName("IX_Automation_Executions_TenantId_StartedAt");

        builder.HasOne(x => x.Workflow)
            .WithMany()
            .HasForeignKey(x => x.WorkflowId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
