using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Commands;

public class AssignSubscriptionToTenantCommandHandler : IRequestHandler<AssignSubscriptionToTenantCommand, Result<TenantSubscriptionDto>>
{
    private readonly ISubscriptionRepository _subscriptionRepository;
    private readonly IPlanRepository _planRepository;

    public AssignSubscriptionToTenantCommandHandler(
        ISubscriptionRepository subscriptionRepository,
        IPlanRepository planRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _planRepository = planRepository;
    }

    public async Task<Result<TenantSubscriptionDto>> Handle(AssignSubscriptionToTenantCommand request, CancellationToken cancellationToken)
    {
        // Verify plan exists
        var plan = await _planRepository.GetByIdAsync(request.PlanId, cancellationToken);
        if (plan == null)
        {
            return Result.Failure<TenantSubscriptionDto>("PLAN_NOT_FOUND", $"Plan with ID {request.PlanId} not found");
        }

        // Check if tenant already has a subscription
        var existing = await _subscriptionRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        if (existing != null)
        {
            return Result.Failure<TenantSubscriptionDto>("SUBSCRIPTION_EXISTS", "Tenant already has a subscription. Use update instead.");
        }

        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            PlanId = request.PlanId,
            Status = request.Status,
            StartedAt = DateTime.UtcNow,
            TrialEndsAt = request.TrialEndsAt,
            CurrentPeriodEndsAt = request.CurrentPeriodEndsAt,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _subscriptionRepository.AddAsync(subscription, cancellationToken);

        return Result.Success(MapToDto(created, plan));
    }

    private static TenantSubscriptionDto MapToDto(TenantSubscription subscription, Plan plan)
    {
        return new TenantSubscriptionDto
        {
            Id = subscription.Id,
            TenantId = subscription.TenantId,
            PlanId = subscription.PlanId,
            PlanName = plan.Name,
            PlanType = plan.Type,
            Status = subscription.Status,
            StartedAt = subscription.StartedAt,
            TrialEndsAt = subscription.TrialEndsAt,
            CurrentPeriodEndsAt = subscription.CurrentPeriodEndsAt,
            IsTrial = subscription.IsTrial
        };
    }
}
