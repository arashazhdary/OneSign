using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Crypto.Infrastructure.EfCore.Configurations;

public class KeyVersionEntityTypeConfiguration : IEntityTypeConfiguration<KeyVersionEntity>
{
    public void Configure(EntityTypeBuilder<KeyVersionEntity> builder)
    {
        builder.ToTable("KeyVersions", "Crypto");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Kid).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Algorithm).IsRequired().HasMaxLength(50);
        builder.Property(x => x.KeyMaterial).IsRequired();

        builder.HasIndex(x => x.KeySetId)
            .HasDatabaseName("IX_KeyVersions_KeySetId");

        builder.HasIndex(x => x.Kid)
            .IsUnique()
            .HasDatabaseName("IX_KeyVersions_Kid");

        builder.HasIndex(x => new { x.KeySetId, x.State })
            .HasDatabaseName("IX_KeyVersions_KeySetId_State");
    }
}
