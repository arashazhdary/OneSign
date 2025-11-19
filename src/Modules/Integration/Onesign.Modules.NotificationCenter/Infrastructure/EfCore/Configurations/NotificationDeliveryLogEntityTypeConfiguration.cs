using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Configurations;

public class NotificationDeliveryLogEntityTypeConfiguration : IEntityTypeConfiguration<NotificationDeliveryLogEntity>
{
    public void Configure(EntityTypeBuilder<NotificationDeliveryLogEntity> builder)
    {
        builder.ToTable("NotificationDeliveryLogs", "NotificationCenter");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ProviderMessageId).HasMaxLength(500);
        builder.Property(x => x.ErrorDetails).HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.OutboxItemId })
            .HasDatabaseName("IX_NotificationDeliveryLogs_TenantId_OutboxItemId");

        builder.HasIndex(x => x.Timestamp)
            .HasDatabaseName("IX_NotificationDeliveryLogs_Timestamp");

        builder.HasOne(x => x.OutboxItem)
            .WithMany()
            .HasForeignKey(x => x.OutboxItemId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
