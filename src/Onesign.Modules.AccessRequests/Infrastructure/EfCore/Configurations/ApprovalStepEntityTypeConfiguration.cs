using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Configurations;

public class ApprovalStepEntityTypeConfiguration : IEntityTypeConfiguration<ApprovalStepEntity>
{
    public void Configure(EntityTypeBuilder<ApprovalStepEntity> builder)
    {
        builder.ToTable("ApprovalSteps", "AccessRequests");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ApproverName).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Comment).HasMaxLength(2000);

        builder.HasIndex(x => new { x.AccessRequestId, x.StepNumber })
            .HasDatabaseName("IX_ApprovalSteps_AccessRequestId_StepNumber");

        builder.HasIndex(x => new { x.ApproverId, x.Action })
            .HasDatabaseName("IX_ApprovalSteps_ApproverId_Action");
    }
}
