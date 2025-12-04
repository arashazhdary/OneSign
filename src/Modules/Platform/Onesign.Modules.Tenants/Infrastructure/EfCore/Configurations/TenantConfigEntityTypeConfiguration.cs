using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Tenants.Infrastructure.EfCore.Configurations;

public class TenantConfigEntityTypeConfiguration : IEntityTypeConfiguration<TenantConfigEntity>
{
    public void Configure(EntityTypeBuilder<TenantConfigEntity> builder)
    {
        builder.ToTable("TenantConfigs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.HasIndex(x => x.TenantId).IsUnique();

        // Logo and basic branding
        builder.Property(x => x.LogoUrl).HasMaxLength(500);
        builder.Property(x => x.LogoDarkUrl).HasMaxLength(500);
        builder.Property(x => x.FaviconUrl).HasMaxLength(500);
        builder.Property(x => x.PrimaryColor).HasMaxLength(50);
        builder.Property(x => x.SecondaryColor).HasMaxLength(50);
        builder.Property(x => x.AccentColor).HasMaxLength(50);

        // Tenant display info
        builder.Property(x => x.TenantName).HasMaxLength(200);
        builder.Property(x => x.WelcomeTitle).HasMaxLength(200);
        builder.Property(x => x.WelcomeSubtitle).HasMaxLength(500);
        builder.Property(x => x.FooterText).HasMaxLength(1000);

        // JSON configuration fields (no max length needed for nvarchar(max))
        // builder.Property(x => x.LoginPageConfigJson);
        // builder.Property(x => x.FeaturesJson);

        builder.Property(x => x.CreatedAt).IsRequired();
    }
}

