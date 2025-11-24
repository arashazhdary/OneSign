using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Identity.Infrastructure.EfCore.Configurations;

public class TenantUserEntityTypeConfiguration : IEntityTypeConfiguration<TenantUserEntity>
{
    public void Configure(EntityTypeBuilder<TenantUserEntity> builder)
    {
        builder.ToTable("TenantUsers");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.GlobalUserId).IsRequired();
        builder.Property(x => x.TenantId).IsRequired();
        builder.HasIndex(x => new { x.GlobalUserId, x.TenantId }).IsUnique();
        builder.Property(x => x.Status).IsRequired();
        builder.Property(x => x.IsAdmin).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);
    }
}

