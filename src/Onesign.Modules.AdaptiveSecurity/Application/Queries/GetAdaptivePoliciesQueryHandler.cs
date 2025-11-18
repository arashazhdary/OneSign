using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Queries;

public class GetAdaptivePoliciesQueryHandler : IRequestHandler<GetAdaptivePoliciesQuery, Result<List<AdaptivePolicyDto>>>
{
    private readonly IAdaptivePolicyRepository _repository;

    public GetAdaptivePoliciesQueryHandler(IAdaptivePolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<AdaptivePolicyDto>>> Handle(GetAdaptivePoliciesQuery request, CancellationToken cancellationToken)
    {
        var policies = request.EnabledOnly == true
            ? await _repository.GetEnabledPoliciesAsync(request.TenantId, cancellationToken)
            : await _repository.GetByTenantAsync(request.TenantId, cancellationToken);

        var dtos = policies.Select(p => new AdaptivePolicyDto
        {
            Id = p.Id,
            TenantId = p.TenantId,
            Name = p.Name,
            Description = p.Description,
            Conditions = p.Conditions,
            Actions = p.Actions,
            RiskThreshold = p.RiskThreshold,
            IsEnabled = p.IsEnabled,
            Priority = p.Priority,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
