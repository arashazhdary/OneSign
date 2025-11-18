using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Configurations;

public class LifecyclePolicyEntityTypeConfiguration : IEntityTypeConfiguration<LifecyclePolicyEntity>
{
    public void Configure(EntityTypeBuilder<LifecyclePolicyEntity> builder)
    {
        builder.ToTable("LifecyclePolicies", "IdentityLifecycle");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.OrgUnitCode).HasMaxLength(100);
        builder.Property(x => x.JobRole).HasMaxLength(200);
        builder.Property(x => x.Location).HasMaxLength(200);
        builder.Property(x => x.EmploymentType).HasMaxLength(100);
        builder.Property(x => x.AccessPackageIdsJson).IsRequired();

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_LifecyclePolicies_TenantId");

        builder.HasIndex(x => new { x.TenantId, x.OrgUnitCode, x.JobRole })
            .HasDatabaseName("IX_LifecyclePolicies_TenantId_OrgUnitCode_JobRole");
    }
}
