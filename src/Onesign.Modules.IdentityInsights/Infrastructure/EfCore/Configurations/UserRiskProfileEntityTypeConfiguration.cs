using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Configurations;

public class UserRiskProfileEntityTypeConfiguration : IEntityTypeConfiguration<UserRiskProfileEntity>
{
    public void Configure(EntityTypeBuilder<UserRiskProfileEntity> builder)
    {
        builder.ToTable("UserRiskProfiles", "IdentityInsights");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserDisplayName).IsRequired().HasMaxLength(500);
        builder.Property(x => x.RiskFactorsJson).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.UserId })
            .HasDatabaseName("IX_UserRiskProfiles_TenantId_UserId")
            .IsUnique();

        builder.HasIndex(x => new { x.TenantId, x.RiskScore })
            .HasDatabaseName("IX_UserRiskProfiles_TenantId_RiskScore");
    }
}
