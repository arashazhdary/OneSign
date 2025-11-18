using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Crypto.Infrastructure.EfCore.Configurations;

public class KeySetEntityTypeConfiguration : IEntityTypeConfiguration<KeySetEntity>
{
    public void Configure(EntityTypeBuilder<KeySetEntity> builder)
    {
        builder.ToTable("KeySets", "Crypto");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScopeId).IsRequired().HasMaxLength(200);

        builder.HasIndex(x => new { x.ScopeType, x.ScopeId, x.Purpose })
            .HasDatabaseName("IX_KeySets_Scope_Purpose");

        builder.HasIndex(x => new { x.ScopeType, x.ScopeId, x.IsDefaultForScope })
            .HasDatabaseName("IX_KeySets_Scope_Default");
    }
}
