using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Configurations;

public class PolicyDefinitionEntityTypeConfiguration : IEntityTypeConfiguration<PolicyDefinitionEntity>
{
    public void Configure(EntityTypeBuilder<PolicyDefinitionEntity> builder)
    {
        builder.ToTable("PolicyDefinitions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(1000);

        builder.Property(x => x.Effect)
            .IsRequired();

        builder.Property(x => x.Priority)
            .IsRequired();

        builder.Property(x => x.Enabled)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Indexes for efficient querying
        builder.HasIndex(x => new { x.TenantId, x.Enabled, x.Priority })
            .HasDatabaseName("IX_PolicyDefinitions_TenantId_Enabled_Priority");

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_PolicyDefinitions_TenantId");

        // Relationships
        builder.HasMany(x => x.ConditionGroups)
            .WithOne(x => x.PolicyDefinition)
            .HasForeignKey(x => x.PolicyDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
