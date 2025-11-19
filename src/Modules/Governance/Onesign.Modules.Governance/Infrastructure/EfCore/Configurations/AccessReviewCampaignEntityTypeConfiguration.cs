using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Governance.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Governance.Infrastructure.EfCore.Configurations;

public class AccessReviewCampaignEntityTypeConfiguration : IEntityTypeConfiguration<AccessReviewCampaignEntity>
{
    public void Configure(EntityTypeBuilder<AccessReviewCampaignEntity> builder)
    {
        builder.ToTable("AccessReviewCampaigns");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.TargetRolesJson).HasColumnType("nvarchar(max)");
        builder.Property(x => x.TargetResourcesJson).HasColumnType("nvarchar(max)");
        builder.HasIndex(x => new { x.TenantId, x.Status }).HasDatabaseName("IX_AccessReviewCampaigns_TenantId_Status");
        builder.HasMany(x => x.ReviewItems).WithOne(x => x.Campaign).HasForeignKey(x => x.CampaignId).OnDelete(DeleteBehavior.Cascade);
    }
}
