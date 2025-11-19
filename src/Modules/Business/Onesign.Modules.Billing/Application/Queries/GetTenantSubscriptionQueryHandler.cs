using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Queries;

public class GetTenantSubscriptionQueryHandler : IRequestHandler<GetTenantSubscriptionQuery, Result<TenantSubscriptionDto>>
{
    private readonly ISubscriptionRepository _subscriptionRepository;

    public GetTenantSubscriptionQueryHandler(ISubscriptionRepository subscriptionRepository)
    {
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task<Result<TenantSubscriptionDto>> Handle(GetTenantSubscriptionQuery request, CancellationToken cancellationToken)
    {
        var subscription = await _subscriptionRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        if (subscription == null)
        {
            return Result.Failure<TenantSubscriptionDto>("SUBSCRIPTION_NOT_FOUND", "Tenant does not have a subscription");
        }

        var dto = new TenantSubscriptionDto
        {
            Id = subscription.Id,
            TenantId = subscription.TenantId,
            PlanId = subscription.PlanId,
            PlanName = subscription.Plan?.Name,
            PlanType = subscription.Plan?.Type,
            Status = subscription.Status,
            StartedAt = subscription.StartedAt,
            TrialEndsAt = subscription.TrialEndsAt,
            CurrentPeriodEndsAt = subscription.CurrentPeriodEndsAt,
            IsTrial = subscription.IsTrial,
            Plan = subscription.Plan != null ? new PlanDto
            {
                Id = subscription.Plan.Id,
                Name = subscription.Plan.Name,
                Code = subscription.Plan.Code,
                Type = subscription.Plan.Type,
                IsActive = subscription.Plan.IsActive,
                CreatedAt = subscription.Plan.CreatedAt,
                UpdatedAt = subscription.Plan.UpdatedAt,
                Features = subscription.Plan.Features.Select(f => new PlanFeatureDto
                {
                    Id = f.Id,
                    PlanId = f.PlanId,
                    Key = f.Key,
                    Value = f.Value,
                    LimitType = f.LimitType
                }).ToList()
            } : null
        };

        return Result.Success(dto);
    }
}
