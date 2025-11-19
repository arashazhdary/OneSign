using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Configurations;

public class ChangeSetEntityTypeConfiguration : IEntityTypeConfiguration<ChangeSetEntity>
{
    public void Configure(EntityTypeBuilder<ChangeSetEntity> builder)
    {
        builder.ToTable("ChangeMgmt_ChangeSets", "ChangeMgmt");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScopeType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Description).HasMaxLength(4000);
        builder.Property(x => x.RollbackReason).HasMaxLength(2000);

        builder.HasIndex(x => new { x.ScopeType, x.ScopeId })
            .HasDatabaseName("IX_ChangeMgmt_ChangeSets_Scope");

        builder.HasIndex(x => x.Status)
            .HasDatabaseName("IX_ChangeMgmt_ChangeSets_Status");

        builder.HasIndex(x => x.RequestedByUserId)
            .HasDatabaseName("IX_ChangeMgmt_ChangeSets_RequestedBy");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("IX_ChangeMgmt_ChangeSets_CreatedAt");

        builder.HasMany(x => x.Items)
            .WithOne(x => x.ChangeSet)
            .HasForeignKey(x => x.ChangeSetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Approvals)
            .WithOne(x => x.ChangeSet)
            .HasForeignKey(x => x.ChangeSetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.ExecutionLogs)
            .WithOne(x => x.ChangeSet)
            .HasForeignKey(x => x.ChangeSetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
