using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Configurations;

public class WebhookSubscriptionEntityTypeConfiguration : IEntityTypeConfiguration<WebhookSubscriptionEntity>
{
    public void Configure(EntityTypeBuilder<WebhookSubscriptionEntity> builder)
    {
        builder.ToTable("WebhookSubscriptions", "Extensibility");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(500);
        builder.Property(x => x.EndpointUrl).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.Secret).IsRequired().HasMaxLength(500);
        builder.Property(x => x.EventTypesJson).IsRequired();
        builder.Property(x => x.LastDeliveryStatus).HasMaxLength(100);

        builder.HasIndex(x => new { x.TenantId, x.IsEnabled })
            .HasDatabaseName("IX_WebhookSubscriptions_TenantId_IsEnabled");
    }
}
