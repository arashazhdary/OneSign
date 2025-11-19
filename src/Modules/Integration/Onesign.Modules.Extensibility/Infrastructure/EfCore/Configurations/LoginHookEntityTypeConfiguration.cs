using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Configurations;

public class LoginHookEntityTypeConfiguration : IEntityTypeConfiguration<LoginHookEntity>
{
    public void Configure(EntityTypeBuilder<LoginHookEntity> builder)
    {
        builder.ToTable("LoginHooks", "Extensibility");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(500);
        builder.Property(x => x.EndpointUrl).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.Secret).IsRequired().HasMaxLength(500);

        builder.HasIndex(x => new { x.TenantId, x.Stage, x.IsEnabled })
            .HasDatabaseName("IX_LoginHooks_TenantId_Stage_IsEnabled");
    }
}
