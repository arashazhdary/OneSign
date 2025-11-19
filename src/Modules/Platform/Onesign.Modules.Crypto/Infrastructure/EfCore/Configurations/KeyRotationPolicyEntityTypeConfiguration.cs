using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Crypto.Infrastructure.EfCore.Configurations;

public class KeyRotationPolicyEntityTypeConfiguration : IEntityTypeConfiguration<KeyRotationPolicyEntity>
{
    public void Configure(EntityTypeBuilder<KeyRotationPolicyEntity> builder)
    {
        builder.ToTable("KeyRotationPolicies", "Crypto");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ScopeId).IsRequired().HasMaxLength(200);

        builder.HasIndex(x => new { x.ScopeType, x.ScopeId, x.Purpose })
            .IsUnique()
            .HasDatabaseName("IX_KeyRotationPolicies_Scope_Purpose");

        builder.HasIndex(x => x.Enabled)
            .HasDatabaseName("IX_KeyRotationPolicies_Enabled");
    }
}
