using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Hunting.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Hunting.Infrastructure.EfCore.Configurations;

public class SavedQueryEntityTypeConfiguration : IEntityTypeConfiguration<SavedQueryEntity>
{
    public void Configure(EntityTypeBuilder<SavedQueryEntity> builder)
    {
        builder.ToTable("Hunting_SavedQueries", "Hunting");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScopeType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Description).HasMaxLength(4000);
        builder.Property(x => x.QueryDslJson).IsRequired();

        builder.HasIndex(x => new { x.ScopeType, x.ScopeId })
            .HasDatabaseName("IX_Hunting_SavedQueries_Scope");

        builder.HasIndex(x => x.Dataset)
            .HasDatabaseName("IX_Hunting_SavedQueries_Dataset");

        builder.HasIndex(x => x.IsGlobalTemplate)
            .HasDatabaseName("IX_Hunting_SavedQueries_IsGlobalTemplate");

        builder.HasIndex(x => x.IsEnabled)
            .HasDatabaseName("IX_Hunting_SavedQueries_IsEnabled");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("IX_Hunting_SavedQueries_CreatedAt");

        builder.HasMany(x => x.ScheduledHunts)
            .WithOne(x => x.SavedQuery)
            .HasForeignKey(x => x.SavedQueryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
