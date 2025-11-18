using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Configurations;

public class SecurityPolicyEntityTypeConfiguration : IEntityTypeConfiguration<SecurityPolicyEntity>
{
    public void Configure(EntityTypeBuilder<SecurityPolicyEntity> builder)
    {
        builder.ToTable("SecurityPolicies");

        builder.HasKey(x => x.TenantId);

        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.MfaRequirementLevel).IsRequired();
        builder.Property(x => x.AllowMfaRememberDevice).IsRequired();
        builder.Property(x => x.RememberDeviceDays).IsRequired();
        builder.Property(x => x.RequireMfaForSensitiveApps).IsRequired();
        builder.Property(x => x.MaxFailedLoginAttempts).IsRequired();
        builder.Property(x => x.EnableGeoAnomalyDetection).IsRequired();
        builder.Property(x => x.BlockLevel).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.TenantId).IsUnique();
    }
}
