using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Configurations;

public class WebhookDeliveryLogEntityTypeConfiguration : IEntityTypeConfiguration<WebhookDeliveryLogEntity>
{
    public void Configure(EntityTypeBuilder<WebhookDeliveryLogEntity> builder)
    {
        builder.ToTable("WebhookDeliveryLogs", "Extensibility");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EventType).IsRequired().HasMaxLength(200);
        builder.Property(x => x.PayloadJson).IsRequired();
        builder.Property(x => x.ErrorMessage).HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.Status })
            .HasDatabaseName("IX_WebhookDeliveryLogs_TenantId_Status");

        builder.HasIndex(x => new { x.SubscriptionId, x.CreatedAt })
            .HasDatabaseName("IX_WebhookDeliveryLogs_SubscriptionId_CreatedAt");

        builder.HasIndex(x => new { x.TenantId, x.Status, x.AttemptCount })
            .HasDatabaseName("IX_WebhookDeliveryLogs_TenantId_Status_AttemptCount");
    }
}
