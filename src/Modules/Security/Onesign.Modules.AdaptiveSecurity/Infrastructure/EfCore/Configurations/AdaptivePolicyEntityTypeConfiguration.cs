using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Configurations;

public class AdaptivePolicyEntityTypeConfiguration : IEntityTypeConfiguration<AdaptivePolicyEntity>
{
    public void Configure(EntityTypeBuilder<AdaptivePolicyEntity> builder)
    {
        builder.ToTable("AdaptivePolicies", "AdaptiveSecurity");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.Conditions).IsRequired();
        builder.Property(x => x.ActionsJson).IsRequired();

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_AdaptivePolicies_TenantId");

        builder.HasIndex(x => new { x.TenantId, x.IsEnabled })
            .HasDatabaseName("IX_AdaptivePolicies_TenantId_IsEnabled");

        builder.HasIndex(x => new { x.TenantId, x.Priority })
            .HasDatabaseName("IX_AdaptivePolicies_TenantId_Priority");
    }
}
