using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Configurations;

public class UserLoginSessionEntityTypeConfiguration : IEntityTypeConfiguration<UserLoginSessionEntity>
{
    public void Configure(EntityTypeBuilder<UserLoginSessionEntity> builder)
    {
        builder.ToTable("UserLoginSessions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantUserId).IsRequired();
        builder.Property(x => x.SessionToken).IsRequired().HasMaxLength(500);
        builder.HasIndex(x => x.SessionToken).IsUnique();
        builder.Property(x => x.ExpiresAt).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.IpAddress).HasMaxLength(50);
        builder.Property(x => x.UserAgent).HasMaxLength(500);
        builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);
        builder.Property(x => x.RevokedAt);
    }
}

