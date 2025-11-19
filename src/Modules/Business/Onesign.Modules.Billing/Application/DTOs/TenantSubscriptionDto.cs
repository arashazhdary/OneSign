using Onesign.Modules.Billing.Domain.Enums;

namespace Onesign.Modules.Billing.Application.DTOs;

public class TenantSubscriptionDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid PlanId { get; set; }
    public string? PlanName { get; set; }
    public PlanType? PlanType { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? TrialEndsAt { get; set; }
    public DateTime? CurrentPeriodEndsAt { get; set; }
    public bool IsTrial { get; set; }
    public PlanDto? Plan { get; set; }
}
