using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Hunting.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Hunting.Infrastructure.EfCore.Configurations;

public class HuntRunEntityTypeConfiguration : IEntityTypeConfiguration<HuntRunEntity>
{
    public void Configure(EntityTypeBuilder<HuntRunEntity> builder)
    {
        builder.ToTable("Hunting_HuntRuns", "Hunting");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScopeType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.ErrorMessage).HasMaxLength(4000);

        builder.HasIndex(x => new { x.ScopeType, x.ScopeId })
            .HasDatabaseName("IX_Hunting_HuntRuns_Scope");

        builder.HasIndex(x => x.ScheduledHuntId)
            .HasDatabaseName("IX_Hunting_HuntRuns_ScheduledHuntId");

        builder.HasIndex(x => x.Status)
            .HasDatabaseName("IX_Hunting_HuntRuns_Status");

        builder.HasIndex(x => x.StartedAt)
            .HasDatabaseName("IX_Hunting_HuntRuns_StartedAt");

        builder.HasIndex(x => x.FindingCreated)
            .HasDatabaseName("IX_Hunting_HuntRuns_FindingCreated");

        builder.HasMany(x => x.SampleRows)
            .WithOne(x => x.HuntRun)
            .HasForeignKey(x => x.HuntRunId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
