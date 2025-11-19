using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Privacy.Infrastructure.EfCore.Configurations;

public class DataSubjectRequestEntityTypeConfiguration : IEntityTypeConfiguration<DataSubjectRequestEntity>
{
    public void Configure(EntityTypeBuilder<DataSubjectRequestEntity> builder)
    {
        builder.ToTable("DataSubjectRequests", "Privacy");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ResultLocation).HasMaxLength(1000);
        builder.Property(x => x.Reason).HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.SubjectId })
            .HasDatabaseName("IX_DataSubjectRequests_TenantId_SubjectId");

        builder.HasIndex(x => new { x.TenantId, x.Status })
            .HasDatabaseName("IX_DataSubjectRequests_TenantId_Status");

        builder.HasIndex(x => new { x.TenantId, x.RequestedAt })
            .HasDatabaseName("IX_DataSubjectRequests_TenantId_RequestedAt");
    }
}
