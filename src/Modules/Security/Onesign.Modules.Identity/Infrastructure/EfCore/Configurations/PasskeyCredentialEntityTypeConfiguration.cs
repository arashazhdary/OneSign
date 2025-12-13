using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Configurations;

public class PasskeyCredentialEntityTypeConfiguration : IEntityTypeConfiguration<PasskeyCredentialEntity>
{
    public void Configure(EntityTypeBuilder<PasskeyCredentialEntity> builder)
    {
        builder.ToTable("PasskeyCredentials");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantUserId).IsRequired();
        builder.Property(x => x.CredentialId).IsRequired();
        builder.HasIndex(x => x.CredentialId).IsUnique();
        builder.Property(x => x.PublicKey).IsRequired();
        builder.Property(x => x.SignCounter).IsRequired();
        builder.Property(x => x.CredType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.AaGuid).IsRequired();
        builder.Property(x => x.UserHandle).HasMaxLength(500);
        builder.Property(x => x.DeviceName).HasMaxLength(200);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.LastUsedAt);
        builder.Property(x => x.Transports).HasMaxLength(500);

        // Create index on TenantUserId for efficient lookup
        builder.HasIndex(x => x.TenantUserId);
    }
}
