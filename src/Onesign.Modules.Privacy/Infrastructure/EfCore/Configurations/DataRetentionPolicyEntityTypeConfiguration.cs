using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Privacy.Infrastructure.EfCore.Configurations;

public class DataRetentionPolicyEntityTypeConfiguration : IEntityTypeConfiguration<DataRetentionPolicyEntity>
{
    public void Configure(EntityTypeBuilder<DataRetentionPolicyEntity> builder)
    {
        builder.ToTable("DataRetentionPolicies", "Privacy");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RetentionPeriodDays).IsRequired();
        builder.Property(x => x.HardDeleteAfter).IsRequired();
        builder.Property(x => x.Enabled).IsRequired();

        builder.HasIndex(x => new { x.TenantId, x.DataCategory })
            .HasDatabaseName("IX_DataRetentionPolicies_TenantId_DataCategory")
            .IsUnique();

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_DataRetentionPolicies_TenantId");
    }
}
