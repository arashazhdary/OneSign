using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Insights.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Insights.Infrastructure.EfCore.Configurations;

public class UserSecurityPostureEntityTypeConfiguration : IEntityTypeConfiguration<UserSecurityPostureEntity>
{
    public void Configure(EntityTypeBuilder<UserSecurityPostureEntity> builder)
    {
        builder.ToTable("Insights_UserSecurityPostures", "Insights");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.UserId).IsRequired();
        builder.Property(x => x.MfaEnabled).IsRequired();
        builder.Property(x => x.EnabledAppsCount).IsRequired();
        builder.Property(x => x.UsedAppsLast30DaysCount).IsRequired();
        builder.Property(x => x.HighRiskEventsLast30Days).IsRequired();
        builder.Property(x => x.IsAnonymized).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.UserId })
            .IsUnique()
            .HasDatabaseName("IX_Insights_UserSecurityPostures_TenantId_UserId");

        builder.HasIndex(x => new { x.TenantId, x.HighRiskEventsLast30Days })
            .HasDatabaseName("IX_Insights_UserSecurityPostures_TenantId_HighRiskEvents");

        builder.HasIndex(x => new { x.TenantId, x.MfaEnabled })
            .HasDatabaseName("IX_Insights_UserSecurityPostures_TenantId_MfaEnabled");

        builder.HasIndex(x => new { x.TenantId, x.LastSignInAt })
            .HasDatabaseName("IX_Insights_UserSecurityPostures_TenantId_LastSignInAt");
    }
}
