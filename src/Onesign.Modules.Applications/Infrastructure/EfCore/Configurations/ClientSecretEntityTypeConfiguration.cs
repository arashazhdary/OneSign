using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Applications.Infrastructure.EfCore.Configurations;

public class ClientSecretEntityTypeConfiguration : IEntityTypeConfiguration<ClientSecretEntity>
{
    public void Configure(EntityTypeBuilder<ClientSecretEntity> builder)
    {
        builder.ToTable("ClientSecrets");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ApplicationClientId).IsRequired();
        builder.Property(x => x.SecretHash).IsRequired().HasMaxLength(500);
        builder.Property(x => x.CreatedAt).IsRequired();
    }
}

