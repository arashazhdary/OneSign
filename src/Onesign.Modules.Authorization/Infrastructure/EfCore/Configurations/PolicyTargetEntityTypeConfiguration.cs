using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Configurations;

public class PolicyTargetEntityTypeConfiguration : IEntityTypeConfiguration<PolicyTargetEntity>
{
    public void Configure(EntityTypeBuilder<PolicyTargetEntity> builder)
    {
        builder.ToTable("PolicyTargets");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TargetType)
            .IsRequired();

        builder.Property(x => x.TargetKey)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.TargetName)
            .HasMaxLength(200);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Composite unique index for tenant + target type + key
        builder.HasIndex(x => new { x.TenantId, x.TargetType, x.TargetKey })
            .IsUnique()
            .HasDatabaseName("IX_PolicyTargets_TenantId_TargetType_TargetKey");

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_PolicyTargets_TenantId");
    }
}
