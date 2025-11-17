using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Configurations;

public class AuthorizationCodeEntityTypeConfiguration : IEntityTypeConfiguration<AuthorizationCodeEntity>
{
    public void Configure(EntityTypeBuilder<AuthorizationCodeEntity> builder)
    {
        builder.ToTable("AuthorizationCodes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.TenantUserId)
            .IsRequired();

        builder.Property(x => x.ApplicationClientId)
            .IsRequired();

        builder.Property(x => x.RedirectUri)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(x => x.CodeChallenge)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.ExpiresAt)
            .IsRequired();

        builder.Property(x => x.IsUsed)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(x => x.Code)
            .IsUnique();

        builder.HasIndex(x => x.ExpiresAt);
        builder.HasIndex(x => new { x.TenantUserId, x.ApplicationClientId });
    }
}

