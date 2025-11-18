using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Deployment.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Deployment.Infrastructure.EfCore.Configurations;

public class DeploymentEnvironmentEntityTypeConfiguration : IEntityTypeConfiguration<DeploymentEnvironmentEntity>
{
    public void Configure(EntityTypeBuilder<DeploymentEnvironmentEntity> builder)
    {
        builder.ToTable("Global_Environments", "Deployment");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.RegionId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.BaseUrl).IsRequired().HasMaxLength(500);
        builder.Property(x => x.AppVersion).HasMaxLength(50);
        builder.Property(x => x.DbSchemaVersion).HasMaxLength(50);
        builder.Property(x => x.LicenseKey).HasMaxLength(500);

        builder.HasIndex(x => x.RegionId)
            .HasDatabaseName("IX_Global_Environments_RegionId");

        builder.HasIndex(x => x.Type)
            .HasDatabaseName("IX_Global_Environments_Type");
    }
}
