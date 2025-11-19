using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.NotificationCenter.Infrastructure.EfCore.Configurations;

public class NotificationChannelConfigEntityTypeConfiguration : IEntityTypeConfiguration<NotificationChannelConfigEntity>
{
    public void Configure(EntityTypeBuilder<NotificationChannelConfigEntity> builder)
    {
        builder.ToTable("NotificationChannelConfigs", "NotificationCenter");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ConfigurationJson).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.Channel })
            .HasDatabaseName("IX_NotificationChannelConfigs_TenantId_Channel")
            .IsUnique();
    }
}
