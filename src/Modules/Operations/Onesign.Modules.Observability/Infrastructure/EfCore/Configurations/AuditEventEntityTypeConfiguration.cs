using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Data.Contexts;
using Onesign.Modules.Observability.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Observability.Infrastructure.EfCore.Configurations;

public class AuditEventEntityTypeConfiguration : IEntityTypeConfiguration<AuditEventEntity>
{
    public void Configure(EntityTypeBuilder<AuditEventEntity> builder)
    {
        builder.ToTable("AuditEvents");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CorrelationId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Category)
            .IsRequired();

        builder.Property(x => x.Severity)
            .IsRequired();

        builder.Property(x => x.ActorId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.ActorDisplayName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.ActorType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Action)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.TargetType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.TargetId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.IpAddress)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.UserAgent)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.Country)
            .HasMaxLength(100);

        builder.Property(x => x.OccurredAt)
            .IsRequired();

        builder.Property(x => x.DataJson)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        // Critical indexes for efficient searching
        builder.HasIndex(x => new { x.TenantId, x.OccurredAt })
            .HasDatabaseName("IX_AuditEvents_TenantId_OccurredAt");

        builder.HasIndex(x => new { x.TenantId, x.Category, x.OccurredAt })
            .HasDatabaseName("IX_AuditEvents_TenantId_Category_OccurredAt");

        builder.HasIndex(x => new { x.ActorId, x.OccurredAt })
            .HasDatabaseName("IX_AuditEvents_ActorId_OccurredAt");

        builder.HasIndex(x => x.CorrelationId)
            .HasDatabaseName("IX_AuditEvents_CorrelationId");

        builder.HasIndex(x => x.OccurredAt)
            .HasDatabaseName("IX_AuditEvents_OccurredAt");

        // Foreign key to Tenant (optional - can be null for global events)
        builder.HasOne<TenantEntity>()
            .WithMany()
            .HasForeignKey(x => x.TenantId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);
    }
}
