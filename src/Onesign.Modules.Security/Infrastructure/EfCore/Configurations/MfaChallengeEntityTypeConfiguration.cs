using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Configurations;

public class MfaChallengeEntityTypeConfiguration : IEntityTypeConfiguration<MfaChallengeEntity>
{
    public void Configure(EntityTypeBuilder<MfaChallengeEntity> builder)
    {
        builder.ToTable("MfaChallenges");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).IsRequired();
        builder.Property(x => x.TenantUserId).IsRequired();
        builder.Property(x => x.MethodType).IsRequired();
        builder.Property(x => x.CodeHash).IsRequired().HasMaxLength(500);
        builder.Property(x => x.ExpiresAt).IsRequired();
        builder.Property(x => x.Consumed).IsRequired();
        builder.Property(x => x.DeviceId).IsRequired().HasMaxLength(500);
        builder.Property(x => x.IpAddress).IsRequired().HasMaxLength(50);
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.ExpiresAt);
        builder.HasIndex(x => x.TenantUserId);
    }
}
