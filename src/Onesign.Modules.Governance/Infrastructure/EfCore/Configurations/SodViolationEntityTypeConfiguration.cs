using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Governance.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Governance.Infrastructure.EfCore.Configurations;

public class SodViolationEntityTypeConfiguration : IEntityTypeConfiguration<SodViolationEntity>
{
    public void Configure(EntityTypeBuilder<SodViolationEntity> builder)
    {
        builder.ToTable("SodViolations");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.ResolutionNotes).HasMaxLength(1000);
        builder.HasIndex(x => new { x.TenantId, x.Resolved }).HasDatabaseName("IX_SodViolations_TenantId_Resolved");
        builder.HasIndex(x => new { x.UserId, x.Resolved }).HasDatabaseName("IX_SodViolations_UserId_Resolved");
    }
}
