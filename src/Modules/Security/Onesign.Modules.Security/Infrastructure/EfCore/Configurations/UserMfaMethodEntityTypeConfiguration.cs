using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Configurations;

public class UserMfaMethodEntityTypeConfiguration : IEntityTypeConfiguration<UserMfaMethodEntity>
{
    public void Configure(EntityTypeBuilder<UserMfaMethodEntity> builder)
    {
        builder.ToTable("UserMfaMethods");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).IsRequired();
        builder.Property(x => x.TenantUserId).IsRequired();
        builder.Property(x => x.MethodType).IsRequired();
        builder.Property(x => x.IsPrimary).IsRequired();
        builder.Property(x => x.IsVerified).IsRequired();
        builder.Property(x => x.SecretEncrypted).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.TenantUserId, x.MethodType, x.IsPrimary });
        builder.HasIndex(x => x.TenantUserId);
    }
}
