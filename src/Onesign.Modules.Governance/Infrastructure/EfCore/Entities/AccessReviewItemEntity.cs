using Onesign.Modules.Governance.Domain.Enums;

namespace Onesign.Modules.Governance.Infrastructure.EfCore.Entities;

public class AccessReviewItemEntity
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string ResourceType { get; set; } = string.Empty;
    public string ResourceId { get; set; } = string.Empty;
    public string AccessLevel { get; set; } = string.Empty;
    public ReviewDecision Decision { get; set; }
    public Guid? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewComment { get; set; }
    public AccessReviewCampaignEntity? Campaign { get; set; }
}
