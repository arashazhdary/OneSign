using MediatR;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Queries;

public class GetPoliciesQueryHandler : IRequestHandler<GetPoliciesQuery, Result<List<PolicyDefinitionDto>>>
{
    private readonly IPolicyDefinitionRepository _policyRepository;

    public GetPoliciesQueryHandler(IPolicyDefinitionRepository policyRepository)
    {
        _policyRepository = policyRepository;
    }

    public async Task<Result<List<PolicyDefinitionDto>>> Handle(GetPoliciesQuery request, CancellationToken cancellationToken)
    {
        var policies = await _policyRepository.GetByTenantIdAsync(request.TenantId, request.Enabled, cancellationToken);

        var dtos = policies.Select(policy => new PolicyDefinitionDto
        {
            Id = policy.Id,
            TenantId = policy.TenantId,
            Name = policy.Name,
            Description = policy.Description,
            Effect = policy.Effect,
            Priority = policy.Priority,
            Enabled = policy.Enabled,
            CreatedAt = policy.CreatedAt,
            ConditionGroups = policy.ConditionGroups.Select(g => new PolicyConditionGroupDto
            {
                Id = g.Id,
                LogicalOperator = g.LogicalOperator,
                Conditions = g.Conditions.Select(c => new PolicyConditionDto
                {
                    Id = c.Id,
                    SourceType = c.SourceType,
                    SourceKey = c.SourceKey,
                    Operator = c.Operator,
                    Value = c.Value
                }).ToList()
            }).ToList()
        }).ToList();

        return Result.Success(dtos);
    }
}
