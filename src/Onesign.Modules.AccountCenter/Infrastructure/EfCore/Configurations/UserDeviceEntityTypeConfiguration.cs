using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AccountCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccountCenter.Infrastructure.EfCore.Configurations;

public class UserDeviceEntityTypeConfiguration : IEntityTypeConfiguration<UserDeviceEntity>
{
    public void Configure(EntityTypeBuilder<UserDeviceEntity> builder)
    {
        builder.ToTable("UserDevices");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.DeviceId).IsRequired().HasMaxLength(200);
        builder.Property(x => x.DeviceName).HasMaxLength(200);
        builder.Property(x => x.DeviceType).HasMaxLength(50);
        builder.Property(x => x.OperatingSystem).HasMaxLength(100);
        builder.Property(x => x.Browser).HasMaxLength(100);
        builder.Property(x => x.LastIpAddress).HasMaxLength(50);

        builder.HasIndex(x => new { x.UserId, x.DeviceId }).HasDatabaseName("IX_UserDevices_UserId_DeviceId");
    }
}
