using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Organization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Organization.Infrastructure.EfCore.Configurations;

public class ApplicationOrgUnitEntityTypeConfiguration : IEntityTypeConfiguration<ApplicationOrgUnitEntity>
{
    public void Configure(EntityTypeBuilder<ApplicationOrgUnitEntity> builder)
    {
        builder.ToTable("ApplicationOrgUnits");
        builder.HasKey(x => new { x.ApplicationClientId, x.OrgUnitId });
        builder.Property(x => x.ApplicationClientId).IsRequired();
        builder.Property(x => x.OrgUnitId).IsRequired();

        // Foreign key to ApplicationClient
        builder.HasOne<Onesign.Modules.Applications.Infrastructure.EfCore.Entities.ApplicationClientEntity>()
            .WithMany()
            .HasForeignKey(x => x.ApplicationClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign key to OrgUnit
        builder.HasOne<OrgUnitEntity>()
            .WithMany()
            .HasForeignKey(x => x.OrgUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.ApplicationClientId);
        builder.HasIndex(x => x.OrgUnitId);
    }
}

