using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Domain.Entities;

public class UpgradeRequest
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
}
