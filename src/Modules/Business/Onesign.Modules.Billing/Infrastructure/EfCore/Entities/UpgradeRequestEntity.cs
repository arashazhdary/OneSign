using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

public class UpgradeRequestEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid TargetPlanId { get; set; }
    public string? Comments { get; set; }
    public UpgradeRequestStatus Status { get; set; }
    public string RequestedBy { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
    public string? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewComments { get; set; }

    public UpgradeRequest ToDomain()
    {
        return new UpgradeRequest
        {
            Id = Id,
            TenantId = TenantId,
            TargetPlanId = TargetPlanId,
            Comments = Comments,
            Status = Status,
            RequestedBy = RequestedBy,
            RequestedAt = RequestedAt,
            ReviewedBy = ReviewedBy,
            ReviewedAt = ReviewedAt,
            ReviewComments = ReviewComments
        };
    }

    public static UpgradeRequestEntity FromDomain(UpgradeRequest upgradeRequest)
    {
        return new UpgradeRequestEntity
        {
            Id = upgradeRequest.Id,
            TenantId = upgradeRequest.TenantId,
            TargetPlanId = upgradeRequest.TargetPlanId,
            Comments = upgradeRequest.Comments,
            Status = upgradeRequest.Status,
            RequestedBy = upgradeRequest.RequestedBy,
            RequestedAt = upgradeRequest.RequestedAt,
            ReviewedBy = upgradeRequest.ReviewedBy,
            ReviewedAt = upgradeRequest.ReviewedAt,
            ReviewComments = upgradeRequest.ReviewComments
        };
    }
}
