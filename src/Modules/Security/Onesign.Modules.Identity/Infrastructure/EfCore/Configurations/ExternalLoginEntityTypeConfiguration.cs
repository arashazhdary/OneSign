using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Configurations;

public class ExternalLoginEntityTypeConfiguration : IEntityTypeConfiguration<ExternalLoginEntity>
{
    public void Configure(EntityTypeBuilder<ExternalLoginEntity> builder)
    {
        builder.ToTable("ExternalLogins");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.GlobalUserId).IsRequired();
        builder.Property(x => x.Provider).IsRequired().HasMaxLength(50);
        builder.Property(x => x.ProviderUserId).IsRequired().HasMaxLength(200);
        builder.HasIndex(x => new { x.Provider, x.ProviderUserId }).IsUnique();
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}

