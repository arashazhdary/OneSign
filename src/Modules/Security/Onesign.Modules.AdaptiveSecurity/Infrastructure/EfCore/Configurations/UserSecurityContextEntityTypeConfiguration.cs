using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AdaptiveSecurity.Infrastructure.EfCore.Configurations;

public class UserSecurityContextEntityTypeConfiguration : IEntityTypeConfiguration<UserSecurityContextEntity>
{
    public void Configure(EntityTypeBuilder<UserSecurityContextEntity> builder)
    {
        builder.ToTable("UserSecurityContexts", "AdaptiveSecurity");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RiskFactorsJson).IsRequired();
        builder.Property(x => x.LastLoginLocation).HasMaxLength(500);
        builder.Property(x => x.LastLoginDevice).HasMaxLength(500);
        builder.Property(x => x.TrustedDevicesJson).IsRequired();
        builder.Property(x => x.TrustedLocationsJson).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.UserId })
            .HasDatabaseName("IX_UserSecurityContexts_TenantId_UserId")
            .IsUnique();

        builder.HasIndex(x => new { x.TenantId, x.CurrentRiskScore })
            .HasDatabaseName("IX_UserSecurityContexts_TenantId_CurrentRiskScore");
    }
}
