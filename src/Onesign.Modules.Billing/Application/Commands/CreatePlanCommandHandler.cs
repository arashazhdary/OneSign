using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Commands;

public class CreatePlanCommandHandler : IRequestHandler<CreatePlanCommand, Result<PlanDto>>
{
    private readonly IPlanRepository _planRepository;

    public CreatePlanCommandHandler(IPlanRepository planRepository)
    {
        _planRepository = planRepository;
    }

    public async Task<Result<PlanDto>> Handle(CreatePlanCommand request, CancellationToken cancellationToken)
    {
        // Check if plan code already exists
        var existing = await _planRepository.GetByCodeAsync(request.Code, cancellationToken);
        if (existing != null)
        {
            return Result.Failure<PlanDto>("PLAN_CODE_EXISTS", $"A plan with code '{request.Code}' already exists");
        }

        var plan = new Plan
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            Features = request.Features.Select(f => new PlanFeature
            {
                Id = Guid.NewGuid(),
                Key = f.Key,
                Value = f.Value,
                LimitType = f.LimitType
            }).ToList()
        };

        var created = await _planRepository.AddAsync(plan, cancellationToken);

        return Result.Success(MapToDto(created));
    }

    private static PlanDto MapToDto(Plan plan)
    {
        return new PlanDto
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
    }
}
