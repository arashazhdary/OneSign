using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Queries;

public class GetPlanByIdQueryHandler : IRequestHandler<GetPlanByIdQuery, Result<PlanDto>>
{
    private readonly IPlanRepository _planRepository;

    public GetPlanByIdQueryHandler(IPlanRepository planRepository)
    {
        _planRepository = planRepository;
    }

    public async Task<Result<PlanDto>> Handle(GetPlanByIdQuery request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.Id, cancellationToken);

        if (plan == null)
        {
            return Result.Failure<PlanDto>("PLAN_NOT_FOUND", $"Plan with ID {request.Id} not found");
        }

        var dto = new PlanDto
        {
            Id = plan.Id,
            Name = plan.Name,
            Code = plan.Code,
            Type = plan.Type,
            IsActive = plan.IsActive,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt,
            Features = plan.Features.Select(f => new PlanFeatureDto
            {
                Id = f.Id,
                PlanId = f.PlanId,
                Key = f.Key,
                Value = f.Value,
                LimitType = f.LimitType
            }).ToList()
        };

        return Result.Success(dto);
    }
}
