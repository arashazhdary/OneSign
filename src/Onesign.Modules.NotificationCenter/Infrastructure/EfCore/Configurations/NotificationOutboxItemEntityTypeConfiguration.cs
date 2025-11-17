using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Configurations;

public class NotificationOutboxItemEntityTypeConfiguration : IEntityTypeConfiguration<NotificationOutboxItemEntity>
{
    public void Configure(EntityTypeBuilder<NotificationOutboxItemEntity> builder)
    {
        builder.ToTable("NotificationOutboxItems", "NotificationCenter");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RecipientAddress).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Subject).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.Body).IsRequired();
        builder.Property(x => x.EventType).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ErrorMessage).HasMaxLength(2000);

        builder.HasIndex(x => new { x.Status, x.NextRetryAt })
            .HasDatabaseName("IX_NotificationOutboxItems_Status_NextRetryAt");

        builder.HasIndex(x => new { x.TenantId, x.RecipientUserId })
            .HasDatabaseName("IX_NotificationOutboxItems_TenantId_RecipientUserId");

        builder.HasIndex(x => x.CreatedAt)
            .HasDatabaseName("IX_NotificationOutboxItems_CreatedAt");
    }
}
