using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Developer.Infrastructure.EfCore.Configurations;

public class ServiceAccountEntityTypeConfiguration : IEntityTypeConfiguration<ServiceAccountEntity>
{
    public void Configure(EntityTypeBuilder<ServiceAccountEntity> builder)
    {
        builder.ToTable("ServiceAccounts");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(1000);

        builder.Property(x => x.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.RolesJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(x => new { x.TenantId, x.Email })
            .IsUnique()
            .HasDatabaseName("IX_ServiceAccounts_TenantId_Email");

        builder.HasIndex(x => new { x.TenantId, x.Status })
            .HasDatabaseName("IX_ServiceAccounts_TenantId_Status");
    }
}
