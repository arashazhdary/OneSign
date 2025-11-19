using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.ChangeManagement.Infrastructure.EfCore.Configurations;

public class ChangeExecutionLogEntityTypeConfiguration : IEntityTypeConfiguration<ChangeExecutionLogEntity>
{
    public void Configure(EntityTypeBuilder<ChangeExecutionLogEntity> builder)
    {
        builder.ToTable("ChangeMgmt_ExecutionLogs", "ChangeMgmt");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Message).HasMaxLength(4000);

        builder.HasIndex(x => x.ChangeSetId)
            .HasDatabaseName("IX_ChangeMgmt_ExecutionLogs_ChangeSetId");

        builder.HasIndex(x => new { x.ChangeSetId, x.Step })
            .HasDatabaseName("IX_ChangeMgmt_ExecutionLogs_ChangeSetStep");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("IX_ChangeMgmt_ExecutionLogs_CreatedAt");
    }
}
