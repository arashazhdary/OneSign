using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Applications.Infrastructure.EfCore.Configurations;

public class ClientRedirectUriEntityTypeConfiguration : IEntityTypeConfiguration<ClientRedirectUriEntity>
{
    public void Configure(EntityTypeBuilder<ClientRedirectUriEntity> builder)
    {
        builder.ToTable("ClientRedirectUris");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ApplicationClientId).IsRequired();
        builder.Property(x => x.Uri).IsRequired().HasMaxLength(500);
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}

