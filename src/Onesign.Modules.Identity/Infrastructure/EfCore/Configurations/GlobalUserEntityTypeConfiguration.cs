using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Configurations;

public class GlobalUserEntityTypeConfiguration : IEntityTypeConfiguration<GlobalUserEntity>
{
    public void Configure(EntityTypeBuilder<GlobalUserEntity> builder)
    {
        builder.ToTable("GlobalUsers");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Email).IsRequired().HasMaxLength(256);
        builder.HasIndex(x => x.Email).IsUnique();
        builder.Property(x => x.PasswordHash).HasMaxLength(500);
        builder.Property(x => x.EmailVerified).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}

