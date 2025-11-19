using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Domain.Entities;

public class TenantSubscription
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid PlanId { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? TrialEndsAt { get; set; }
    public DateTime? CurrentPeriodEndsAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Plan? Plan { get; set; }

    public bool IsTrial => Status == SubscriptionStatus.Trial &&
                          TrialEndsAt.HasValue &&
                          TrialEndsAt.Value >= DateTime.UtcNow;
}
