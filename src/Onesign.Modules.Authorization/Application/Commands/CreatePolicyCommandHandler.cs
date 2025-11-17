using MediatR;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Commands;

public class CreatePolicyCommandHandler : IRequestHandler<CreatePolicyCommand, Result<PolicyDefinitionDto>>
{
    private readonly IPolicyDefinitionRepository _policyRepository;

    public CreatePolicyCommandHandler(IPolicyDefinitionRepository policyRepository)
    {
        _policyRepository = policyRepository;
    }

    public async Task<Result<PolicyDefinitionDto>> Handle(CreatePolicyCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure<PolicyDefinitionDto>("Policy name is required");

        var policy = new PolicyDefinition
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Effect = request.Effect,
            Priority = request.Priority,
            Enabled = request.Enabled,
            CreatedAt = DateTime.UtcNow,
            ConditionGroups = request.ConditionGroups.Select(g => new PolicyConditionGroup
            {
                Id = Guid.NewGuid(),
                LogicalOperator = g.LogicalOperator,
                Conditions = g.Conditions.Select(c => new PolicyCondition
                {
                    Id = Guid.NewGuid(),
                    SourceType = c.SourceType,
                    SourceKey = c.SourceKey.Trim(),
                    Operator = c.Operator,
                    Value = c.Value.Trim()
                }).ToList()
            }).ToList()
        };

        var created = await _policyRepository.AddAsync(policy, cancellationToken);

        var dto = new PolicyDefinitionDto
        {
            Id = created.Id,
            TenantId = created.TenantId,
            Name = created.Name,
            Description = created.Description,
            Effect = created.Effect,
            Priority = created.Priority,
            Enabled = created.Enabled,
            CreatedAt = created.CreatedAt,
            ConditionGroups = created.ConditionGroups.Select(g => new PolicyConditionGroupDto
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
