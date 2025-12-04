using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Configurations;

public class MagicLinkTokenEntityTypeConfiguration : IEntityTypeConfiguration<MagicLinkTokenEntity>
{
    public void Configure(EntityTypeBuilder<MagicLinkTokenEntity> builder)
    {
        builder.ToTable("MagicLinkTokens");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantUserId).IsRequired();
        builder.Property(x => x.Token).IsRequired().HasMaxLength(500);
        builder.HasIndex(x => x.Token).IsUnique();
        builder.Property(x => x.ExpiresAt).IsRequired();
        builder.Property(x => x.IsUsed).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}
