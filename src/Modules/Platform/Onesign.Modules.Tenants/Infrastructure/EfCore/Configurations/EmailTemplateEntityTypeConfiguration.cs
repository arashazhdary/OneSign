using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Tenants.Infrastructure.EfCore.Configurations;

public class EmailTemplateEntityTypeConfiguration : IEntityTypeConfiguration<EmailTemplateEntity>
{
    public void Configure(EntityTypeBuilder<EmailTemplateEntity> builder)
    {
        builder.ToTable("EmailTemplates", "tenants");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TenantId)
            .IsRequired();

        builder.Property(e => e.Type)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Subject)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.Body)
            .HasMaxLength(10000);

        builder.Property(e => e.HtmlBody)
            .HasMaxLength(50000);

        builder.Property(e => e.IsEnabled)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt);

        // Create unique index on TenantId + Type (each tenant can only have one template per type)
        builder.HasIndex(e => new { e.TenantId, e.Type })
            .IsUnique();

        // Create index on TenantId for faster lookups
        builder.HasIndex(e => e.TenantId);
    }
}
