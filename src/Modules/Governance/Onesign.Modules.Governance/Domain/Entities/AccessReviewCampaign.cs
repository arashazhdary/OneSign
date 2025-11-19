using Onesign.Modules.Governance.Domain.Enums;

namespace Onesign.Modules.Governance.Domain.Entities;

public class AccessReviewCampaign
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CampaignStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<string> TargetRoles { get; set; } = new();
    public List<string> TargetResources { get; set; } = new();
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<AccessReviewItem> ReviewItems { get; set; } = new List<AccessReviewItem>();
}
