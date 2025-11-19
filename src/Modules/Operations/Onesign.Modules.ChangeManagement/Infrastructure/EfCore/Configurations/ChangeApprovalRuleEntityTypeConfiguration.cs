using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Configurations;

public class ChangeApprovalRuleEntityTypeConfiguration : IEntityTypeConfiguration<ChangeApprovalRuleEntity>
{
    public void Configure(EntityTypeBuilder<ChangeApprovalRuleEntity> builder)
    {
        builder.ToTable("ChangeMgmt_ApprovalRules", "ChangeMgmt");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScopeType).IsRequired().HasMaxLength(50);

        builder.HasIndex(x => new { x.ScopeType, x.ScopeId, x.Category })
            .IsUnique()
            .HasDatabaseName("IX_ChangeMgmt_ApprovalRules_ScopeCategory");
    }
}
