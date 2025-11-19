using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Configurations;

public class PolicyConditionGroupEntityTypeConfiguration : IEntityTypeConfiguration<PolicyConditionGroupEntity>
{
    public void Configure(EntityTypeBuilder<PolicyConditionGroupEntity> builder)
    {
        builder.ToTable("PolicyConditionGroups");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.LogicalOperator)
            .IsRequired();

        builder.HasIndex(x => x.PolicyDefinitionId)
            .HasDatabaseName("IX_PolicyConditionGroups_PolicyDefinitionId");

        // Relationships
        builder.HasMany(x => x.Conditions)
            .WithOne(x => x.ConditionGroup)
            .HasForeignKey(x => x.ConditionGroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
