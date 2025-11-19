using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Deployment.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Deployment.Infrastructure.EfCore.Configurations;

public class EnvironmentFeatureConfigEntityTypeConfiguration : IEntityTypeConfiguration<EnvironmentFeatureConfigEntity>
{
    public void Configure(EntityTypeBuilder<EnvironmentFeatureConfigEntity> builder)
    {
        builder.ToTable("EnvironmentFeatureConfigs", "Deployment");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.EnvironmentId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.EnabledModulesJson).HasMaxLength(4000);

        builder.HasIndex(x => x.EnvironmentId)
            .HasDatabaseName("IX_EnvironmentFeatureConfigs_EnvironmentId")
            .IsUnique();
    }
}
