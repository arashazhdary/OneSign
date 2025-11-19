using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AccountCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccountCenter.Infrastructure.EfCore.Configurations;

public class UserActivityEntityTypeConfiguration : IEntityTypeConfiguration<UserActivityEntity>
{
    public void Configure(EntityTypeBuilder<UserActivityEntity> builder)
    {
        builder.ToTable("UserActivities");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Description).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.IpAddress).HasMaxLength(50);
        builder.Property(x => x.UserAgent).HasMaxLength(500);
        builder.Property(x => x.DeviceId).HasMaxLength(200);
        builder.Property(x => x.MetadataJson).HasColumnType("nvarchar(max)");

        builder.HasIndex(x => new { x.UserId, x.OccurredAt }).HasDatabaseName("IX_UserActivities_UserId_OccurredAt");
        builder.HasIndex(x => new { x.TenantId, x.OccurredAt }).HasDatabaseName("IX_UserActivities_TenantId_OccurredAt");
    }
}
