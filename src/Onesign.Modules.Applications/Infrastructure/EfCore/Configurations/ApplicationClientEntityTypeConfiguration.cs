using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Applications.Infrastructure.EfCore.Configurations;

public class ApplicationClientEntityTypeConfiguration : IEntityTypeConfiguration<ApplicationClientEntity>
{
    public void Configure(EntityTypeBuilder<ApplicationClientEntity> builder)
    {
        builder.ToTable("ApplicationClients");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TenantId).IsRequired();
        builder.Property(x => x.ClientId).IsRequired().HasMaxLength(100);
        builder.HasIndex(x => x.ClientId).IsUnique();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ApplicationType).IsRequired();
        builder.Property(x => x.GrantType).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}

