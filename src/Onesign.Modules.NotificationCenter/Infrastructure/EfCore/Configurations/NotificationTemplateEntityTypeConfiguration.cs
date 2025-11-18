using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Configurations;

public class NotificationTemplateEntityTypeConfiguration : IEntityTypeConfiguration<NotificationTemplateEntity>
{
    public void Configure(EntityTypeBuilder<NotificationTemplateEntity> builder)
    {
        builder.ToTable("NotificationTemplates", "NotificationCenter");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TemplateKey).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Locale).IsRequired().HasMaxLength(10);
        builder.Property(x => x.SubjectTemplate).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.BodyTemplate).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.TemplateKey, x.Channel, x.Locale })
            .HasDatabaseName("IX_NotificationTemplates_TenantId_TemplateKey_Channel_Locale")
            .IsUnique();

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_NotificationTemplates_TenantId");
    }
}
