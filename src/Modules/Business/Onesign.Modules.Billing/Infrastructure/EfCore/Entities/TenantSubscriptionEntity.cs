using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Infrastructure.EfCore.Entities;

public class TenantSubscriptionEntity
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

    public PlanEntity? Plan { get; set; }

    public TenantSubscription ToDomain()
    {
        return new TenantSubscription
        {
            Id = Id,
            TenantId = TenantId,
            PlanId = PlanId,
            Status = Status,
            StartedAt = StartedAt,
            TrialEndsAt = TrialEndsAt,
            CurrentPeriodEndsAt = CurrentPeriodEndsAt,
            CreatedAt = CreatedAt,
            UpdatedAt = UpdatedAt,
            Plan = Plan?.ToDomain()
        };
    }

    public static TenantSubscriptionEntity FromDomain(TenantSubscription subscription)
    {
        return new TenantSubscriptionEntity
        {
            Id = subscription.Id,
            TenantId = subscription.TenantId,
            PlanId = subscription.PlanId,
            Status = subscription.Status,
            StartedAt = subscription.StartedAt,
            TrialEndsAt = subscription.TrialEndsAt,
            CurrentPeriodEndsAt = subscription.CurrentPeriodEndsAt,
            CreatedAt = subscription.CreatedAt,
            UpdatedAt = subscription.UpdatedAt
        };
    }
}
