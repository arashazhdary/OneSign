using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Automation.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Automation.Infrastructure.EfCore.Configurations;

public class AutomationActionEntityTypeConfiguration : IEntityTypeConfiguration<AutomationActionEntity>
{
    public void Configure(EntityTypeBuilder<AutomationActionEntity> builder)
    {
        builder.ToTable("Automation_Actions", "Automation");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ConfigJson).IsRequired();

        builder.HasIndex(x => x.WorkflowId)
            .HasDatabaseName("IX_Automation_Actions_WorkflowId");
    }
}
