using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Governance.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Governance.Infrastructure.EfCore.Configurations;

public class AccessReviewItemEntityTypeConfiguration : IEntityTypeConfiguration<AccessReviewItemEntity>
{
    public void Configure(EntityTypeBuilder<AccessReviewItemEntity> builder)
    {
        builder.ToTable("AccessReviewItems");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ResourceType).IsRequired().HasMaxLength(100);
        builder.Property(x => x.ResourceId).IsRequired().HasMaxLength(200);
        builder.Property(x => x.AccessLevel).HasMaxLength(100);
        builder.Property(x => x.ReviewComment).HasMaxLength(1000);
        builder.HasIndex(x => new { x.CampaignId, x.Decision }).HasDatabaseName("IX_AccessReviewItems_CampaignId_Decision");
    }
}
