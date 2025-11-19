using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AccountCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccountCenter.Infrastructure.EfCore.Configurations;

public class UserConsentEntityTypeConfiguration : IEntityTypeConfiguration<UserConsentEntity>
{
    public void Configure(EntityTypeBuilder<UserConsentEntity> builder)
    {
        builder.ToTable("UserConsents");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Purpose).IsRequired().HasMaxLength(500);
        builder.Property(x => x.IpAddress).HasMaxLength(50);
        builder.Property(x => x.UserAgent).HasMaxLength(500);
        builder.Property(x => x.RevokeReason).HasMaxLength(500);

        builder.HasIndex(x => new { x.UserId, x.ConsentType }).HasDatabaseName("IX_UserConsents_UserId_ConsentType");
        builder.HasIndex(x => new { x.TenantId, x.Status }).HasDatabaseName("IX_UserConsents_TenantId_Status");
    }
}
