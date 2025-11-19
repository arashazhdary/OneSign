using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Developer.Infrastructure.EfCore.Configurations;

public class SdkConfigurationEntityTypeConfiguration : IEntityTypeConfiguration<SdkConfigurationEntity>
{
    public void Configure(EntityTypeBuilder<SdkConfigurationEntity> builder)
    {
        builder.ToTable("SdkConfigurations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Version)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.ConfigurationJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(x => new { x.TenantId, x.SdkType })
            .HasDatabaseName("IX_SdkConfigurations_TenantId_SdkType");
    }
}
