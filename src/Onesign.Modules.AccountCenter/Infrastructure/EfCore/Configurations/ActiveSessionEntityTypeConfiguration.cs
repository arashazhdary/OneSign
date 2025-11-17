using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AccountCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccountCenter.Infrastructure.EfCore.Configurations;

public class ActiveSessionEntityTypeConfiguration : IEntityTypeConfiguration<ActiveSessionEntity>
{
    public void Configure(EntityTypeBuilder<ActiveSessionEntity> builder)
    {
        builder.ToTable("ActiveSessions");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SessionToken).IsRequired().HasMaxLength(500);
        builder.Property(x => x.DeviceId).HasMaxLength(200);
        builder.Property(x => x.IpAddress).HasMaxLength(50);
        builder.Property(x => x.UserAgent).HasMaxLength(500);

        builder.HasIndex(x => x.SessionToken).HasDatabaseName("IX_ActiveSessions_SessionToken");
        builder.HasIndex(x => new { x.UserId, x.IsActive }).HasDatabaseName("IX_ActiveSessions_UserId_IsActive");
        builder.HasIndex(x => x.ExpiresAt).HasDatabaseName("IX_ActiveSessions_ExpiresAt");
    }
}
