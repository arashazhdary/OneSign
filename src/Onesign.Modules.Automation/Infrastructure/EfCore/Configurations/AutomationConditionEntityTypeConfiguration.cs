using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Automation.Infrastructure.EfCore.Configurations;

public class AutomationConditionEntityTypeConfiguration : IEntityTypeConfiguration<AutomationConditionEntity>
{
    public void Configure(EntityTypeBuilder<AutomationConditionEntity> builder)
    {
        builder.ToTable("Automation_Conditions", "Automation");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Expression).IsRequired();

        builder.HasIndex(x => x.WorkflowId)
            .HasDatabaseName("IX_Automation_Conditions_WorkflowId");
    }
}
