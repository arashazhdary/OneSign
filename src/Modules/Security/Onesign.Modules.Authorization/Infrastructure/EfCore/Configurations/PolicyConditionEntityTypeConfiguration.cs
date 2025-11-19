using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Configurations;

public class PolicyConditionEntityTypeConfiguration : IEntityTypeConfiguration<PolicyConditionEntity>
{
    public void Configure(EntityTypeBuilder<PolicyConditionEntity> builder)
    {
        builder.ToTable("PolicyConditions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.SourceType)
            .IsRequired();

        builder.Property(x => x.SourceKey)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Operator)
            .IsRequired();

        builder.Property(x => x.Value)
            .IsRequired()
            .HasMaxLength(500);

        builder.HasIndex(x => x.ConditionGroupId)
            .HasDatabaseName("IX_PolicyConditions_ConditionGroupId");
    }
}
