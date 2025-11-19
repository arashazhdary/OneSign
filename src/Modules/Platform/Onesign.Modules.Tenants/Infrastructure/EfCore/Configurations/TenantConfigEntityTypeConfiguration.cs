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
        builder.Property(x => x.LogoUrl).HasMaxLength(500);
        builder.Property(x => x.PrimaryColor).HasMaxLength(50);
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}

