using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Automation.Infrastructure.EfCore.Configurations;

public class AutomationWorkflowEntityTypeConfiguration : IEntityTypeConfiguration<AutomationWorkflowEntity>
{
    public void Configure(EntityTypeBuilder<AutomationWorkflowEntity> builder)
    {
        builder.ToTable("Automation_Workflows", "Automation");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(2000);

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_Automation_Workflows_TenantId");

        builder.HasIndex(x => new { x.TenantId, x.IsEnabled })
            .HasDatabaseName("IX_Automation_Workflows_TenantId_IsEnabled");

        builder.HasIndex(x => new { x.ScopeType, x.IsTemplate, x.IsEnforced })
            .HasDatabaseName("IX_Automation_Workflows_ScopeType_IsTemplate_IsEnforced");

        builder.HasMany(x => x.Triggers)
            .WithOne(x => x.Workflow)
            .HasForeignKey(x => x.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Conditions)
            .WithOne(x => x.Workflow)
            .HasForeignKey(x => x.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Actions)
            .WithOne(x => x.Workflow)
            .HasForeignKey(x => x.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
