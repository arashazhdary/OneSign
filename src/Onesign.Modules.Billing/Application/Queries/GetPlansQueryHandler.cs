using MediatR;
using Onesign.Modules.Billing.Application.DTOs;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Billing.Application.Queries;

public class GetPlansQueryHandler : IRequestHandler<GetPlansQuery, Result<List<PlanDto>>>
{
    private readonly IPlanRepository _planRepository;

    public GetPlansQueryHandler(IPlanRepository planRepository)
    {
        _planRepository = planRepository;
    }

    public async Task<Result<List<PlanDto>>> Handle(GetPlansQuery request, CancellationToken cancellationToken)
    {
        var plans = await _planRepository.GetAllAsync(request.IsActive, cancellationToken);

        var dtos = plans.Select(p => new PlanDto
        {
            Id = p.Id,
            Name = p.Name,
            Code = p.Code,
            Type = p.Type,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            Features = p.Features.Select(f => new PlanFeatureDto
            {
                Id = f.Id,
                PlanId = f.PlanId,
                Key = f.Key,
                Value = f.Value,
                LimitType = f.LimitType
            }).ToList()
        }).ToList();

        return Result.Success(dtos);
    }
}
