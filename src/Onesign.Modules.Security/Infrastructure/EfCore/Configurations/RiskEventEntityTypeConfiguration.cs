using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Security.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Security.Infrastructure.EfCore.Configurations;

public class RiskEventEntityTypeConfiguration : IEntityTypeConfiguration<RiskEventEntity>
{
    public void Configure(EntityTypeBuilder<RiskEventEntity> builder)
    {
        builder.ToTable("RiskEvents");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).IsRequired();
        builder.Property(x => x.EventType).IsRequired();
        builder.Property(x => x.RiskLevel).IsRequired();
        builder.Property(x => x.IpAddress).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Country).IsRequired().HasMaxLength(100);
        builder.Property(x => x.DeviceId).IsRequired().HasMaxLength(500);
        builder.Property(x => x.DetailsJson).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.CreatedAt, x.RiskLevel });
        builder.HasIndex(x => x.TenantId);
    }
}
