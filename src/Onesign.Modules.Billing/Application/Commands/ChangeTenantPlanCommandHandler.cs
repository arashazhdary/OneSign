using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Commands;

public class ChangeTenantPlanCommandHandler : IRequestHandler<ChangeTenantPlanCommand, Result<TenantSubscriptionDto>>
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IPlanRepository _planRepository;

    public ChangeTenantPlanCommandHandler(
        ISubscriptionRepository subscriptionRepository,
        IPlanRepository planRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _planRepository = planRepository;
    }

    public async Task<Result<TenantSubscriptionDto>> Handle(ChangeTenantPlanCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _subscriptionRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (subscription == null)
        {
            return Result.Failure<TenantSubscriptionDto>("SUBSCRIPTION_NOT_FOUND", "Tenant does not have a subscription");
        }

        var newPlan = await _planRepository.GetByIdAsync(request.NewPlanId, cancellationToken);
        if (newPlan == null)
        {
            return Result.Failure<TenantSubscriptionDto>("PLAN_NOT_FOUND", $"Plan with ID {request.NewPlanId} not found");
        }

        if (!newPlan.IsActive)
        {
            return Result.Failure<TenantSubscriptionDto>("PLAN_INACTIVE", "Cannot assign an inactive plan");
        }

        subscription.PlanId = request.NewPlanId;
        subscription.UpdatedAt = DateTime.UtcNow;

        await _subscriptionRepository.UpdateAsync(subscription, cancellationToken);

        return Result.Success(new TenantSubscriptionDto
        {
            Id = subscription.Id,
            TenantId = subscription.TenantId,
            PlanId = subscription.PlanId,
            PlanName = newPlan.Name,
            PlanType = newPlan.Type,
            Status = subscription.Status,
            StartedAt = subscription.StartedAt,
            TrialEndsAt = subscription.TrialEndsAt,
            CurrentPeriodEndsAt = subscription.CurrentPeriodEndsAt,
            IsTrial = subscription.IsTrial
        });
    }
}
