using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Configurations;

public class HRIdentityRecordEntityTypeConfiguration : IEntityTypeConfiguration<HRIdentityRecordEntity>
{
    public void Configure(EntityTypeBuilder<HRIdentityRecordEntity> builder)
    {
        builder.ToTable("HRIdentityRecords", "IdentityLifecycle");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ExternalEmployeeId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.FirstName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.LastName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Email).IsRequired().HasMaxLength(500);
        builder.Property(x => x.OrgUnitCode).IsRequired().HasMaxLength(100);
        builder.Property(x => x.JobRole).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ManagerEmployeeId).HasMaxLength(100);

        builder.HasIndex(x => new { x.TenantId, x.ExternalEmployeeId })
            .HasDatabaseName("IX_HRIdentityRecords_TenantId_ExternalEmployeeId")
            .IsUnique();

        builder.HasIndex(x => new { x.TenantId, x.Status })
            .HasDatabaseName("IX_HRIdentityRecords_TenantId_Status");
    }
}
