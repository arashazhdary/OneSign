using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.IdentityLifecycle.Infrastructure.EfCore.Configurations;

public class LifecycleEventEntityTypeConfiguration : IEntityTypeConfiguration<LifecycleEventEntity>
{
    public void Configure(EntityTypeBuilder<LifecycleEventEntity> builder)
    {
        builder.ToTable("LifecycleEvents", "IdentityLifecycle");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OldSnapshotJson).IsRequired();
        builder.Property(x => x.NewSnapshotJson).IsRequired();
        builder.Property(x => x.ErrorMessage).HasMaxLength(2000);

        builder.HasIndex(x => new { x.TenantId, x.Status, x.CreatedAt })
            .HasDatabaseName("IX_LifecycleEvents_TenantId_Status_CreatedAt");

        builder.HasOne(x => x.HRRecord)
            .WithMany()
            .HasForeignKey(x => x.HRRecordId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
