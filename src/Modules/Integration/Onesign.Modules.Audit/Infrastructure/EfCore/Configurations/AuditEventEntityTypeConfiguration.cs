using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Audit.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Audit.Infrastructure.EfCore.Configurations;

public class AuditEventEntityTypeConfiguration : IEntityTypeConfiguration<AuditEventEntity>
{
    public void Configure(EntityTypeBuilder<AuditEventEntity> builder)
    {
        builder.ToTable("AuditEvents");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.EventType).IsRequired();
        builder.Property(x => x.Description).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.Metadata).HasMaxLength(4000);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.HasIndex(x => new { x.TenantId, x.CreatedAt });
        builder.HasIndex(x => x.ActorId);
    }
}

