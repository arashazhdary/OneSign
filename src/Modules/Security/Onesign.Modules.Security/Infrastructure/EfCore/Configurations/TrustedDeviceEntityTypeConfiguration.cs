using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Configurations;

public class TrustedDeviceEntityTypeConfiguration : IEntityTypeConfiguration<TrustedDeviceEntity>
{
    public void Configure(EntityTypeBuilder<TrustedDeviceEntity> builder)
    {
        builder.ToTable("TrustedDevices");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).IsRequired();
        builder.Property(x => x.TenantUserId).IsRequired();
        builder.Property(x => x.DeviceId).IsRequired().HasMaxLength(500);
        builder.Property(x => x.DeviceName).IsRequired().HasMaxLength(500);
        builder.Property(x => x.FirstSeenAt).IsRequired();
        builder.Property(x => x.LastSeenAt).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.TenantUserId, x.DeviceId }).IsUnique();
        builder.HasIndex(x => x.ExpiresAt);
    }
}
