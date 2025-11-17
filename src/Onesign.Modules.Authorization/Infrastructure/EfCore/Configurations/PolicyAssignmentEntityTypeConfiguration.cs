using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Authorization.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Authorization.Infrastructure.EfCore.Configurations;

public class PolicyAssignmentEntityTypeConfiguration : IEntityTypeConfiguration<PolicyAssignmentEntity>
{
    public void Configure(EntityTypeBuilder<PolicyAssignmentEntity> builder)
    {
        builder.ToTable("PolicyAssignments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Order)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Indexes for efficient querying
        builder.HasIndex(x => new { x.TenantId, x.PolicyTargetId, x.Order })
            .HasDatabaseName("IX_PolicyAssignments_TenantId_PolicyTargetId_Order");

        builder.HasIndex(x => x.PolicyDefinitionId)
            .HasDatabaseName("IX_PolicyAssignments_PolicyDefinitionId");

        // Relationships
        builder.HasOne(x => x.PolicyDefinition)
            .WithMany()
            .HasForeignKey(x => x.PolicyDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.PolicyTarget)
            .WithMany()
            .HasForeignKey(x => x.PolicyTargetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
