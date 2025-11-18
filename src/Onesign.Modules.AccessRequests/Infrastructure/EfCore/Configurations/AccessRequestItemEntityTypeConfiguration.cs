using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.AccessRequests.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccessRequests.Infrastructure.EfCore.Configurations;

public class AccessRequestItemEntityTypeConfiguration : IEntityTypeConfiguration<AccessRequestItemEntity>
{
    public void Configure(EntityTypeBuilder<AccessRequestItemEntity> builder)
    {
        builder.ToTable("AccessRequestItems", "AccessRequests");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.TargetName).IsRequired().HasMaxLength(500);

        builder.HasIndex(x => x.AccessRequestId)
            .HasDatabaseName("IX_AccessRequestItems_AccessRequestId");
    }
}
