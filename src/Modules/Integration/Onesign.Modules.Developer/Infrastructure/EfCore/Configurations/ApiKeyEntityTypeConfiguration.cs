using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Developer.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Developer.Infrastructure.EfCore.Configurations;

public class ApiKeyEntityTypeConfiguration : IEntityTypeConfiguration<ApiKeyEntity>
{
    public void Configure(EntityTypeBuilder<ApiKeyEntity> builder)
    {
        builder.ToTable("ApiKeys");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .HasMaxLength(1000);

        builder.Property(x => x.KeyHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.KeyPrefix)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .IsRequired();

        builder.Property(x => x.ScopesJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Indexes
        builder.HasIndex(x => x.KeyHash)
            .IsUnique()
            .HasDatabaseName("IX_ApiKeys_KeyHash");

        builder.HasIndex(x => new { x.TenantId, x.Status })
            .HasDatabaseName("IX_ApiKeys_TenantId_Status");

        builder.HasIndex(x => x.ServiceAccountId)
            .HasDatabaseName("IX_ApiKeys_ServiceAccountId");

        // Relationships
        builder.HasOne(x => x.ServiceAccount)
            .WithMany(x => x.ApiKeys)
            .HasForeignKey(x => x.ServiceAccountId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
