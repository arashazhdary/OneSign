using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Developer.Infrastructure.EfCore.Configurations;

public class WebhookEndpointEntityTypeConfiguration : IEntityTypeConfiguration<WebhookEndpointEntity>
{
    public void Configure(EntityTypeBuilder<WebhookEndpointEntity> builder)
    {
        builder.ToTable("WebhookEndpoints");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Url)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.Description)
            .HasMaxLength(1000);

        builder.Property(x => x.SecretKey)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.EventTypesJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.Enabled)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(x => new { x.TenantId, x.Enabled })
            .HasDatabaseName("IX_WebhookEndpoints_TenantId_Enabled");
    }
}
