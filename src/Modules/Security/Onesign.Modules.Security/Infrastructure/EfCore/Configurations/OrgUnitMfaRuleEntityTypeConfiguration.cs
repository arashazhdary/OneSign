using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Configurations;

public class OrgUnitMfaRuleEntityTypeConfiguration : IEntityTypeConfiguration<OrgUnitMfaRuleEntity>
{
    public void Configure(EntityTypeBuilder<OrgUnitMfaRuleEntity> builder)
    {
        builder.ToTable("OrgUnitMfaRules");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).IsRequired();
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.OrgUnitId).IsRequired();
        builder.Property(x => x.MfaRequired).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.OrgUnitId }).IsUnique();
        builder.HasIndex(x => x.TenantId);
    }
}
