using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Configurations;

public class WorkflowDefinitionEntityTypeConfiguration : IEntityTypeConfiguration<WorkflowDefinitionEntity>
{
    public void Configure(EntityTypeBuilder<WorkflowDefinitionEntity> builder)
    {
        builder.ToTable("WorkflowDefinitions", "AccessRequests");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(500);
        builder.Property(x => x.ApprovalChainJson).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.TargetType, x.TargetId })
            .HasDatabaseName("IX_WorkflowDefinitions_TenantId_TargetType_TargetId");
    }
}
