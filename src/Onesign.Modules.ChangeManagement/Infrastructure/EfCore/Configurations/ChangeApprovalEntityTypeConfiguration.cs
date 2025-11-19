using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Configurations;

public class ChangeApprovalEntityTypeConfiguration : IEntityTypeConfiguration<ChangeApprovalEntity>
{
    public void Configure(EntityTypeBuilder<ChangeApprovalEntity> builder)
    {
        builder.ToTable("ChangeMgmt_Approvals", "ChangeMgmt");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Reason).HasMaxLength(2000);

        builder.HasIndex(x => x.ChangeSetId)
            .HasDatabaseName("IX_ChangeMgmt_Approvals_ChangeSetId");

        builder.HasIndex(x => new { x.ChangeSetId, x.ApproverUserId })
            .IsUnique()
            .HasDatabaseName("IX_ChangeMgmt_Approvals_ChangeSetUser");

        builder.HasIndex(x => x.ApproverUserId)
            .HasDatabaseName("IX_ChangeMgmt_Approvals_ApproverUserId");
    }
}
