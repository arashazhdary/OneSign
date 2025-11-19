using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Commands;

public class AssignSubscriptionToTenantCommand : IRequest<Result<TenantSubscriptionDto>>
{
    public Guid TenantId { get; set; }
    public Guid PlanId { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
    public DateTime? TrialEndsAt { get; set; }
    public DateTime? CurrentPeriodEndsAt { get; set; }
}
