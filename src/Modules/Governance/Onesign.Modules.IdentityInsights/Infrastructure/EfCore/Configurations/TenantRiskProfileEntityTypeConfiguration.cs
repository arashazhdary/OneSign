using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Configurations;

public class TenantRiskProfileEntityTypeConfiguration : IEntityTypeConfiguration<TenantRiskProfileEntity>
{
    public void Configure(EntityTypeBuilder<TenantRiskProfileEntity> builder)
    {
        builder.ToTable("TenantRiskProfiles", "IdentityInsights");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.RiskScore).IsRequired();
        builder.Property(x => x.MfaEnrollmentRate).HasPrecision(5, 2);
        builder.Property(x => x.FailedLoginRate).HasPrecision(5, 2);

        builder.HasIndex(x => x.TenantId)
            .IsUnique()
            .HasDatabaseName("IX_TenantRiskProfiles_TenantId");

        builder.HasIndex(x => x.RiskScore)
            .HasDatabaseName("IX_TenantRiskProfiles_RiskScore");
    }
}
