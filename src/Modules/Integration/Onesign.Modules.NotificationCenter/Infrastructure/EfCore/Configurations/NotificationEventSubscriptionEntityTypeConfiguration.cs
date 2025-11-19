using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Configurations;

public class NotificationEventSubscriptionEntityTypeConfiguration : IEntityTypeConfiguration<NotificationEventSubscriptionEntity>
{
    public void Configure(EntityTypeBuilder<NotificationEventSubscriptionEntity> builder)
    {
        builder.ToTable("NotificationEventSubscriptions", "NotificationCenter");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EventType).IsRequired().HasMaxLength(200);
        builder.Property(x => x.RecipientSelector).IsRequired().HasMaxLength(500);

        builder.HasIndex(x => new { x.TenantId, x.EventType, x.IsEnabled })
            .HasDatabaseName("IX_NotificationEventSubscriptions_TenantId_EventType_IsEnabled");

        builder.HasOne(x => x.Template)
            .WithMany()
            .HasForeignKey(x => x.TemplateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
