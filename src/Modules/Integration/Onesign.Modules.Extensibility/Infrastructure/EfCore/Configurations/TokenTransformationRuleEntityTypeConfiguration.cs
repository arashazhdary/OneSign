using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Configurations;

public class TokenTransformationRuleEntityTypeConfiguration : IEntityTypeConfiguration<TokenTransformationRuleEntity>
{
    public void Configure(EntityTypeBuilder<TokenTransformationRuleEntity> builder)
    {
        builder.ToTable("TokenTransformationRules", "Extensibility");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(500);
        builder.Property(x => x.RuleDefinitionJson).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.TargetAppId, x.IsEnabled })
            .HasDatabaseName("IX_TokenTransformationRules_TenantId_TargetAppId_IsEnabled");

        builder.HasIndex(x => new { x.TenantId, x.Order })
            .HasDatabaseName("IX_TokenTransformationRules_TenantId_Order");
    }
}
