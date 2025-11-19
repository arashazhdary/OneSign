using Onesign.Modules.Governance.Domain.Enums;

namespace Onesign.Modules.Governance.Infrastructure.EfCore.Entities;

public class AccessReviewCampaignEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CampaignStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string TargetRolesJson { get; set; } = "[]";
    public string TargetResourcesJson { get; set; } = "[]";
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<AccessReviewItemEntity> ReviewItems { get; set; } = new List<AccessReviewItemEntity>();
}
