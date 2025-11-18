using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Commands;

public class UpdatePlanCommandHandler : IRequestHandler<UpdatePlanCommand, Result<PlanDto>>
{
    private readonly IPlanRepository _planRepository;

    public UpdatePlanCommandHandler(IPlanRepository planRepository)
    {
        _planRepository = planRepository;
    }

    public async Task<Result<PlanDto>> Handle(UpdatePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _planRepository.GetByIdAsync(request.Id, cancellationToken);
        if (plan == null)
        {
            return Result.Failure<PlanDto>("PLAN_NOT_FOUND", $"Plan with ID {request.Id} not found");
        }

        // Check if new code conflicts with another plan
        if (plan.Code != request.Code)
        {
            var existing = await _planRepository.GetByCodeAsync(request.Code, cancellationToken);
            if (existing != null && existing.Id != request.Id)
            {
                return Result.Failure<PlanDto>("PLAN_CODE_EXISTS", $"A plan with code '{request.Code}' already exists");
            }
        }

        plan.Name = request.Name;
        plan.Code = request.Code;
        plan.Type = request.Type;
        plan.IsActive = request.IsActive;
        plan.UpdatedAt = DateTime.UtcNow;
        plan.Features = request.Features.Select(f => new PlanFeature
        {
            Id = f.Id == Guid.Empty ? Guid.NewGuid() : f.Id,
            PlanId = request.Id,
            Key = f.Key,
            Value = f.Value,
            LimitType = f.LimitType
        }).ToList();

        await _planRepository.UpdateAsync(plan, cancellationToken);

        return Result.Success(MapToDto(plan));
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
