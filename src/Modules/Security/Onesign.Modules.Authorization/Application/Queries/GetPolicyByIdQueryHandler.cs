using MediatR;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Queries;

public class GetPolicyByIdQueryHandler : IRequestHandler<GetPolicyByIdQuery, Result<PolicyDefinitionDto>>
{
    private readonly IPolicyDefinitionRepository _policyRepository;

    public GetPolicyByIdQueryHandler(IPolicyDefinitionRepository policyRepository)
    {
        _policyRepository = policyRepository;
    }

    public async Task<Result<PolicyDefinitionDto>> Handle(GetPolicyByIdQuery request, CancellationToken cancellationToken)
    {
        var policy = await _policyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (policy == null)
            return Result.Failure<PolicyDefinitionDto>("Policy not found");

        var dto = new PolicyDefinitionDto
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
        };

        return Result.Success(dto);
    }
}
