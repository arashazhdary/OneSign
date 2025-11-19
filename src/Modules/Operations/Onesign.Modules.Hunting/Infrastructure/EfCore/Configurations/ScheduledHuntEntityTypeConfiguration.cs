using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Hunting.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Hunting.Infrastructure.EfCore.Configurations;

public class ScheduledHuntEntityTypeConfiguration : IEntityTypeConfiguration<ScheduledHuntEntity>
{
    public void Configure(EntityTypeBuilder<ScheduledHuntEntity> builder)
    {
        builder.ToTable("Hunting_ScheduledHunts", "Hunting");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScopeType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Description).HasMaxLength(4000);

        builder.HasIndex(x => new { x.ScopeType, x.ScopeId })
            .HasDatabaseName("IX_Hunting_ScheduledHunts_Scope");

        builder.HasIndex(x => x.SavedQueryId)
            .HasDatabaseName("IX_Hunting_ScheduledHunts_SavedQueryId");

        builder.HasIndex(x => x.ScheduleSpec)
            .HasDatabaseName("IX_Hunting_ScheduledHunts_ScheduleSpec");

        builder.HasIndex(x => x.IsEnabled)
            .HasDatabaseName("IX_Hunting_ScheduledHunts_IsEnabled");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("IX_Hunting_ScheduledHunts_CreatedAt");

        builder.HasMany(x => x.HuntRuns)
            .WithOne(x => x.ScheduledHunt)
            .HasForeignKey(x => x.ScheduledHuntId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
