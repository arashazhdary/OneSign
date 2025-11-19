using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AccountCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccountCenter.Infrastructure.EfCore.Configurations;

public class UserProfileEntityTypeConfiguration : IEntityTypeConfiguration<UserProfileEntity>
{
    public void Configure(EntityTypeBuilder<UserProfileEntity> builder)
    {
        builder.ToTable("UserProfiles");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.DisplayName).HasMaxLength(200);
        builder.Property(x => x.PhoneNumber).HasMaxLength(50);
        builder.Property(x => x.ProfilePictureUrl).HasMaxLength(1000);
        builder.Property(x => x.TimeZone).HasMaxLength(100);
        builder.Property(x => x.PreferredLanguage).HasMaxLength(10);
        builder.Property(x => x.CustomAttributesJson).HasColumnType("nvarchar(max)");

        builder.HasIndex(x => x.UserId).IsUnique().HasDatabaseName("IX_UserProfiles_UserId");
        builder.HasIndex(x => x.TenantId).HasDatabaseName("IX_UserProfiles_TenantId");
    }
}
