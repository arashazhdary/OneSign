using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Configurations;

public class ChangeItemEntityTypeConfiguration : IEntityTypeConfiguration<ChangeItemEntity>
{
    public void Configure(EntityTypeBuilder<ChangeItemEntity> builder)
    {
        builder.ToTable("ChangeMgmt_ChangeItems", "ChangeMgmt");

        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.ChangeSetId)
            .HasDatabaseName("IX_ChangeMgmt_ChangeItems_ChangeSetId");

        builder.HasIndex(x => new { x.TargetType, x.TargetId })
            .HasDatabaseName("IX_ChangeMgmt_ChangeItems_Target");
    }
}
